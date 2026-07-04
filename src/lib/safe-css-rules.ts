const PATCHED_FLAG = '__vmodaCssRulesPatched'

function isSameOrigin(href: string | null): boolean {
  if (!href) return true
  try {
    const url = new URL(href, window.location.href)
    return url.origin === window.location.origin
  } catch {
    return false
  }
}

function isCrossOriginSheet(sheet: CSSStyleSheet): boolean {
  try {
    const ownerNode = (sheet as any).ownerNode as Element | null
    if (ownerNode && ownerNode instanceof HTMLLinkElement) {
      return !isSameOrigin(ownerNode.href)
    }
  } catch {
    return true
  }
  try {
    const href = (sheet as any).href as string | null
    if (href) return !isSameOrigin(href)
  } catch {
    return true
  }
  return false
}

function safeGetCssRules(originalGetter: () => CSSRuleList): CSSRuleList {
  try {
    return originalGetter.call(this as CSSStyleSheet)
  } catch (err) {
    if (err instanceof DOMException && (err.name === 'SecurityError' || err.code === 18)) {
      return [] as unknown as CSSRuleList
    }
    throw err
  }
}

const CROSS_ORIGIN_PATTERNS = [
  'Not allowed to access cross-origin stylesheet',
  'cssRules',
  'SecurityError',
  'cross-origin stylesheet',
  'CSSStyleSheet.cssRules getter',
  'Cannot access cssRules',
  'insertRule',
  'deleteRule',
]

function isCrossOriginError(...args: unknown[]): boolean {
  const msg = args.map((a) => (a instanceof Error ? a.message : String(a))).join(' ')
  return (
    (CROSS_ORIGIN_PATTERNS.some((p) => msg.includes(p)) && msg.includes('SecurityError')) ||
    msg.includes('cross-origin stylesheet') ||
    msg.includes('CSSStyleSheet.cssRules getter')
  )
}

export function patchCrossOriginStylesheets(): void {
  if (typeof window === 'undefined') return
  if ((window as any)[PATCHED_FLAG]) return
  ;(window as any)[PATCHED_FLAG] = true

  const proto = CSSStyleSheet.prototype

  const cssRulesDescriptor = Object.getOwnPropertyDescriptor(proto, 'cssRules')
  if (cssRulesDescriptor?.get) {
    const originalGetter = cssRulesDescriptor.get
    Object.defineProperty(proto, 'cssRules', {
      get(this: CSSStyleSheet) {
        if (isCrossOriginSheet(this)) return [] as unknown as CSSRuleList
        return safeGetCssRules.call(this, originalGetter)
      },
      configurable: true,
    })
  }

  const rulesDescriptor = Object.getOwnPropertyDescriptor(proto, 'rules')
  if (rulesDescriptor?.get) {
    const originalGetter = rulesDescriptor.get
    Object.defineProperty(proto, 'rules', {
      get(this: CSSStyleSheet) {
        if (isCrossOriginSheet(this)) return [] as unknown as CSSRuleList
        return safeGetCssRules.call(this, originalGetter)
      },
      configurable: true,
    })
  }

  const originalInsertRule = proto.insertRule
  proto.insertRule = function (rule: string, index?: number): number {
    if (isCrossOriginSheet(this)) return 0
    try {
      return index !== undefined
        ? originalInsertRule.call(this, rule, index)
        : originalInsertRule.call(this, rule)
    } catch (err) {
      if (err instanceof DOMException && (err.name === 'SecurityError' || err.code === 18)) return 0
      throw err
    }
  }

  const originalDeleteRule = proto.deleteRule
  proto.deleteRule = function (index: number): void {
    if (isCrossOriginSheet(this)) return
    try {
      originalDeleteRule.call(this, index)
    } catch (err) {
      if (err instanceof DOMException && (err.name === 'SecurityError' || err.code === 18)) return
      throw err
    }
  }

  const originalConsoleError = console.error
  console.error = (...args: unknown[]) => {
    if (isCrossOriginError(...args)) return
    originalConsoleError.apply(console, args as Parameters<typeof console.error>)
  }

  const originalConsoleWarn = console.warn
  console.warn = (...args: unknown[]) => {
    if (isCrossOriginError(...args)) return
    originalConsoleWarn.apply(console, args as Parameters<typeof console.warn>)
  }

  window.addEventListener(
    'error',
    (event) => {
      if (event.error instanceof DOMException && event.error.name === 'SecurityError') {
        const msg = event.error.message || ''
        if (
          msg.includes('cssRules') ||
          msg.includes('cross-origin') ||
          msg.includes('stylesheet')
        ) {
          event.preventDefault()
          event.stopPropagation()
          return true
        }
      }
      if (
        event.message &&
        (event.message.includes('cross-origin stylesheet') ||
          event.message.includes('CSSStyleSheet.cssRules') ||
          (event.message.includes('cssRules') && event.message.includes('SecurityError')))
      ) {
        event.preventDefault()
        event.stopPropagation()
        return true
      }
      return false
    },
    true,
  )

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    if (reason instanceof DOMException && reason.name === 'SecurityError') {
      const msg = reason.message || ''
      if (msg.includes('cssRules') || msg.includes('cross-origin') || msg.includes('stylesheet')) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
  })
}

patchCrossOriginStylesheets()

export function safeGetSheetRules(sheet: CSSStyleSheet): CSSRule[] {
  try {
    if (isCrossOriginSheet(sheet)) return []
    const rules = sheet.cssRules
    return Array.from(rules)
  } catch {
    return []
  }
}

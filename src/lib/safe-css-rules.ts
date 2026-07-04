const PATCHED_FLAG = '__vmodaCssRulesPatched'
const SECURITY_ERROR_PREFIX = 'SecurityError'

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
    if (err instanceof DOMException && (err.name === SECURITY_ERROR_PREFIX || err.code === 18)) {
      return [] as unknown as CSSRuleList
    }
    throw err
  }
}

export function patchCrossOriginStylesheets(): void {
  if (typeof window === 'undefined') return
  if ((window as any)[PATCHED_FLAG]) return
  ;(window as any)[PATCHED_FLAG] = true

  const proto = CSSStyleSheet.prototype

  const cssRulesDescriptor = Object.getOwnPropertyDescriptor(proto, 'cssRules')
  if (cssRulesDescriptor && cssRulesDescriptor.get) {
    const originalCssRulesGetter = cssRulesDescriptor.get
    Object.defineProperty(proto, 'cssRules', {
      get(this: CSSStyleSheet) {
        if (isCrossOriginSheet(this)) {
          return [] as unknown as CSSRuleList
        }
        return safeGetCssRules.call(this, originalCssRulesGetter)
      },
      configurable: true,
    })
  }

  const rulesDescriptor = Object.getOwnPropertyDescriptor(proto, 'rules')
  if (rulesDescriptor && rulesDescriptor.get) {
    const originalRulesGetter = rulesDescriptor.get
    Object.defineProperty(proto, 'rules', {
      get(this: CSSStyleSheet) {
        if (isCrossOriginSheet(this)) {
          return [] as unknown as CSSRuleList
        }
        return safeGetCssRules.call(this, originalRulesGetter)
      },
      configurable: true,
    })
  }

  const originalConsoleError = console.error
  console.error = (...args: unknown[]) => {
    const msg = args.map((a) => (a instanceof Error ? a.message : String(a))).join(' ')
    if (
      msg.includes('Not allowed to access cross-origin stylesheet') ||
      (msg.includes('cssRules') && msg.includes('SecurityError'))
    ) {
      return
    }
    originalConsoleError.apply(console, args as Parameters<typeof console.error>)
  }
}

export function safeGetSheetRules(sheet: CSSStyleSheet): CSSRule[] {
  try {
    if (isCrossOriginSheet(sheet)) return []
    const rules = sheet.cssRules
    return Array.from(rules)
  } catch {
    return []
  }
}

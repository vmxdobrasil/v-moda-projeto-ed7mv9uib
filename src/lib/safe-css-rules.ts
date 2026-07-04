export function patchCrossOriginStylesheets(): void {
  if (typeof window === 'undefined') return
  if ((window as any).__cssRulesPatched) return
  ;(window as any).__cssRulesPatched = true

  const proto = CSSStyleSheet.prototype
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'cssRules')
  if (!descriptor || !descriptor.get) return

  const originalGetter = descriptor.get

  Object.defineProperty(proto, 'cssRules', {
    get(this: CSSStyleSheet) {
      try {
        return originalGetter.call(this)
      } catch {
        return []
      }
    },
    configurable: true,
  })
}

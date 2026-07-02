const AFFILIATE_COOKIE = 'vmoda_affiliate_ref'
const AFFILIATE_SRC_COOKIE = 'vmoda_affiliate_src'
const UTM_COOKIE = 'vmoda_utm'
const THIRTY_DAYS_SEC = 30 * 24 * 60 * 60

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

export function captureAffiliateRef() {
  const params = new URLSearchParams(window.location.search)
  const ref = params.get('ref')
  if (!ref) return

  const existingRef = getCookie(AFFILIATE_COOKIE)
  setCookie(AFFILIATE_COOKIE, ref, THIRTY_DAYS_SEC)
  sessionStorage.setItem(AFFILIATE_COOKIE, ref)

  const src = params.get('src') || 'social_profile'
  if (['whatsapp_group', 'social_profile'].includes(src)) {
    setCookie(AFFILIATE_SRC_COOKIE, src, THIRTY_DAYS_SEC)
    sessionStorage.setItem(AFFILIATE_SRC_COOKIE, src)
  }

  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign']
    .map((k) => `${k}=${params.get(k) || ''}`)
    .join('|')
  if (utmParams) {
    setCookie(UTM_COOKIE, utmParams, THIRTY_DAYS_SEC)
  }

  if (existingRef !== ref) {
    trackClick(ref, window.location.href, params.get('short') || undefined)
  }
}

export function getAffiliateRef(): string {
  return getCookie(AFFILIATE_COOKIE) || sessionStorage.getItem(AFFILIATE_COOKIE) || ''
}

export function getAffiliateSrc(): string {
  return (
    getCookie(AFFILIATE_SRC_COOKIE) ||
    sessionStorage.getItem(AFFILIATE_SRC_COOKIE) ||
    'social_profile'
  )
}

export function getStoredUTM(): Record<string, string> {
  const raw = getCookie(UTM_COOKIE)
  if (!raw) return {}
  const params: Record<string, string> = {}
  raw.split('|').forEach((pair) => {
    const [k, v] = pair.split('=')
    if (k && v) params[k] = v
  })
  return params
}

export function trackClick(affiliateCode: string, targetUrl: string, shortCode?: string) {
  try {
    fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/affiliate/track-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        affiliate_code: affiliateCode,
        target_url: targetUrl,
        short_code: shortCode || '',
      }),
    })
  } catch {
    // Silent fail — tracking is best-effort
  }
}

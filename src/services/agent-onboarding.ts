export type UtmSource = 'whatsapp' | 'instagram' | 'email' | 'landing_page'

export interface OnboardingLinkParams {
  affiliateCode: string
  utmSource: UtmSource
  utmCampaign?: string
}

export function generateOnboardingLink(params: OnboardingLinkParams): string {
  const base = window.location.origin
  const url = new URL(`${base}/signup`)
  url.searchParams.set('ref', params.affiliateCode)
  url.searchParams.set('utm_source', params.utmSource)
  url.searchParams.set('utm_medium', 'agent_referral')
  if (params.utmCampaign) {
    url.searchParams.set('utm_campaign', params.utmCampaign)
  }
  return url.toString()
}

export const UTM_SOURCE_LABELS: Record<UtmSource, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  email: 'Email',
  landing_page: 'Landing Page',
}

export const UTM_SOURCE_ICONS: Record<UtmSource, string> = {
  whatsapp: 'MessageCircle',
  instagram: 'Instagram',
  email: 'Mail',
  landing_page: 'Globe',
}

import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export function GlobalTracking() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    const src = searchParams.get('src')

    if (ref) {
      sessionStorage.setItem('vmoda_affiliate_ref', ref)
    }
    if (src) {
      sessionStorage.setItem('vmoda_affiliate_src', src)
    }
  }, [searchParams])

  return null
}

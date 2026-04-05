import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export function GlobalTracking() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      sessionStorage.setItem('vmoda_affiliate_ref', ref)
    }
  }, [searchParams])

  return null
}

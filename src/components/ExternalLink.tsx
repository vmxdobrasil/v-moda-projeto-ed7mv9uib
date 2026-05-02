import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
  /**
   * If true, forces the link to break out of any iframe and load at the top level
   * using window.top.location.href. Useful for external platforms that block iframe rendering
   * via X-Frame-Options or CSP.
   */
  forceTopBreakout?: boolean
}

export function ExternalLink({
  href,
  children,
  className,
  forceTopBreakout = false,
  onClick,
  ...props
}: ExternalLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (forceTopBreakout) {
      e.preventDefault()
      e.stopPropagation()
      try {
        if (window.top) {
          window.top.location.href = href
        } else {
          window.location.href = href
        }
      } catch (err) {
        // Fallback if cross-origin policy prevents accessing window.top
        window.location.href = href
      }
    }

    if (onClick) {
      onClick(e)
    }
  }

  return (
    <a
      href={href}
      target={forceTopBreakout ? '_top' : '_blank'}
      rel="noopener noreferrer"
      referrerPolicy="no-referrer"
      className={cn('', className)}
      onClick={forceTopBreakout ? handleClick : onClick}
      {...props}
    >
      {children}
    </a>
  )
}

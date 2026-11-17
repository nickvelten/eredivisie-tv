'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'

/**
 * One click listener for links and buttons marked with data-event (and
 * optional data-event-label), so server components can be tracked too.
 */
export function AnalyticsListener() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-event]')
      if (!el) return
      track(el.dataset.event!, { label: el.dataset.eventLabel, page: window.location.pathname })
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])
  return null
}

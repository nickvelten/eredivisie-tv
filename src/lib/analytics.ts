'use client'

import { sendGAEvent } from '@next/third-parties/google'

/**
 * Sends a GA4 event when Google Analytics is loaded (NEXT_PUBLIC_GA_ID set);
 * a no-op otherwise. Events: club_select, search, search_select,
 * calendar_add, odds_click, compare, widget_embed.
 */
export function track(event: string, params: Record<string, string | number | undefined> = {}) {
  try {
    if (typeof window === 'undefined' || !('gtag' in window || 'dataLayer' in window)) return
    sendGAEvent('event', event, params)
  } catch {}
}

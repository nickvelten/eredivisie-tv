'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export const CONSENT_KEY = 'consent'
const OPEN_EVENT = 'consent:open'

type Choice = 'granted' | 'denied'

function updateConsent(choice: Choice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice)
  } catch {}
  const w = window as unknown as { gtag?: (...args: unknown[]) => void }
  w.gtag?.('consent', 'update', { analytics_storage: choice })
}

/**
 * Asks once for permission to use analytics cookies (Google Consent Mode v2:
 * everything is denied until the visitor accepts). The choice is kept in
 * localStorage and can be changed via "Cookie-instellingen" in the footer.
 */
export function ConsentBanner() {
  const [open, setOpen] = useState(false)
  const en = usePathname()?.startsWith('/en') ?? false

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(CONSENT_KEY)
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the choice lives in localStorage, only readable after mount
    if (!stored) setOpen(true)
    const reopen = () => setOpen(true)
    window.addEventListener(OPEN_EVENT, reopen)
    return () => window.removeEventListener(OPEN_EVENT, reopen)
  }, [])

  if (!open) return null

  const choose = (choice: Choice) => {
    updateConsent(choice)
    setOpen(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className={`fixed inset-x-4 ${en ? 'bottom-4' : 'bottom-20'} z-[70] sm:bottom-4 mx-auto max-w-lg rounded-2xl bg-card p-4 shadow-2xl ring-1 ring-border sm:p-5`}
    >
      <p className="text-sm font-bold text-foreground">{en ? 'Cookies for statistics' : 'Cookies voor statistieken'}</p>
      <p className="mt-1 text-sm text-muted">
        {en
          ? 'May we keep anonymous visitor statistics with Google Analytics? It shows us which pages are useful. '
          : 'Mogen we anonieme bezoekersstatistieken bijhouden met Google Analytics? Zo zien we welke pagina\'s nuttig zijn. Je club en thema onthouden we altijd, die blijven op je eigen apparaat. '}
        <Link href="/privacy" className="font-semibold text-accent hover:underline">Privacy</Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => choose('granted')}
          className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-accent/90"
        >
          {en ? 'Accept' : 'Akkoord'}
        </button>
        <button
          type="button"
          onClick={() => choose('denied')}
          className="rounded-full bg-card px-4 py-2 text-sm font-bold text-foreground ring-1 ring-border hover:text-accent"
        >
          {en ? 'Decline' : 'Weigeren'}
        </button>
      </div>
    </div>
  )
}

/** Footer link that reopens the banner. */
export function ConsentSettingsButton() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className="underline transition-colors hover:text-foreground">
      Cookie-instellingen
    </button>
  )
}

/** Runs in <head> before Google Analytics loads: deny by default, restore an earlier "yes". */
export const CONSENT_DEFAULT_SCRIPT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}(function(){var c=null;try{c=localStorage.getItem('${CONSENT_KEY}')}catch(e){}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:c==='granted'?'granted':'denied',wait_for_update:500})})()`

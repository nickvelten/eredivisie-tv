'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { track } from '@/lib/analytics'

const VISITS_KEY = 'visits'
const DISMISSED_KEY = 'installDismissed'

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

/**
 * Registers the service worker and, from the second visit on, offers to put
 * the site on the home screen: the native prompt on Android/Chrome, a short
 * instruction on iPhone. Dismissed once means gone for good.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})

    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
    if (standalone || read(DISMISSED_KEY)) return

    // Count a visit once per browser session
    let visits = Number(read(VISITS_KEY) ?? '0')
    try {
      if (!sessionStorage.getItem('counted')) {
        visits += 1
        write(VISITS_KEY, String(visits))
        sessionStorage.setItem('counted', '1')
      }
    } catch {}
    if (visits < 2) return

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && /safari/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- platform is only known in the browser
    if (isIos) setIos(true)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (!deferred && !ios) return null

  const dismiss = () => {
    write(DISMISSED_KEY, '1')
    setDeferred(null)
    setIos(false)
  }

  return (
    <div role="dialog" aria-label="Zet op beginscherm" className="fixed inset-x-4 bottom-20 z-[65] mx-auto flex max-w-md items-start gap-3 rounded-2xl bg-card p-4 shadow-2xl ring-1 ring-border sm:bottom-4">
      <Image src="/icon-192.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">Eredivisie.tv op je beginscherm</p>
        <p className="mt-0.5 text-xs text-muted">
          {ios ? (
            <>Tik op <strong>Deel</strong> en kies <strong>Zet op beginscherm</strong>. Dan kun je ook meldingen voor je club aanzetten.</>
          ) : (
            <>Eén tik naar de wedstrijden van vandaag, als een app.</>
          )}
        </p>
        <div className="mt-2 flex gap-2">
          {deferred && (
            <button
              type="button"
              onClick={async () => {
                await deferred.prompt()
                const { outcome } = await deferred.userChoice
                track('pwa_install', { outcome })
                dismiss()
              }}
              className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white hover:bg-accent/90"
            >
              Installeren
            </button>
          )}
          <button type="button" onClick={dismiss} className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted ring-1 ring-border hover:text-foreground">
            {ios ? 'Begrepen' : 'Niet nu'}
          </button>
        </div>
      </div>
    </div>
  )
}

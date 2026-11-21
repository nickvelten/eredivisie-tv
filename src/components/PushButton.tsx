'use client'

import { useEffect, useState } from 'react'
import { Club } from '@/data/types'
import { track } from '@/lib/analytics'

const STORAGE_KEY = 'pushClub'
// Set at build time when the blob store (and so push) is configured
const ENABLED = process.env.NEXT_PUBLIC_PUSH_ENABLED === '1'

type State = 'hidden' | 'install-first' | 'off' | 'on' | 'busy' | 'denied'

function base64ToUint8(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(padded)
  const out = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function BellIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 003.4 0" />
    </svg>
  )
}

/**
 * Notifications for the favourite club: a reminder before kickoff and the
 * final score. Needs no account; on iPhone the site must be on the home
 * screen first (Apple only allows web push for installed web apps).
 */
export function PushButton({ club, onHero = false }: { club: Club; onHero?: boolean }) {
  const [state, setState] = useState<State>('hidden')

  useEffect(() => {
    let next: State
    if (!ENABLED || !('serviceWorker' in navigator)) next = 'hidden'
    else if (!('PushManager' in window) || !('Notification' in window)) next = isIos() && !isStandalone() ? 'install-first' : 'hidden'
    else if (Notification.permission === 'denied') next = 'denied'
    else {
      let stored: string | null = null
      try {
        stored = localStorage.getItem(STORAGE_KEY)
      } catch {}
      next = stored === club.id && Notification.permission === 'granted' ? 'on' : 'off'
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser capabilities are only known after mount
    setState(next)
  }, [club.id])

  if (state === 'hidden') return null

  async function subscribe() {
    setState('busy')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'off')
        return
      }
      const keyRes = await fetch('/api/push/key')
      if (!keyRes.ok) throw new Error('no key')
      const { publicKey } = (await keyRes.json()) as { publicKey: string }
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToUint8(publicKey) }))
      let previous: string | null = null
      try {
        previous = localStorage.getItem(STORAGE_KEY)
      } catch {}
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), clubId: club.id, previousClubId: previous }),
      })
      if (!res.ok) throw new Error(String(res.status))
      try {
        localStorage.setItem(STORAGE_KEY, club.id)
      } catch {}
      track('push_on', { club: club.slug })
      setState('on')
    } catch {
      setState('off')
    }
  }

  async function unsubscribe() {
    setState('busy')
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js')
      const sub = await reg?.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint, clubId: club.id }),
        }).catch(() => {})
        await sub.unsubscribe()
      }
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {}
      track('push_off', { club: club.slug })
    } finally {
      setState('off')
    }
  }

  const cls = onHero
    ? 'inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-inherit ring-1 ring-white/40 backdrop-blur-sm transition-all hover:bg-white/25 disabled:opacity-60'
    : 'inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-border transition-all hover:text-accent hover:ring-accent/40 hover:shadow-md disabled:opacity-60'

  if (state === 'install-first') {
    return (
      <span className={`${cls} cursor-default`} title="Tik op Deel en kies Zet op beginscherm. Open de site daarna vanaf je beginscherm.">
        <BellIcon on={false} /> Meldingen: zet de site eerst op je beginscherm
      </span>
    )
  }
  if (state === 'denied') {
    return (
      <span className={`${cls} cursor-default`} title="Je hebt meldingen voor deze site geblokkeerd. Zet ze aan in de instellingen van je browser.">
        <BellIcon on={false} /> Meldingen geblokkeerd
      </span>
    )
  }
  return (
    <button
      type="button"
      onClick={state === 'on' ? unsubscribe : subscribe}
      disabled={state === 'busy'}
      aria-pressed={state === 'on'}
      className={cls}
      title={state === 'on' ? `Meldingen voor ${club.name} uitzetten` : `Melding voor de aftrap en de eindstand van ${club.name}`}
    >
      <BellIcon on={state === 'on'} />
      {state === 'on' ? 'Meldingen aan' : state === 'busy' ? 'Even geduld…' : 'Meldingen voor aftrap en eindstand'}
    </button>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { enPathFor } from '@/lib/i18n'

const KEY = 'enHintDismissed'

/** A dismissible "View in English" hint for visitors whose browser does not ask for Dutch. No redirect. */
export function EnglishHint() {
  const path = usePathname() ?? '/'
  const [show, setShow] = useState(false)
  const en = enPathFor(path)

  useEffect(() => {
    try {
      const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
      const dutch = langs.some((l) => /^(nl|fy|li)\b/i.test(l))
      // eslint-disable-next-line react-hooks/set-state-in-effect -- browser languages are only known after mount
      if (!dutch && !localStorage.getItem(KEY)) setShow(true)
    } catch {
      // Storage unavailable: stay quiet
    }
  }, [])

  if (!show || !en) return null

  const dismiss = () => {
    setShow(false)
    try {
      localStorage.setItem(KEY, '1')
    } catch {}
  }

  return (
    <div lang="en" className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-2.5 text-sm shadow-sm ring-1 ring-border">
      <Link href={en} hrefLang="en" className="font-semibold text-accent hover:underline">
        View this page in English →
      </Link>
      <button type="button" onClick={dismiss} aria-label="Dismiss" className="text-muted hover:text-foreground">✕</button>
    </div>
  )
}

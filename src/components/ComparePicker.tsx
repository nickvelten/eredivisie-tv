'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useId, useState } from 'react'
import type { SearchItem } from '@/lib/search-shared'
import { track } from '@/lib/analytics'

/** Two player inputs with suggestions; navigates to /vergelijk/a-vs-b. */
export function ComparePicker({ initialA = '', initialB = '' }: { initialA?: string; initialB?: string }) {
  const router = useRouter()
  const listId = useId()
  const [players, setPlayers] = useState<SearchItem[]>([])
  const [a, setA] = useState(initialA)
  const [b, setB] = useState(initialB)

  useEffect(() => {
    fetch('/api/zoek-index')
      .then((r) => (r.ok ? r.json() : []))
      .then((items: SearchItem[]) => setPlayers(items.filter((i) => i.type === 'speler')))
      .catch(() => {})
  }, [])

  const slugFor = (name: string) => players.find((p) => p.title.toLowerCase() === name.trim().toLowerCase())?.href.replace('/speler/', '')
  const sa = slugFor(a)
  const sb = slugFor(b)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (sa && sb && sa !== sb) track('compare', { players: [sa, sb].sort().join(' vs ') })
        if (sa && sb && sa !== sb) router.push(`/vergelijk/${[sa, sb].sort().join('-vs-')}`)
      }}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <datalist id={listId}>
        {players.map((p) => (
          <option key={p.href} value={p.title}>{p.subtitle}</option>
        ))}
      </datalist>
      <input list={listId} value={a} onChange={(e) => setA(e.target.value)} placeholder="Speler 1" aria-label="Speler 1" className="h-11 min-w-0 flex-1 rounded-lg bg-card px-4 text-sm text-foreground ring-1 ring-border outline-none focus:ring-2 focus:ring-accent" />
      <span className="text-center text-xs font-bold uppercase text-muted">vs</span>
      <input list={listId} value={b} onChange={(e) => setB(e.target.value)} placeholder="Speler 2" aria-label="Speler 2" className="h-11 min-w-0 flex-1 rounded-lg bg-card px-4 text-sm text-foreground ring-1 ring-border outline-none focus:ring-2 focus:ring-accent" />
      <button type="submit" disabled={!sa || !sb || sa === sb} className="h-11 rounded-lg bg-accent px-5 text-sm font-bold text-white disabled:opacity-40">
        Vergelijk
      </button>
    </form>
  )
}

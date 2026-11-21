'use client'

import { useEffect, useState } from 'react'
import { track } from '@/lib/analytics'

export type PredictMatch = { id: string; home: string; away: string; finished: boolean; locked: boolean; outcome?: Pick }
type Pick = '1' | 'X' | '2'

const PICKS: Pick[] = ['1', 'X', '2']

/** 1/X/2 per match, kept in this browser only. Scores itself once the results are in. */
export function RoundPredictor({ round, matches }: { round: number; matches: PredictMatch[] }) {
  const key = `voorspelling:${round}`
  const [picks, setPicks] = useState<Record<string, Pick>>({})

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read once after mount, localStorage is client-only
      if (saved) setPicks(JSON.parse(saved))
    } catch {
      // Storage unavailable
    }
  }, [key])

  function choose(id: string, pick: Pick) {
    const nextPicks = { ...picks, [id]: pick }
    setPicks(nextPicks)
    if (Object.keys(picks).length === 0) track('predict_start', { round })
    try {
      localStorage.setItem(key, JSON.stringify(nextPicks))
    } catch {
      // Storage unavailable
    }
  }

  const scored = matches.filter((m) => m.finished && m.outcome && picks[m.id])
  const correct = scored.filter((m) => picks[m.id] === m.outcome).length
  const open = matches.filter((m) => !m.locked)

  if (open.length === 0 && scored.length === 0) return null

  return (
    <section className="w-full pb-8">
      <h2 className="mb-1 text-2xl font-extrabold text-foreground">Voorspel de speelronde</h2>
      <p className="mb-4 text-sm text-muted">
        Kies per wedstrijd 1 (thuis), X (gelijk) of 2 (uit). Je voorspelling blijft alleen in deze browser.
        {scored.length > 0 && <strong className="text-foreground"> Je score: {correct} van {scored.length} goed.</strong>}
      </p>
      <ul className="divide-y divide-border rounded-xl bg-card shadow-sm ring-1 ring-border">
        {matches.map((m) => {
          const mine = picks[m.id]
          const right = m.finished && mine && m.outcome === mine
          const wrong = m.finished && mine && m.outcome !== mine
          return (
            <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                {m.home} – {m.away}
                {right && <span className="ml-2 text-emerald-600">✓</span>}
                {wrong && <span className="ml-2 text-red-600">✗</span>}
              </span>
              <span className="flex shrink-0 gap-1" role="group" aria-label={`Voorspelling ${m.home} – ${m.away}`}>
                {PICKS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    disabled={m.locked}
                    aria-pressed={mine === p}
                    onClick={() => choose(m.id, p)}
                    className={`h-8 w-9 rounded-md text-sm font-bold ring-1 transition-colors disabled:cursor-not-allowed ${
                      mine === p ? 'bg-accent text-white ring-accent' : m.locked && m.outcome === p ? 'bg-emerald-500/15 text-foreground ring-emerald-500/40' : 'bg-background text-foreground ring-border hover:ring-accent/40 disabled:opacity-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

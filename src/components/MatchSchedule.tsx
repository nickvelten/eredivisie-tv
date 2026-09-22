'use client'

import { useState } from 'react'
import { Matchweek } from '@/data/types'
import { formatDutchDate, groupMatchesByDate } from '@/lib/utils'
import { MatchCard } from './MatchCard'

export function MatchSchedule({ matchweeks }: { matchweeks: Matchweek[] }) {
  const [weekIndex, setWeekIndex] = useState(() => {
    const idx = matchweeks.findIndex((mw) =>
      mw.matches.some((m) => m.status === 'scheduled' || m.status === 'live')
    )
    return idx >= 0 ? idx : matchweeks.length - 1
  })

  if (matchweeks.length === 0) {
    return (
      <section id="programma" className="mx-auto w-full max-w-5xl px-4 py-10">
        <h2 className="mb-4 text-2xl font-extrabold text-foreground">Programma</h2>
        <p className="text-sm text-muted">Geen wedstrijden beschikbaar.</p>
      </section>
    )
  }

  const week = matchweeks[weekIndex]
  const grouped = groupMatchesByDate(week.matches)

  return (
    <section id="programma" className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => setWeekIndex((i) => Math.max(0, i - 1))}
          disabled={weekIndex === 0}
          className="rounded-lg bg-card px-4 py-2 text-sm font-medium text-muted shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:text-foreground disabled:opacity-30 disabled:hover:shadow-sm"
        >
          ← Vorige
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-foreground">Programma</h2>
          <p className="text-xs text-muted-light">{week.label}</p>
        </div>
        <button
          onClick={() => setWeekIndex((i) => Math.min(matchweeks.length - 1, i + 1))}
          disabled={weekIndex === matchweeks.length - 1}
          className="rounded-lg bg-card px-4 py-2 text-sm font-medium text-muted shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:text-foreground disabled:opacity-30 disabled:hover:shadow-sm"
        >
          Volgende →
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {Array.from(grouped.entries()).map(([dateKey, matches]) => (
          <div key={dateKey}>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-accent/20" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-accent">
                {formatDutchDate(matches[0].date)}
              </h3>
              <div className="h-px flex-1 bg-accent/20" />
            </div>
            <div className="flex flex-col gap-2.5">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

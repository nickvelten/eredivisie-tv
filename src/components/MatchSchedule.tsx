'use client'

import { useState } from 'react'
import { matchweeks } from '@/data/matches'
import { formatDutchDate, groupMatchesByDate } from '@/lib/utils'
import { MatchCard } from './MatchCard'

export function MatchSchedule() {
  const [weekIndex, setWeekIndex] = useState(() => {
    const idx = matchweeks.findIndex((mw) =>
      mw.matches.some((m) => m.status === 'scheduled' || m.status === 'live')
    )
    return idx >= 0 ? idx : matchweeks.length - 1
  })

  const week = matchweeks[weekIndex]
  const grouped = groupMatchesByDate(week.matches)

  return (
    <section id="programma" className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setWeekIndex((i) => Math.max(0, i - 1))}
          disabled={weekIndex === 0}
          className="rounded-lg bg-card px-3 py-1.5 text-sm text-muted transition-colors hover:bg-card-hover hover:text-foreground disabled:opacity-30"
        >
          ← Vorige
        </button>
        <h2 className="text-xl font-bold text-foreground">
          Speelronde {week.number}
        </h2>
        <button
          onClick={() => setWeekIndex((i) => Math.min(matchweeks.length - 1, i + 1))}
          disabled={weekIndex === matchweeks.length - 1}
          className="rounded-lg bg-card px-3 py-1.5 text-sm text-muted transition-colors hover:bg-card-hover hover:text-foreground disabled:opacity-30"
        >
          Volgende →
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {Array.from(grouped.entries()).map(([dateKey, matches]) => (
          <div key={dateKey}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              {formatDutchDate(matches[0].date)}
            </h3>
            <div className="flex flex-col gap-2">
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

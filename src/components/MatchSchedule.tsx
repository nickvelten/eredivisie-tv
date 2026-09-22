'use client'

import { useState } from 'react'
import { Matchweek } from '@/data/types'
import { formatDutchDate, groupMatchesByDate } from '@/lib/utils'
import { MatchCard, MatchGrid } from './MatchCard'
import { WeekNav } from './WeekNav'

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
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-foreground">Programma tijdelijk niet beschikbaar</p>
          <p className="mt-1 text-sm text-muted">De wedstrijddata van ESPN kon niet worden geladen. Probeer het over een paar minuten opnieuw.</p>
        </div>
      </section>
    )
  }

  const week = matchweeks[weekIndex]
  const grouped = groupMatchesByDate(week.matches)

  return (
    <section id="programma" className="mx-auto w-full max-w-5xl px-4 py-10">
      <WeekNav
        title="Programma"
        week={week}
        index={weekIndex}
        count={matchweeks.length}
        onChange={setWeekIndex}
      />

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
            <MatchGrid>
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </MatchGrid>
          </div>
        ))}
      </div>
    </section>
  )
}

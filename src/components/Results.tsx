'use client'

import { useState } from 'react'
import { Matchweek } from '@/data/types'
import { formatDutchDate, groupMatchesByDate } from '@/lib/utils'
import { MatchCard, MatchGrid } from './MatchCard'
import { WeekNav } from './WeekNav'

export function Results({ matchweeks }: { matchweeks: Matchweek[] }) {
  // Only matchweeks that have finished matches
  const finishedWeeks = matchweeks
    .map((mw) => ({ ...mw, matches: mw.matches.filter((m) => m.status === 'finished') }))
    .filter((mw) => mw.matches.length > 0)

  const [weekIndex, setWeekIndex] = useState(() => Math.max(0, finishedWeeks.length - 1))

  if (finishedWeeks.length === 0) return null

  const week = finishedWeeks[Math.min(weekIndex, finishedWeeks.length - 1)]
  const grouped = groupMatchesByDate(week.matches)

  return (
    <section id="uitslagen" className="mx-auto w-full max-w-5xl px-4 py-10">
      <WeekNav
        title="Uitslagen"
        week={week}
        index={weekIndex}
        count={finishedWeeks.length}
        onChange={setWeekIndex}
      />

      <div className="flex flex-col gap-6">
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

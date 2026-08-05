'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Matchweek } from '@/data/types'
import { formatDutchDate, groupMatchesByDate } from '@/lib/utils'
import { useFavoriteClub } from '@/lib/favorite-club'

export function Results({ matchweeks }: { matchweeks: Matchweek[] }) {
  const { favoriteId } = useFavoriteClub()
  // Filter to only matchweeks that have finished matches
  const finishedWeeks = matchweeks
    .map((mw) => ({
      ...mw,
      matches: mw.matches.filter((m) => m.status === 'finished'),
    }))
    .filter((mw) => mw.matches.length > 0)

  const [weekIndex, setWeekIndex] = useState(() => Math.max(0, finishedWeeks.length - 1))

  if (finishedWeeks.length === 0) return null

  const week = finishedWeeks[weekIndex]
  const grouped = groupMatchesByDate(week.matches)

  return (
    <section id="uitslagen" className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => setWeekIndex((i) => Math.max(0, i - 1))}
          disabled={weekIndex === 0}
          className="rounded-lg bg-card px-4 py-2 text-sm font-medium text-muted shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:text-foreground disabled:opacity-30 disabled:hover:shadow-sm"
        >
          ← Vorige
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-foreground">Uitslagen</h2>
          <p className="text-xs text-muted-light">Speelronde {week.number}</p>
        </div>
        <button
          onClick={() => setWeekIndex((i) => Math.min(finishedWeeks.length - 1, i + 1))}
          disabled={weekIndex === finishedWeeks.length - 1}
          className="rounded-lg bg-card px-4 py-2 text-sm font-medium text-muted shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:text-foreground disabled:opacity-30 disabled:hover:shadow-sm"
        >
          Volgende →
        </button>
      </div>

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
            <div className="flex flex-col gap-2">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className={`flex items-center rounded-xl bg-card px-4 py-3 shadow-sm sm:px-5 ${
                    favoriteId !== null &&
                    (match.homeTeam.id === favoriteId || match.awayTeam.id === favoriteId)
                      ? 'ring-2 ring-accent/60'
                      : 'ring-1 ring-border'
                  }`}
                >
                  <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
                    <span className="truncate text-xs font-bold text-foreground sm:text-sm">
                      {match.homeTeam.name}
                    </span>
                    <Image
                      src={match.homeTeam.logo}
                      alt={match.homeTeam.name}
                      width={24}
                      height={24}
                      className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                    />
                  </div>
                  <div className="mx-3 shrink-0 sm:mx-5">
                    {match.score ? (
                      <span className="rounded-lg bg-foreground/5 px-3 py-1 text-sm font-extrabold text-foreground sm:px-4 sm:text-base">
                        {match.score.home} - {match.score.away}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </div>
                  <div className="flex flex-1 items-center gap-2 sm:gap-3">
                    <Image
                      src={match.awayTeam.logo}
                      alt={match.awayTeam.name}
                      width={24}
                      height={24}
                      className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
                    />
                    <span className="truncate text-xs font-bold text-foreground sm:text-sm">
                      {match.awayTeam.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

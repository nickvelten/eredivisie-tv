'use client'

import { Match } from '@/data/types'
import { useLiveMatch } from '@/lib/live-scores'
import { formatTime } from '@/lib/utils'
import { KickoffCountdown } from './KickoffCountdown'

/** Kickoff time, or the score and clock, on the match page; follows the live poll. */
export function LiveCentre({ match: initial }: { match: Match }) {
  const match = useLiveMatch(initial)
  return (
    <div className="flex flex-col items-center gap-2">
      {match.status === 'scheduled' ? (
        <>
          <span className="rounded-xl bg-accent-light px-4 py-2 text-3xl font-extrabold tabular-nums text-accent sm:text-4xl">{formatTime(match.date)}</span>
          <KickoffCountdown date={match.date} />
        </>
      ) : (
        <>
          <span className="text-4xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-5xl">
            {match.score?.home ?? 0}<span className="mx-2 text-muted-light">–</span>{match.score?.away ?? 0}
          </span>
          {match.status === 'live' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-white">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              {match.clock ?? 'Live'}
            </span>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-light">Eindstand</span>
          )}
        </>
      )}
    </div>
  )
}

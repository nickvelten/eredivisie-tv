'use client'

import Image from 'next/image'
import { Match } from '@/data/types'
import { formatTime } from '@/lib/utils'
import { useFavoriteClub } from '@/lib/favorite-club'
import { BroadcastBadge } from './BroadcastBadge'

const UNIBET_URL = 'https://www.unibet.nl/betting/sports/filter/football/netherlands/eredivisie'

export function MatchCard({ match }: { match: Match }) {
  const { favoriteId } = useFavoriteClub()
  const isFavorite =
    favoriteId !== null && (match.homeTeam.id === favoriteId || match.awayTeam.id === favoriteId)

  return (
    <div
      className={`rounded-xl bg-card shadow-sm transition-shadow hover:shadow-md ${
        isFavorite ? 'ring-2 ring-accent/60' : 'ring-1 ring-border'
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image src={match.homeTeam.logo} alt={match.homeTeam.name} width={30} height={30} className="h-5 w-5 shrink-0 sm:h-[30px] sm:w-[30px]" />
          <span className="truncate text-xs font-bold text-foreground sm:text-sm">{match.homeTeam.name}</span>
          <span className="shrink-0 text-[10px] font-medium text-muted-light sm:text-xs">vs</span>
          <span className="truncate text-xs font-bold text-foreground sm:text-sm">{match.awayTeam.name}</span>
          <Image src={match.awayTeam.logo} alt={match.awayTeam.name} width={30} height={30} className="h-5 w-5 shrink-0 sm:h-[30px] sm:w-[30px]" />
        </div>
        <div className="shrink-0">
          {match.status === 'finished' && match.score ? (
            <span className="rounded-md bg-foreground/5 px-2 py-0.5 text-xs font-bold text-foreground sm:px-2.5 sm:py-1 sm:text-sm">
              {match.score.home} - {match.score.away}
            </span>
          ) : match.status === 'live' ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="animate-pulse rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white sm:px-2 sm:text-[10px]">Live</span>
              {match.score && (
                <span className="text-xs font-bold text-foreground sm:text-sm">
                  {match.score.home} - {match.score.away}
                </span>
              )}
            </div>
          ) : (
            <span className="rounded-md bg-accent-light px-2 py-0.5 text-xs font-bold text-accent sm:px-2.5 sm:py-1 sm:text-sm">
              {formatTime(match.date)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border px-4 py-2 sm:px-5 sm:py-2.5">
        {match.broadcasts.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-light sm:text-[11px]">Kijk op:</span>
            {match.broadcasts.map((b) => (
              <BroadcastBadge key={b.name} broadcast={b} />
            ))}
          </div>
        )}

        {/* Unibet odds CTA */}
        {match.odds && match.status === 'scheduled' ? (
          <a
            href={UNIBET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-[#147B45] px-2 py-1 text-[9px] font-bold text-white shadow-sm transition-all hover:bg-[#00531D] hover:shadow-md sm:gap-2 sm:px-3 sm:text-[11px]"
          >
            <span className="flex items-center gap-1 border-r border-white/20 pr-1 sm:gap-1.5 sm:pr-2">
              <span className="text-[#FFE71F]">1</span>
              <span>{match.odds.home.toFixed(2)}</span>
            </span>
            <span className="flex items-center gap-1 border-r border-white/20 pr-1 sm:gap-1.5 sm:pr-2">
              <span className="text-[#FFE71F]">X</span>
              <span>{match.odds.draw.toFixed(2)}</span>
            </span>
            <span className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-[#FFE71F]">2</span>
              <span>{match.odds.away.toFixed(2)}</span>
            </span>
            <span className="ml-0.5 rounded bg-[#FFE71F] px-1 py-0.5 text-[8px] font-extrabold text-[#00531D] sm:ml-1 sm:px-1.5 sm:text-[10px]">
              Unibet
            </span>
          </a>
        ) : (
          <a
            href={UNIBET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-[#147B45] px-2 py-1 text-[9px] font-bold text-white shadow-sm transition-all hover:bg-[#00531D] hover:shadow-md sm:gap-1.5 sm:px-3 sm:text-[11px]"
          >
            Zet in bij{' '}
            <span className="rounded bg-[#FFE71F] px-1 py-0.5 text-[8px] font-extrabold text-[#00531D] sm:px-1.5 sm:text-[10px]">
              Unibet
            </span>
            →
          </a>
        )}
      </div>
    </div>
  )
}

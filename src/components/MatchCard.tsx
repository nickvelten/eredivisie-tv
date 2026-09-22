'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Match, Club } from '@/data/types'
import { formatTime, formatDutchDate } from '@/lib/utils'
import { useFavoriteClub } from '@/lib/favorite-club'
import { BroadcastBadge } from './BroadcastBadge'

const UNIBET_URL = 'https://www.unibet.nl/betting/sports/filter/football/netherlands/eredivisie'

function Team({ club, winner, large }: { club: Club; winner: boolean; large: boolean }) {
  const size = large ? 64 : 48
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <Image
        src={club.logo}
        alt=""
        width={size}
        height={size}
        className={large ? 'h-16 w-16' : 'h-12 w-12'}
      />
      <span
        className={`w-full truncate text-xs leading-tight sm:text-[13px] ${
          winner ? 'font-extrabold text-foreground' : 'font-semibold text-foreground/80'
        }`}
      >
        {club.shortName}
      </span>
    </div>
  )
}

function Centre({ match }: { match: Match }) {
  if (match.status === 'scheduled') {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="rounded-lg bg-accent-light px-3 py-1 text-lg font-extrabold tabular-nums text-accent">
          {formatTime(match.date)}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-light">aftrap</span>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
        {match.score?.home ?? 0}
        <span className="mx-1 text-muted-light">–</span>
        {match.score?.away ?? 0}
      </span>
      {match.status === 'live' ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          {match.clock ?? 'Live'}
        </span>
      ) : (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-light">eindstand</span>
      )}
    </div>
  )
}

/**
 * Compact match tile for a 2–3 column grid: home team left, away team right,
 * kickoff time or score in the middle, broadcast and odds in the footer.
 */
export function MatchCard({
  match,
  featured = false,
  showDate = false,
}: {
  match: Match
  featured?: boolean
  showDate?: boolean
}) {
  const { favoriteId } = useFavoriteClub()
  const isFavorite =
    favoriteId !== null && (match.homeTeam.id === favoriteId || match.awayTeam.id === favoriteId)

  const homeWins = match.status === 'finished' && !!match.score && match.score.home > match.score.away
  const awayWins = match.status === 'finished' && !!match.score && match.score.away > match.score.home
  const tvBroadcast = match.broadcasts.find((b) => b.type === 'tv')
  const contextLabel = showDate
    ? formatDutchDate(match.date)
    : match.round
      ? `Speelronde ${match.round}`
      : 'Inhaalwedstrijd'

  return (
    <article
      className={`relative flex flex-col rounded-xl bg-card shadow-sm transition-shadow hover:shadow-md ${
        isFavorite ? 'ring-2 ring-(--club-color)' : 'ring-1 ring-border'
      } ${featured ? 'sm:col-span-2' : ''}`}
    >
      <Link
        href={`/wedstrijd/${match.id}`}
        className="absolute inset-0 z-0 rounded-xl"
        aria-label={`${match.homeTeam.name} – ${match.awayTeam.name}`}
      />

      <div className="pointer-events-none relative z-10 flex items-center justify-between gap-3 px-4 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-light">
        <span className="truncate">
          {featured && (
            <span className="mr-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-extrabold text-white">Topper</span>
          )}
          {contextLabel}
        </span>
        {match.status === 'live' ? (
          <span className="shrink-0 text-accent">Live</span>
        ) : (
          <span className="shrink-0 truncate">{match.status === 'finished' ? 'Gespeeld' : match.venue ?? ''}</span>
        )}
      </div>

      <div className="pointer-events-none relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4">
        <Team club={match.homeTeam} winner={homeWins} large={featured} />
        <Centre match={match} />
        <Team club={match.awayTeam} winner={awayWins} large={featured} />
      </div>

      <div className="relative z-10 mt-auto flex items-center gap-2 border-t border-border px-4 py-2.5">
        {tvBroadcast && <BroadcastBadge broadcast={tvBroadcast} />}
        {match.odds && match.status === 'scheduled' ? (
          <a
            href={UNIBET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#147B45] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-[#00531D] hover:shadow-md"
          >
            <span className="flex items-center gap-1 border-r border-white/20 pr-1.5">
              <span className="text-[#FFE71F]">1</span>
              <span>{match.odds.home.toFixed(2)}</span>
            </span>
            <span className="flex items-center gap-1 border-r border-white/20 pr-1.5">
              <span className="text-[#FFE71F]">X</span>
              <span>{match.odds.draw.toFixed(2)}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-[#FFE71F]">2</span>
              <span>{match.odds.away.toFixed(2)}</span>
            </span>
          </a>
        ) : (
          <span className="ml-auto text-[11px] font-medium text-muted-light">ESPN.nl</span>
        )}
      </div>
    </article>
  )
}

export function MatchGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

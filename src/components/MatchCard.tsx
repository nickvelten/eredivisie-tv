'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Match, Club } from '@/data/types'
import { formatTime, formatDutchDate } from '@/lib/utils'
import { useFavoriteClub } from '@/lib/favorite-club'
import { useLiveMatch } from '@/lib/live-scores'
import { BroadcastBadge } from './BroadcastBadge'
import { OddsBar } from './OddsBar'
import { SHOW_ODDS } from '@/lib/betting'


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
        className={`line-clamp-2 w-full text-xs leading-tight sm:text-[13px] ${
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

/** Phone layout: one row per match (time or score, both teams, channel), about a third of the card height. */
function CompactRow({ match, homeWins, awayWins, hasOdds }: { match: Match; homeWins: boolean; awayWins: boolean; hasOdds: boolean }) {
  const tv = match.broadcasts.find((b) => b.type === 'tv')
  const played = match.status !== 'scheduled'
  const teamRow = (club: Club, score: number | undefined, winner: boolean) => (
    <span className="flex min-w-0 items-center gap-2">
      <Image src={club.logo} alt="" width={20} height={20} className="h-5 w-5 shrink-0" />
      <span className={`min-w-0 flex-1 truncate text-sm ${winner ? 'font-extrabold text-foreground' : 'font-semibold text-foreground/85'}`}>{club.shortName}</span>
      {played && <span className="shrink-0 text-sm font-extrabold tabular-nums text-foreground">{score ?? 0}</span>}
    </span>
  )
  return (
    <div className="pointer-events-none relative z-10 flex items-center gap-3 px-3 py-2.5 sm:hidden">
      <div className="flex w-12 shrink-0 flex-col items-center">
        {match.status === 'scheduled' ? (
          <span className="text-sm font-extrabold tabular-nums text-accent">{formatTime(match.date)}</span>
        ) : match.status === 'live' ? (
          <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">{match.clock ?? 'Live'}</span>
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-light">Eind</span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 border-l border-border pl-3">
        {teamRow(match.homeTeam, match.score?.home, homeWins)}
        {teamRow(match.awayTeam, match.score?.away, awayWins)}
      </div>
      <div className="pointer-events-auto flex shrink-0 flex-col items-end gap-1.5">
        {tv && <BroadcastBadge broadcast={tv} />}
        {hasOdds && <OddsBar odds={match.odds!} />}
      </div>
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
  link = true,
}: {
  match: Match
  featured?: boolean
  showDate?: boolean
  /** Archived seasons have no match pages */
  link?: boolean
}) {
  const { favoriteId } = useFavoriteClub()
  match = useLiveMatch(match)
  const isFavorite =
    favoriteId !== null && (match.homeTeam.id === favoriteId || match.awayTeam.id === favoriteId)

  const homeWins = match.status === 'finished' && !!match.score && match.score.home > match.score.away
  const awayWins = match.status === 'finished' && !!match.score && match.score.away > match.score.home
  const tvBroadcast = match.broadcasts.find((b) => b.type === 'tv')
  const hasOdds = !!match.odds && match.status === 'scheduled' && SHOW_ODDS
  // One pattern everywhere: the small pill, and the wider Unibet band only on the topper
  const oddsStrip = hasOdds && featured
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
      {link && <Link
        href={`/wedstrijd/${match.slug}`}
        className="absolute inset-0 z-0 rounded-xl"
        aria-label={`${match.homeTeam.name} – ${match.awayTeam.name}`}
      />}

      {!featured && <CompactRow match={match} homeWins={homeWins} awayWins={awayWins} hasOdds={hasOdds} />}
      <div className={`${featured ? 'flex' : 'hidden sm:flex'} flex-1 flex-col`}>
      <div className="pointer-events-none relative z-10 flex items-center justify-between gap-3 px-4 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-light">
        <span className="shrink-0 whitespace-nowrap">
          {featured && (
            <span className="mr-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-extrabold text-white">Topper</span>
          )}
          {contextLabel}
        </span>
        {match.status === 'live' ? (
          <span className="shrink-0 text-accent">Live</span>
        ) : (
          <span className="min-w-0 truncate text-right">{match.status === 'finished' ? 'Gespeeld' : match.venue ?? ''}</span>
        )}
      </div>

      <div className="pointer-events-none relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4">
        <Team club={match.homeTeam} winner={homeWins} large={featured} />
        <Centre match={match} />
        <Team club={match.awayTeam} winner={awayWins} large={featured} />
      </div>

      <div className="relative z-10 mt-auto flex items-center gap-2 border-t border-border px-4 py-2.5">
        {tvBroadcast && <BroadcastBadge broadcast={tvBroadcast} />}
        {hasOdds && !oddsStrip ? (
          <OddsBar odds={match.odds!} className="ml-auto" />
        ) : match.status === 'finished' ? (
          link ? <span className="pointer-events-none ml-auto text-[11px] font-semibold text-muted-light">Verloop →</span> : null
        ) : (
          <span className="pointer-events-none ml-auto whitespace-nowrap text-[11px] font-medium text-muted-light">Ook in de ESPN Watch-app</span>
        )}
      </div>
      {hasOdds && oddsStrip && <OddsBar odds={match.odds!} variant="strip" className="relative z-10 rounded-b-xl" />}
      </div>
    </article>
  )
}

export function MatchGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
}

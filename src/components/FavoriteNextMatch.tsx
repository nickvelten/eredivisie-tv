'use client'

import Link from 'next/link'
import { Match } from '@/data/types'
import { useFavoriteClub } from '@/lib/favorite-club'
import { MatchCard, MatchGrid } from './MatchCard'
import { KickoffCountdown } from './KickoffCountdown'

export function FavoriteNextMatch({ matches }: { matches: Match[] }) {
  const { favorite } = useFavoriteClub()
  if (!favorite) return null

  const clubMatches = matches
    .filter((m) => m.homeTeam.id === favorite.id || m.awayTeam.id === favorite.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const upcoming = clubMatches.filter((m) => m.status !== 'finished').slice(0, 3)
  const lastResult = [...clubMatches].reverse().find((m) => m.status === 'finished')

  return (
    <section id="mijn-club" className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-extrabold text-foreground">{favorite.name}</h2>
        {upcoming[0]?.status === 'scheduled' && <KickoffCountdown date={upcoming[0].date} />}
        <Link
          href={`/club/${favorite.slug}`}
          className="ml-auto rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted ring-1 ring-border transition-colors hover:text-accent hover:ring-accent/40"
        >
          Clubpagina →
        </Link>
      </div>
      {upcoming.length > 0 || lastResult ? (
        <MatchGrid>
          {lastResult && <MatchCard match={lastResult} showDate />}
          {upcoming.map((m) => (
            <MatchCard key={m.id} match={m} showDate />
          ))}
        </MatchGrid>
      ) : (
        <p className="text-sm text-muted">Geen wedstrijden van {favorite.name} in het huidige programma.</p>
      )}
    </section>
  )
}

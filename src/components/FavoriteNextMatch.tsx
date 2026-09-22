'use client'

import { Match, Club } from '@/data/types'
import { useFavoriteClub } from '@/lib/favorite-club'
import { MatchCard } from './MatchCard'
import { KickoffCountdown } from './KickoffCountdown'

export function FavoriteNextMatch({ matches, clubs }: { matches: Match[]; clubs: Club[] }) {
  const { favoriteId } = useFavoriteClub()
  const favorite = clubs.find((c) => c.id === favoriteId)
  if (!favorite) return null

  const nextMatch = matches
    .filter(
      (m) =>
        m.status !== 'finished' &&
        (m.homeTeam.id === favorite.id || m.awayTeam.id === favorite.id)
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

  return (
    <section id="mijn-club" className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-extrabold text-foreground">
          Eerstvolgende wedstrijd van {favorite.name}
        </h2>
        {nextMatch?.status === 'scheduled' && <KickoffCountdown date={nextMatch.date} />}
      </div>
      {nextMatch ? (
        <MatchCard match={nextMatch} />
      ) : (
        <p className="text-sm text-muted">
          Geen aankomende wedstrijd van {favorite.name} in het huidige programma.
        </p>
      )}
    </section>
  )
}

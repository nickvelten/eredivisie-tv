'use client'

import Image from 'next/image'
import { Match, Club } from '@/data/types'
import { useFavoriteClub } from '@/lib/favorite-club'
import { MatchCard } from './MatchCard'
import { KickoffCountdown } from './KickoffCountdown'

function uniqueClubs(matches: Match[]): Club[] {
  const map = new Map<string, Club>()
  for (const m of matches) {
    map.set(m.homeTeam.id, m.homeTeam)
    map.set(m.awayTeam.id, m.awayTeam)
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'nl'))
}

export function ClubPicker({ matches }: { matches: Match[] }) {
  const { favoriteId, setFavorite } = useFavoriteClub()
  const clubs = uniqueClubs(matches)

  if (clubs.length === 0) return null

  const favorite = clubs.find((c) => c.id === favoriteId)
  const nextMatch = favorite
    ? matches
        .filter(
          (m) =>
            m.status !== 'finished' &&
            (m.homeTeam.id === favorite.id || m.awayTeam.id === favorite.id)
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    : undefined

  return (
    <section id="mijn-club" className="mx-auto w-full max-w-5xl px-4 py-10">
      <h2 className="mb-1 text-2xl font-extrabold text-foreground">Kies je club</h2>
      <p className="mb-5 text-sm text-muted">
        Selecteer je favoriete club om hun wedstrijden overal uit te lichten. Nogmaals klikken wist je keuze.
      </p>
      <div className="flex flex-wrap gap-2">
        {clubs.map((club) => {
          const selected = club.id === favoriteId
          return (
            <button
              key={club.id}
              onClick={() => setFavorite(selected ? null : club.id)}
              aria-pressed={selected}
              className={`flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3.5 text-sm font-semibold transition-all ${
                selected
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-card text-muted ring-1 ring-border hover:text-foreground hover:shadow-sm'
              }`}
            >
              <Image src={club.logo} alt="" width={22} height={22} className="h-[22px] w-[22px]" />
              {club.name}
            </button>
          )
        })}
      </div>

      {favorite && nextMatch && (
        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
              Eerstvolgende wedstrijd van {favorite.name}
            </h3>
            {nextMatch.status === 'scheduled' && <KickoffCountdown date={nextMatch.date} />}
          </div>
          <MatchCard match={nextMatch} />
        </div>
      )}
      {favorite && !nextMatch && (
        <p className="mt-6 text-sm text-muted">
          Geen aankomende wedstrijd van {favorite.name} in het huidige programma.
        </p>
      )}
    </section>
  )
}

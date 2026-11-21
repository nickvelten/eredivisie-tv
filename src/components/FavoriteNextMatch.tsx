'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormResult, Match, StandingEntry } from '@/data/types'
import { useFavoriteClub } from '@/lib/favorite-club'
import { MatchCard, MatchGrid } from './MatchCard'
import { KickoffCountdown } from './KickoffCountdown'
import { ClubCalendarButton } from './CalendarButtons'
import { PushButton } from './PushButton'

const formColors: Record<FormResult, string> = { W: 'bg-emerald-500', D: 'bg-amber-400', L: 'bg-red-500' }
const formLabel: Record<FormResult, string> = { W: 'Winst', D: 'Gelijk', L: 'Verlies' }

/**
 * Top of the homepage once a club is chosen: last result, next matches, form,
 * the table around the club, and one tap to the calendar or notifications.
 */
export function FavoriteNextMatch({ matches, standings }: { matches: Match[]; standings: StandingEntry[] }) {
  const { favorite } = useFavoriteClub()
  if (!favorite) return null

  const clubMatches = matches.filter((m) => m.homeTeam.id === favorite.id || m.awayTeam.id === favorite.id)
  const upcoming = clubMatches.filter((m) => m.status !== 'finished').slice(0, 2)
  const lastResult = [...clubMatches].reverse().find((m) => m.status === 'finished')
  const own = standings.find((s) => s.club.id === favorite.id)
  const around = own
    ? standings.slice(Math.max(0, Math.min(own.position - 3, standings.length - 5)), Math.max(0, Math.min(own.position - 3, standings.length - 5)) + 5)
    : []

  return (
    <section id="mijn-club" className="w-full pt-8">
      <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1 ring-1 ring-border">
            <Image src={favorite.logo} alt="" width={28} height={28} className="h-full w-full object-contain" />
          </span>
          <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">{favorite.name}</h2>
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
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} showDate />
            ))}
            {lastResult && <MatchCard match={lastResult} showDate />}
          </MatchGrid>
        ) : (
          <p className="text-sm text-muted">Geen wedstrijden van {favorite.name} in het huidige programma.</p>
        )}

        {own && (
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
            <table className="w-full text-xs">
              <caption className="sr-only">Stand rond {favorite.name}</caption>
              <tbody>
                {around.map((s) => (
                  <tr key={s.club.id} className={`border-t border-border first:border-t-0 ${s.club.id === favorite.id ? 'font-extrabold text-foreground' : 'text-muted'}`}>
                    <td className="w-6 py-1.5 tabular-nums">{s.position}</td>
                    <td className="py-1.5">
                      <Link href={`/club/${s.club.slug}`} className="flex items-center gap-2 hover:text-accent">
                        <Image src={s.club.logo} alt="" width={16} height={16} className="h-4 w-4" />
                        {s.club.shortName}
                      </Link>
                    </td>
                    <td className="py-1.5 text-right tabular-nums">{s.played} gs</td>
                    <td className="w-12 py-1.5 text-right tabular-nums">{s.points} pt</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {own.form && own.form.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted sm:flex-col sm:items-end">
                <span>Vorm</span>
                <span className="flex gap-1">
                  {own.form.map((r, i) => (
                    <span key={i} title={formLabel[r]} className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white ${formColors[r]}`}>
                      {r === 'W' ? 'W' : r === 'D' ? 'G' : 'V'}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <ClubCalendarButton slug={favorite.slug} clubName={favorite.name} />
          <PushButton club={favorite} />
        </div>
      </div>
    </section>
  )
}

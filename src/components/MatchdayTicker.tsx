'use client'

import Link from 'next/link'
import { EventIcon } from './Icons'
import { Match } from '@/data/types'
import { useLiveUpdates } from '@/lib/live-scores'

/**
 * Match-day mode: a running list of the latest goals and red cards across all
 * matches of the day, updated by the live poll. Hidden on days without play.
 */
export function MatchdayTicker({ matches }: { matches: Match[] }) {
  const updates = useLiveUpdates()
  const merged = matches.map((m) => (updates[m.id] ? { ...m, ...updates[m.id], score: updates[m.id].score ?? m.score } : m))
  const active = merged.filter((m) => m.status !== 'scheduled')
  if (active.length === 0) return null

  const feed = active
    .flatMap((m) =>
      (m.events ?? [])
        .filter((e) => e.type !== 'yellow')
        .map((e) => ({ match: m, event: e, minute: parseInt(e.minute) || 0 }))
    )
    .sort((a, b) => b.minute - a.minute)
    .slice(0, 8)
  const liveCount = merged.filter((m) => m.status === 'live').length

  return (
    <section aria-label="Wedstrijddag" className="w-full pt-6">
      <div className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
            {liveCount > 0 && <span className="h-2 w-2 animate-pulse rounded-full bg-accent motion-reduce:animate-none" />}
            Wedstrijddag
          </h2>
          <span className="text-xs text-muted">
            {liveCount > 0 ? `${liveCount} live` : 'Vandaag gespeeld'} · ververst automatisch
          </span>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-border px-4 py-3">
          {merged.map((m) => (
            <Link key={m.id} href={`/wedstrijd/${m.slug}`} className="shrink-0 rounded-lg bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:text-accent">
              {m.homeTeam.shortName}{' '}
              <span className="font-extrabold">{m.status === 'scheduled' ? '-' : `${m.score?.home ?? 0}-${m.score?.away ?? 0}`}</span>{' '}
              {m.awayTeam.shortName}
              {m.status === 'live' && m.clock && <span className="ml-1 text-accent">{m.clock}</span>}
            </Link>
          ))}
        </div>
        {feed.length > 0 ? (
          <ul className="divide-y divide-border">
            {feed.map(({ match, event }, i) => {
              const club = event.teamId === match.homeTeam.id ? match.homeTeam : match.awayTeam
              return (
                <li key={i} className="flex items-center gap-3 px-4 py-2 text-sm">
                  <span className="w-10 shrink-0 text-xs font-bold tabular-nums text-muted">{event.minute}</span>
                  <EventIcon type={event.type} />
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-semibold text-foreground">{event.player}</span>
                    <span className="text-muted"> · {club.shortName}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">{match.homeTeam.shortName} – {match.awayTeam.shortName}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="px-4 py-3 text-sm text-muted">Nog geen doelpunten vandaag.</p>
        )}
      </div>
    </section>
  )
}

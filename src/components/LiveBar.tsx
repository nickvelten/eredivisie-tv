import Link from 'next/link'
import { Match } from '@/data/types'

/** Slim strip under the header that lists matches currently in play. */
export function LiveBar({ matches }: { matches: Match[] }) {
  const live = matches.filter((m) => m.status === 'live')
  if (live.length === 0) return null

  return (
    <div className="border-b border-accent/20 bg-accent-light">
      <div className="mx-auto flex max-w-5xl items-center gap-3 overflow-x-auto px-4 py-2 text-sm">
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-accent">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Live
        </span>
        {live.map((m) => (
          <Link
            key={m.id}
            href={`/wedstrijd/${m.id}`}
            className="shrink-0 rounded-full bg-card px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-border transition-colors hover:ring-accent/40"
          >
            {m.homeTeam.shortName} <span className="font-extrabold">{m.score?.home ?? 0}–{m.score?.away ?? 0}</span> {m.awayTeam.shortName}
            {m.clock && <span className="ml-1.5 text-accent">{m.clock}</span>}
          </Link>
        ))}
      </div>
    </div>
  )
}

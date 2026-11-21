import Image from 'next/image'
import Link from 'next/link'
import { Match } from '@/data/types'
import { formatEnglishDate } from '@/lib/i18n'
import { groupMatchesByDate } from '@/lib/utils'
import { KickoffTime } from './KickoffTime'

function Row({ match }: { match: Match }) {
  const tv = match.broadcasts.find((b) => b.type === 'tv')?.name ?? 'ESPN'
  const done = match.status !== 'scheduled' && match.score
  return (
    <li>
      <Link href={`/en/match/${match.slug}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 hover:bg-background">
        <span className="flex min-w-0 items-center justify-end gap-2 text-right text-sm font-semibold text-foreground">
          <span className="truncate">{match.homeTeam.shortName}</span>
          <Image src={match.homeTeam.logo} alt="" width={24} height={24} className="h-6 w-6 shrink-0 object-contain" />
        </span>
        <span className="min-w-[5.5rem] text-center">
          {done ? (
            <span className="text-base font-extrabold tabular-nums text-foreground">
              {match.score!.home} – {match.score!.away}
              {match.status === 'live' && <span className="ml-1 text-xs font-bold text-red-600">{match.clock ?? 'LIVE'}</span>}
            </span>
          ) : (
            <span className="block text-sm font-bold tabular-nums text-foreground">
              <KickoffTime date={match.date} />
            </span>
          )}
          {!done && <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">{tv}</span>}
        </span>
        <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
          <Image src={match.awayTeam.logo} alt="" width={24} height={24} className="h-6 w-6 shrink-0 object-contain" />
          <span className="truncate">{match.awayTeam.shortName}</span>
        </span>
      </Link>
    </li>
  )
}

/** Matches grouped per Amsterdam day, one compact row each. */
export function EnMatchList({ matches }: { matches: Match[] }) {
  const days = [...groupMatchesByDate([...matches].sort((a, b) => a.date.localeCompare(b.date)))]
  if (days.length === 0) return null
  return (
    <div className="space-y-6">
      {days.map(([day, list]) => (
        <section key={day}>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">{formatEnglishDate(list[0].date)}</h3>
          <ul className="divide-y divide-border rounded-xl bg-card shadow-sm ring-1 ring-border">
            {list.map((m) => (
              <Row key={m.id} match={m} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

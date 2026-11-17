import Image from 'next/image'
import Link from 'next/link'
import { Match } from '@/data/types'
import { Lineup, MatchDetails, TeamStats } from '@/lib/match-details'

function LineupColumn({ lineup, club, slugs }: { lineup: Lineup; club: Match['homeTeam']; slugs: Map<string, string> }) {
  const row = (p: Lineup['starters'][number]) => {
    const slug = slugs.get(p.id)
    return (
      <li key={p.id} className="flex items-center gap-3 px-4 py-1.5 text-sm">
        <span className="w-6 shrink-0 text-right text-xs font-bold tabular-nums text-muted-light">{p.jersey}</span>
        {slug ? (
          <Link href={`/speler/${slug}`} className="min-w-0 flex-1 truncate font-medium text-foreground hover:text-accent">{p.name}</Link>
        ) : (
          <span className="min-w-0 flex-1 truncate font-medium text-foreground">{p.name}</span>
        )}
        {p.subbedOut && <span title="Gewisseld" className="text-xs text-red-500">▼</span>}
        {p.subbedIn && <span title="Ingevallen" className="text-xs text-emerald-500">▲</span>}
      </li>
    )
  }
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-extrabold text-foreground">
          <Image src={club.logo} alt="" width={20} height={20} className="h-5 w-5" />
          {club.shortName}
        </span>
        {lineup.formation && <span className="rounded-full bg-background px-2 py-0.5 text-xs font-bold text-muted">{lineup.formation}</span>}
      </div>
      <ul className="py-1.5">{lineup.starters.map(row)}</ul>
      {lineup.bench.length > 0 && (
        <>
          <p className="border-t border-border px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-muted-light">Bank</p>
          <ul className="pb-2">{lineup.bench.map(row)}</ul>
        </>
      )}
    </div>
  )
}

const STAT_ROWS: Array<{ key: keyof TeamStats; label: string; suffix?: string }> = [
  { key: 'possession', label: 'Balbezit', suffix: '%' },
  { key: 'shots', label: 'Schoten' },
  { key: 'shotsOnTarget', label: 'Op doel' },
  { key: 'corners', label: 'Corners' },
  { key: 'passes', label: 'Passes' },
  { key: 'passAccuracy', label: 'Passnauwkeurigheid', suffix: '%' },
  { key: 'tackles', label: 'Tackles' },
  { key: 'saves', label: 'Reddingen' },
  { key: 'fouls', label: 'Overtredingen' },
  { key: 'offsides', label: 'Buitenspel' },
  { key: 'yellowCards', label: 'Gele kaarten' },
  { key: 'redCards', label: 'Rode kaarten' },
]

function StatsTable({ home, away, match }: { home: TeamStats; away: TeamStats; match: Match }) {
  const rows = STAT_ROWS.filter((r) => home[r.key] !== undefined && away[r.key] !== undefined)
  if (rows.length === 0) return null
  return (
    <section className="w-full py-8">
      <h2 className="mb-4 text-2xl font-extrabold text-foreground">Statistieken</h2>
      <div className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-border">
        <div className="mb-2 flex justify-between text-xs font-extrabold text-foreground">
          <span>{match.homeTeam.shortName}</span>
          <span>{match.awayTeam.shortName}</span>
        </div>
        <ul className="flex flex-col gap-3">
          {rows.map((r) => {
            const h = home[r.key] ?? 0
            const a = away[r.key] ?? 0
            const total = h + a || 1
            return (
              <li key={r.key}>
                <div className="flex justify-between text-sm">
                  <span className={`tabular-nums ${h > a ? 'font-extrabold text-foreground' : 'text-muted'}`}>{h}{r.suffix ?? ''}</span>
                  <span className="text-xs text-muted">{r.label}</span>
                  <span className={`tabular-nums ${a > h ? 'font-extrabold text-foreground' : 'text-muted'}`}>{a}{r.suffix ?? ''}</span>
                </div>
                <div className="mt-1 flex h-1.5 gap-1 overflow-hidden rounded-full">
                  <span className="rounded-full bg-accent" style={{ width: `${(h / total) * 100}%` }} />
                  <span className="rounded-full bg-muted-light/50" style={{ width: `${(a / total) * 100}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/** Line-ups, team stats and match facts (attendance, referee) from ESPN's summary. */
export function MatchDetailsView({ details, match, slugs }: { details: MatchDetails; match: Match; slugs: Map<string, string> }) {
  const home = details.lineups.find((l) => l.teamId === match.homeTeam.id)
  const away = details.lineups.find((l) => l.teamId === match.awayTeam.id)
  const homeStats = details.stats[match.homeTeam.id]
  const awayStats = details.stats[match.awayTeam.id]
  const showStats = match.status !== 'scheduled' && homeStats && awayStats

  return (
    <>
      {showStats && <StatsTable home={homeStats} away={awayStats} match={match} />}
      {home && away && home.starters.length > 0 && (
        <section className="w-full py-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Opstellingen</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <LineupColumn lineup={home} club={match.homeTeam} slugs={slugs} />
            <LineupColumn lineup={away} club={match.awayTeam} slugs={slugs} />
          </div>
        </section>
      )}
      {(details.referee || details.attendance) && (
        <p className="pb-6 text-sm text-muted">
          {details.referee && <>Scheidsrechter: <span className="font-semibold text-foreground">{details.referee}</span></>}
          {details.referee && details.attendance ? ' · ' : ''}
          {details.attendance && <>Toeschouwers: <span className="font-semibold text-foreground">{details.attendance.toLocaleString('nl-NL')}</span></>}
        </p>
      )}
    </>
  )
}

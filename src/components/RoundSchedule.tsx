import Link from 'next/link'
import { Matchweek } from '@/data/types'
import { formatDutchDate, groupMatchesByDate } from '@/lib/utils'
import { MatchCard, MatchGrid } from './MatchCard'

type Mode = 'upcoming' | 'results'

const navClass =
  'shrink-0 whitespace-nowrap rounded-lg bg-card px-3 py-2 text-sm font-medium text-muted shadow-sm ring-1 ring-border transition-all hover:text-foreground hover:shadow-md sm:px-4'

/** The week to show: the first with matches still to play, or the last with results. */
function pickWeek(matchweeks: Matchweek[], mode: Mode, excludeIds: Set<string>): { index: number; week: Matchweek } | null {
  if (mode === 'results') {
    for (let i = matchweeks.length - 1; i >= 0; i--) {
      const matches = matchweeks[i].matches.filter((m) => m.status === 'finished')
      if (matches.length > 0) return { index: i, week: { ...matchweeks[i], matches } }
    }
    return null
  }
  const start = matchweeks.findIndex((w) => w.matches.some((m) => m.status !== 'finished'))
  if (start < 0) return null
  for (let i = start; i < matchweeks.length; i++) {
    const matches = matchweeks[i].matches.filter((m) => !excludeIds.has(m.id))
    if (matches.length > 0) return { index: i, week: { ...matchweeks[i], matches } }
  }
  return null
}

function adjacentRound(matchweeks: Matchweek[], from: number, step: -1 | 1): number | undefined {
  for (let i = from + step; i >= 0 && i < matchweeks.length; i += step) {
    if (matchweeks[i].round) return matchweeks[i].round
  }
  return undefined
}

/**
 * One speelronde, rendered on the server. Previous and next rounds are links
 * to their own /speelronde pages, so the browser never receives the whole
 * season as data.
 */
export function RoundSchedule({
  matchweeks,
  mode,
  title,
  id,
  excludeIds = [],
  showIndex = false,
}: {
  matchweeks: Matchweek[]
  mode: Mode
  title: string
  id?: string
  /** Matches already shown elsewhere on the page (e.g. today's) */
  excludeIds?: string[]
  /** Chips to every round below the matches */
  showIndex?: boolean
}) {
  const excluded = new Set(excludeIds)
  const picked = pickWeek(matchweeks, mode, excluded)
  const sectionId = id ?? (mode === 'results' ? 'uitslagen' : 'programma')

  if (!picked) {
    if (mode === 'results') return null
    return (
      <section id={sectionId} className="w-full py-10">
        <h2 className="mb-4 text-2xl font-extrabold text-foreground">{title}</h2>
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-foreground">Programma tijdelijk niet beschikbaar</p>
          <p className="mt-1 text-sm text-muted">De wedstrijddata van ESPN kon niet worden geladen. Probeer het over een paar minuten opnieuw.</p>
        </div>
      </section>
    )
  }

  const { index, week } = picked
  const prev = adjacentRound(matchweeks, index, -1)
  const next = adjacentRound(matchweeks, index, 1)
  const partial = week.matches.length < matchweeks[index].matches.length && mode === 'upcoming'
  const roundLabel = week.isCatchUp ? 'Inhaalwedstrijden' : `${partial ? 'Verder in speelronde' : 'Speelronde'} ${week.round}`
  const grouped = groupMatchesByDate(week.matches)
  const rounds = matchweeks.filter((w) => w.round).map((w) => w.round!)

  return (
    <section id={sectionId} className="w-full py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        {prev ? (
          <Link href={`/speelronde/${prev}`} className={navClass} aria-label={`Speelronde ${prev}`}>
            ← <span className="hidden sm:inline">Ronde {prev}</span>
          </Link>
        ) : (
          <span className="w-10" />
        )}
        <div className="min-w-0 text-center">
          <h2 className="text-2xl font-extrabold text-foreground">{title}</h2>
          <p className="truncate text-xs text-muted-light">
            {week.round ? (
              <Link href={`/speelronde/${week.round}`} className="font-semibold text-muted hover:text-accent">{roundLabel}</Link>
            ) : (
              <span className="font-semibold text-muted">{roundLabel}</span>
            )}{' '}
            · {week.label}
          </p>
        </div>
        {next ? (
          <Link href={`/speelronde/${next}`} className={navClass} aria-label={`Speelronde ${next}`}>
            <span className="hidden sm:inline">Ronde {next}</span> →
          </Link>
        ) : (
          <span className="w-10" />
        )}
      </div>

      <div className="flex flex-col gap-8">
        {Array.from(grouped.entries()).map(([dateKey, matches]) => (
          <div key={dateKey}>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-accent/20" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-accent">{formatDutchDate(matches[0].date)}</h3>
              <div className="h-px flex-1 bg-accent/20" />
            </div>
            <MatchGrid>
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </MatchGrid>
          </div>
        ))}
      </div>

      {showIndex && rounds.length > 0 && (
        <nav aria-label="Alle speelrondes" className="mt-10">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Alle speelrondes</h3>
          <ul className="flex flex-wrap gap-1.5">
            {rounds.map((r) => (
              <li key={r}>
                <Link
                  href={`/speelronde/${r}`}
                  aria-current={r === week.round ? 'true' : undefined}
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold tabular-nums ring-1 transition-colors ${
                    r === week.round ? 'bg-accent text-white ring-accent' : 'bg-card text-muted ring-border hover:text-accent'
                  }`}
                >
                  {r}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  )
}

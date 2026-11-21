import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageShell } from '@/components/PageShell'
import { MatchCard, MatchGrid } from '@/components/MatchCard'
import { fetchEredivisieData } from '@/lib/espn'
import { matchStructuredData, SITE_URL } from '@/lib/structured-data'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import { EredivisieData, Match, StandingEntry } from '@/data/types'
import { PredictMatch, RoundPredictor } from '@/components/RoundPredictor'
import { formatDutchDate, formatTime } from '@/lib/utils'

type Params = { params: Promise<{ nr: string }> }

export const revalidate = 300

export async function generateStaticParams() {
  const { matchweeks } = await fetchEredivisieData()
  return matchweeks.filter((w) => w.round).map((w) => ({ nr: String(w.round) }))
}

function roundOf(data: EredivisieData, nr: string) {
  const n = parseInt(nr)
  return Number.isFinite(n) ? data.matchweeks.find((w) => w.round === n) : undefined
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { nr } = await params
  const week = roundOf(await fetchEredivisieData(), nr)
  if (!week) return { title: 'Speelronde niet gevonden | Eredivisie.tv' }
  const played = week.matches.every((m) => m.status === 'finished')
  const title = played
    ? `Eredivisie speelronde ${week.round}: alle uitslagen | Eredivisie.tv`
    : `Eredivisie speelronde ${week.round} (${week.label}): wedstrijden en zenders | Eredivisie.tv`
  const description = played
    ? `Alle uitslagen van speelronde ${week.round} in de Eredivisie (${week.label}), met doelpuntenmakers per wedstrijd.`
    : `Het programma van speelronde ${week.round} in de Eredivisie (${week.label}): aftraptijden en op welke ESPN-zender elke wedstrijd te zien is.`
  const url = `${SITE_URL}/speelronde/${week.round}`
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES } }
}

function summary(matches: Match[]): string | null {
  const done = matches.filter((m) => m.status === 'finished' && m.score)
  if (done.length === 0) return null
  const goals = done.reduce((n, m) => n + m.score!.home + m.score!.away, 0)
  const biggest = [...done].sort((a, b) => Math.abs(b.score!.home - b.score!.away) - Math.abs(a.score!.home - a.score!.away))[0]
  const draws = done.filter((m) => m.score!.home === m.score!.away).length
  const homeWins = done.filter((m) => m.score!.home > m.score!.away).length
  return `In ${done.length} gespeelde wedstrijd${done.length === 1 ? '' : 'en'} vielen ${goals} doelpunten (${(goals / done.length).toFixed(1)} per wedstrijd). ${homeWins} thuisoverwinning${homeWins === 1 ? '' : 'en'}, ${draws} gelijkspel${draws === 1 ? '' : 'en'}. Grootste uitslag: ${biggest.homeTeam.name} – ${biggest.awayTeam.name} ${biggest.score!.home}-${biggest.score!.away}.`
}

/** Short preview for a round that has not been played: the leader, the bottom club and the opening match. */
function preview(matches: Match[], standings: StandingEntry[]): string | null {
  const open = matches.filter((m) => m.status === 'scheduled').sort((a, b) => a.date.localeCompare(b.date))
  if (open.length === 0 || standings.length === 0) return null
  const has = (id: string) => (m: Match) => m.homeTeam.id === id || m.awayTeam.id === id
  const opponent = (m: Match, id: string) => (m.homeTeam.id === id ? `${m.awayTeam.name} (thuis)` : `${m.homeTeam.name} (uit)`)
  const leader = standings[0]
  const last = standings[standings.length - 1]
  const parts = [`De speelronde begint ${formatDutchDate(open[0].date)} om ${formatTime(open[0].date)} met ${open[0].homeTeam.name} – ${open[0].awayTeam.name}.`]
  const lm = open.find(has(leader.club.id))
  if (lm) parts.push(`Koploper ${leader.club.name} (${leader.points} punten) speelt tegen ${opponent(lm, leader.club.id)}.`)
  const bm = open.find(has(last.club.id))
  if (bm) parts.push(`Hekkensluiter ${last.club.name} treft ${opponent(bm, last.club.id)}.`)
  return parts.join(' ')
}

function outcome(m: Match): PredictMatch['outcome'] {
  if (m.status !== 'finished' || !m.score) return undefined
  return m.score.home > m.score.away ? '1' : m.score.home < m.score.away ? '2' : 'X'
}

export default async function SpeelrondePage({ params }: Params) {
  const { nr } = await params
  const data = await fetchEredivisieData()
  const week = roundOf(data, nr)
  if (!week) notFound()
  const rounds = data.matchweeks.filter((w) => w.round).map((w) => w.round!)
  const prev = rounds.filter((r) => r < week.round!).pop()
  const next = rounds.find((r) => r > week.round!)
  const rank = new Map(data.standings.map((s) => [s.club.id, s.position]))
  const topper = week.matches
    .filter((m) => m.status !== 'finished')
    .sort((a, b) => (rank.get(a.homeTeam.id) ?? 18) + (rank.get(a.awayTeam.id) ?? 18) - ((rank.get(b.homeTeam.id) ?? 18) + (rank.get(b.awayTeam.id) ?? 18)))[0]
  const text = summary(week.matches)
  const sorted = [...week.matches].sort((a, b) => a.date.localeCompare(b.date))
  const intro = preview(week.matches, data.standings)
  const predict: PredictMatch[] = sorted.map((m) => ({
    id: m.id,
    home: m.homeTeam.shortName,
    away: m.awayTeam.shortName,
    finished: m.status === 'finished',
    locked: m.status !== 'scheduled',
    outcome: outcome(m),
  }))

  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Programma', href: '/programma' }, { label: `Speelronde ${week.round}`, href: `/speelronde/${week.round}` }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sorted.flatMap(matchStructuredData)) }} />
      <div className="flex items-center justify-between gap-3 pt-6">
        {prev ? <Link href={`/speelronde/${prev}`} className="text-sm font-semibold text-muted hover:text-accent">← Ronde {prev}</Link> : <span />}
        {next ? <Link href={`/speelronde/${next}`} className="text-sm font-semibold text-muted hover:text-accent">Ronde {next} →</Link> : <span />}
      </div>
      <h1 className="pt-2 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie speelronde {week.round}</h1>
      <p className="mt-1 text-sm text-muted">{week.label}</p>
      {intro && <p className="mt-4 max-w-2xl text-sm text-foreground">{intro}</p>}
      {text && <p className="mt-4 max-w-2xl text-sm text-foreground">{text}</p>}
      {topper && (
        <section className="w-full pt-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">De topper</h2>
          <MatchGrid>
            <MatchCard match={topper} featured showDate />
          </MatchGrid>
        </section>
      )}
      <section className="w-full py-8">
        <h2 className="mb-4 text-2xl font-extrabold text-foreground">Alle wedstrijden</h2>
        <MatchGrid>
          {sorted.map((m) => (
            <MatchCard key={m.id} match={m} showDate />
          ))}
        </MatchGrid>
      </section>
      <RoundPredictor round={week.round!} matches={predict} />
    </PageShell>
  )
}

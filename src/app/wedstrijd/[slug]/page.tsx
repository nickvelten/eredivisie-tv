import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { duelSlug, fetchEredivisieData, findMatch } from '@/lib/espn'
import { fetchAllPlayers } from '@/lib/players'
import { EventIcon, StadiumIcon } from '@/components/Icons'
import { PageShell } from '@/components/PageShell'
import { MatchCard, MatchGrid } from '@/components/MatchCard'
import { BroadcastBadge } from '@/components/BroadcastBadge'
import { MatchCalendarButton } from '@/components/CalendarButtons'
import { OddsBar, BettingNotice } from '@/components/OddsBar'
import { matchStructuredData, SITE_URL } from '@/lib/structured-data'
import { formatDutchDate, formatTime } from '@/lib/utils'
import { Club, EredivisieData, FormResult, Match, Player } from '@/data/types'
import { SHOW_ODDS } from '@/lib/betting'
import { fetchMatchDetails } from '@/lib/match-details'
import { MatchDetailsView } from '@/components/MatchDetailsView'
import { LiveCentre } from '@/components/LiveCentre'
import { seasonSlug, stadiumSlug } from '@/lib/espn'

type Params = { params: Promise<{ slug: string }> }

export const revalidate = 300

export async function generateStaticParams() {
  const { allMatches } = await fetchEredivisieData()
  return allMatches.map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const result = await findMatch(slug)
  if (!result) return { title: 'Wedstrijd niet gevonden | Eredivisie.tv' }
  const { match } = result
  const tv = match.broadcasts.find((b) => b.type === 'tv')?.name ?? 'ESPN'
  const when = `${formatDutchDate(match.date)} om ${formatTime(match.date)}`
  const name = `${match.homeTeam.name} – ${match.awayTeam.name}`
  const title =
    match.status === 'finished' && match.score
      ? `${name} ${match.score.home}-${match.score.away}: uitslag en doelpuntenmakers | Eredivisie.tv`
      : `${name} op TV: ${when} op ${tv} | Eredivisie.tv`
  const description =
    match.status === 'finished' && match.score
      ? `${name} eindigde ${formatDutchDate(match.date)} in ${match.score.home}-${match.score.away}. Bekijk de doelpuntenmakers, kaarten en het verloop van de Eredivisie-wedstrijd.`
      : `Waar kijk je ${name}? ${when} live op ${tv}. Aftraptijd, zender, stadion, vorm en voorbeschouwing.`
  const url = `${SITE_URL}/wedstrijd/${match.slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

function PlayerName({ name, slugs }: { name: string; slugs: Map<string, string> }) {
  const slug = slugs.get(name)
  return slug ? <Link href={`/speler/${slug}`} className="hover:text-accent hover:underline">{name}</Link> : <>{name}</>
}

function Timeline({ match, slugs }: { match: Match; slugs: Map<string, string> }) {
  const events = match.events ?? []
  if (events.length === 0) return null
  return (
    <section className="w-full py-8">
      <h2 className="mb-4 text-2xl font-extrabold text-foreground">Verloop</h2>
      <ol className="divide-y divide-border rounded-xl bg-card shadow-sm ring-1 ring-border">
        {events.map((e, i) => {
          const isHome = e.teamId === match.homeTeam.id
          return (
            <li key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2.5 text-sm">
              <span className="truncate text-right font-semibold text-foreground">
                {isHome && <><EventIcon type={e.type} /> <PlayerName name={e.player} slugs={slugs} /></>}
              </span>
              <span className="w-12 rounded-md bg-foreground/5 py-0.5 text-center text-xs font-bold tabular-nums text-muted">{e.minute}</span>
              <span className="truncate font-semibold text-foreground">
                {!isHome && <><PlayerName name={e.player} slugs={slugs} /> <EventIcon type={e.type} /></>}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

const formColors: Record<FormResult, string> = { W: 'bg-emerald-500', D: 'bg-amber-400', L: 'bg-red-500' }

function FormDots({ form }: { form?: FormResult[] }) {
  if (!form || form.length === 0) return <span className="text-muted-light">–</span>
  return (
    <span className="inline-flex gap-1">
      {form.map((r, i) => (
        <span key={i} className={`inline-block h-5 w-5 rounded-full text-center text-[10px] font-bold leading-5 text-white ${formColors[r]}`}>{r}</span>
      ))}
    </span>
  )
}

/** Side-by-side comparison of both clubs before kickoff. */
function Preview({ match, data, players }: { match: Match; data: EredivisieData; players: Player[] }) {
  const home = data.standings.find((s) => s.club.id === match.homeTeam.id)
  const away = data.standings.find((s) => s.club.id === match.awayTeam.id)
  if (!home || !away) return null
  const scorer = (club: Club) =>
    players.filter((p) => p.club.id === club.id && p.stats.goals > 0).sort((a, b) => b.stats.goals - a.stats.goals)[0]
  const homeScorer = scorer(match.homeTeam)
  const awayScorer = scorer(match.awayTeam)

  const rows: Array<{ label: string; home: React.ReactNode; away: React.ReactNode }> = [
    { label: 'Positie', home: `${home.position}e`, away: `${away.position}e` },
    { label: 'Punten', home: home.points, away: away.points },
    { label: 'Gespeeld', home: home.played, away: away.played },
    { label: 'Doelsaldo', home: `${home.goalsFor}-${home.goalsAgainst}`, away: `${away.goalsFor}-${away.goalsAgainst}` },
    { label: 'Vorm', home: <FormDots form={home.form} />, away: <FormDots form={away.form} /> },
    {
      label: 'Topscorer',
      home: homeScorer ? <Link href={`/speler/${homeScorer.slug}`} className="hover:text-accent">{homeScorer.name} ({homeScorer.stats.goals})</Link> : '–',
      away: awayScorer ? <Link href={`/speler/${awayScorer.slug}`} className="hover:text-accent">{awayScorer.name} ({awayScorer.stats.goals})</Link> : '–',
    },
  ]

  const gap = Math.abs(home.position - away.position)
  const leader = home.position < away.position ? match.homeTeam : match.awayTeam
  const intro =
    gap <= 2
      ? `${match.homeTeam.name} (${home.position}e) en ${match.awayTeam.name} (${away.position}e) staan dicht bij elkaar in de stand.`
      : `${leader.name} staat ${gap} plaatsen hoger in de stand en begint als favoriet aan de wedstrijd.`

  return (
    <section className="w-full py-8">
      <h2 className="mb-2 text-2xl font-extrabold text-foreground">Voorbeschouwing</h2>
      <p className="mb-4 text-sm text-muted">{intro}</p>
      <div className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border px-4 py-3 text-sm font-extrabold text-foreground">
          <span className="flex items-center gap-2">
            <Image src={match.homeTeam.logo} alt="" width={20} height={20} className="h-5 w-5" />
            {match.homeTeam.shortName}
          </span>
          <span />
          <span className="flex items-center justify-end gap-2">
            {match.awayTeam.shortName}
            <Image src={match.awayTeam.logo} alt="" width={20} height={20} className="h-5 w-5" />
          </span>
        </div>
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border px-4 py-2.5 text-sm last:border-b-0">
            <span className="font-semibold text-foreground">{r.home}</span>
            <span className="text-center text-[11px] font-bold uppercase tracking-wider text-muted-light">{r.label}</span>
            <span className="text-right font-semibold text-foreground">{r.away}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function RecentResults({ club, matches, current }: { club: Club; matches: Match[]; current: Match }) {
  const recent = matches
    .filter((m) => m.status === 'finished' && m.id !== current.id && (m.homeTeam.id === club.id || m.awayTeam.id === club.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
  if (recent.length === 0) return null
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-foreground">
        <Image src={club.logo} alt="" width={18} height={18} className="h-[18px] w-[18px]" />
        Laatste duels {club.shortName}
      </h3>
      <ul className="divide-y divide-border rounded-xl bg-card shadow-sm ring-1 ring-border">
        {recent.map((m) => (
          <li key={m.id}>
            <Link href={`/wedstrijd/${m.slug}`} className="flex items-center justify-between gap-3 px-4 py-2 text-sm hover:bg-background">
              <span className="truncate text-foreground">{m.homeTeam.shortName} – {m.awayTeam.shortName}</span>
              <span className="shrink-0 font-extrabold tabular-nums text-foreground">{m.score?.home}-{m.score?.away}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function MatchPage({ params }: Params) {
  const { slug } = await params
  const result = await findMatch(slug)
  if (!result) notFound()
  const { match, data, archived } = result
  // Old numeric URLs and renamed clubs land on the canonical slug
  if (slug !== match.slug) permanentRedirect(`/wedstrijd/${match.slug}`)

  const [players, details] = await Promise.all([fetchAllPlayers(), fetchMatchDetails(match)])
  const slugsByName = new Map(players.map((p) => [p.name, p.slug]))
  const slugsById = new Map(players.map((p) => [p.id, p.slug]))
  // Archived matches: the current table says nothing about that season
  const seasonYear = new Date(match.date).getUTCMonth() >= 6 ? new Date(match.date).getUTCFullYear() : new Date(match.date).getUTCFullYear() - 1

  const tv = match.broadcasts.find((b) => b.type === 'tv')
  const online = match.broadcasts.find((b) => b.type === 'online')
  const headToHead = data.allMatches.filter(
    (m) =>
      m.id !== match.id &&
      ((m.homeTeam.id === match.homeTeam.id && m.awayTeam.id === match.awayTeam.id) ||
        (m.homeTeam.id === match.awayTeam.id && m.awayTeam.id === match.homeTeam.id))
  )
  const homeForm = archived ? undefined : data.standings.find((s) => s.club.id === match.homeTeam.id)
  const awayForm = archived ? undefined : data.standings.find((s) => s.club.id === match.awayTeam.id)
  const name = `${match.homeTeam.name} – ${match.awayTeam.name}`

  return (
    <PageShell
      data={data}
      breadcrumbs={[
        archived
          ? { label: `Uitslagen ${seasonSlug(seasonYear).replace('-', '/')}`, href: `/uitslagen/${seasonSlug(seasonYear)}` }
          : match.round
            ? { label: `Speelronde ${match.round}`, href: `/speelronde/${match.round}` }
            : { label: 'Programma', href: match.status === 'finished' ? '/uitslagen' : '/programma' },
        { label: name, href: `/wedstrijd/${match.slug}` },
      ]}
      sidebarOptions={{ highlightClubIds: [match.homeTeam.id, match.awayTeam.id] }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(matchStructuredData(match)) }} />

      <section className="w-full pb-4 pt-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-accent">
          {match.round ? `Speelronde ${match.round}` : 'Inhaalwedstrijd'} · {formatDutchDate(match.date)}
        </p>
        <h1 className="mb-4 mt-1 text-center text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
          {name}
          {match.status === 'scheduled' && <span className="text-muted"> op TV</span>}
        </h1>
        <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border sm:p-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <Link href={`/club/${match.homeTeam.slug}`} className="flex min-w-0 flex-col items-center gap-3 text-center hover:text-accent">
              <Image src={match.homeTeam.logo} alt={`Logo ${match.homeTeam.name}`} width={96} height={96} loading="eager" className="h-20 w-20 sm:h-24 sm:w-24" />
              <span className="text-sm font-extrabold text-foreground sm:text-lg">{match.homeTeam.name}</span>
              {homeForm && <span className="text-xs text-muted">{homeForm.position}e · {homeForm.points} pt</span>}
            </Link>
            <LiveCentre match={match} />
            <Link href={`/club/${match.awayTeam.slug}`} className="flex min-w-0 flex-col items-center gap-3 text-center hover:text-accent">
              <Image src={match.awayTeam.logo} alt={`Logo ${match.awayTeam.name}`} width={96} height={96} loading="eager" className="h-20 w-20 sm:h-24 sm:w-24" />
              <span className="text-sm font-extrabold text-foreground sm:text-lg">{match.awayTeam.name}</span>
              {awayForm && <span className="text-xs text-muted">{awayForm.position}e · {awayForm.points} pt</span>}
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-border pt-5 text-sm text-muted">
            {match.venue && (
              <Link href={`/stadion/${stadiumSlug(match.venue)}`} className="inline-flex items-center gap-1.5 hover:text-accent hover:underline">
                <StadiumIcon /> {match.venue}{match.city ? `, ${match.city}` : ''}
              </Link>
            )}
            <span className="flex items-center gap-2">
              Kijk op:
              {tv && <BroadcastBadge broadcast={tv} />}
              {online && <BroadcastBadge broadcast={online} />}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {match.status !== 'finished' && <MatchCalendarButton matchId={match.id} />}
            {match.odds && match.status === 'scheduled' && <OddsBar odds={match.odds} variant="large" />}
          </div>
          {match.odds && match.status === 'scheduled' && SHOW_ODDS && <BettingNotice className="mt-3 text-center" />}
        </div>
      </section>

      <Timeline match={match} slugs={slugsByName} />

      {details && <MatchDetailsView details={details} match={match} slugs={slugsById} />}

      {match.status !== 'finished' && <Preview match={match} data={data} players={players} />}

      {match.status !== 'finished' && (
        <section className="grid w-full gap-6 py-8 md:grid-cols-2">
          <RecentResults club={match.homeTeam} matches={data.allMatches} current={match} />
          <RecentResults club={match.awayTeam} matches={data.allMatches} current={match} />
        </section>
      )}

      {!archived && headToHead.length > 0 && (
        <section className="w-full py-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Onderlinge duels dit seizoen</h2>
          <MatchGrid>
            {headToHead.map((m) => (
              <MatchCard key={m.id} match={m} showDate />
            ))}
          </MatchGrid>
        </section>
      )}

      <section className="w-full py-6">
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href={`/duel/${duelSlug(match.homeTeam, match.awayTeam)}`} className="rounded-full bg-card px-4 py-2 font-semibold text-foreground shadow-sm ring-1 ring-border hover:text-accent">
            Alles over {match.homeTeam.shortName} – {match.awayTeam.shortName} →
          </Link>
          <Link href={`/club/${match.homeTeam.slug}`} className="rounded-full bg-card px-4 py-2 font-semibold text-muted shadow-sm ring-1 ring-border hover:text-accent">
            Alle wedstrijden van {match.homeTeam.shortName}
          </Link>
          <Link href={`/club/${match.awayTeam.slug}`} className="rounded-full bg-card px-4 py-2 font-semibold text-muted shadow-sm ring-1 ring-border hover:text-accent">
            Alle wedstrijden van {match.awayTeam.shortName}
          </Link>
        </div>
      </section>
    </PageShell>
  )
}

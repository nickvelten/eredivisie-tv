import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { findMatchById } from '@/lib/espn'
import { PageShell } from '@/components/PageShell'
import { MatchCard, MatchGrid } from '@/components/MatchCard'
import { KickoffCountdown } from '@/components/KickoffCountdown'
import { BroadcastBadge } from '@/components/BroadcastBadge'
import { MatchCalendarButton } from '@/components/CalendarButtons'
import { matchStructuredData, SITE_URL } from '@/lib/structured-data'
import { formatDutchDate, formatTime } from '@/lib/utils'
import { Match, MatchEvent } from '@/data/types'

type Params = { params: Promise<{ id: string }> }

const UNIBET_URL = 'https://www.unibet.nl/betting/sports/filter/football/netherlands/eredivisie'

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const result = await findMatchById(id)
  if (!result) return { title: 'Wedstrijd niet gevonden | Eredivisie.tv' }
  const { match } = result
  const tv = match.broadcasts.find((b) => b.type === 'tv')?.name ?? 'ESPN'
  const when = `${formatDutchDate(match.date)} om ${formatTime(match.date)}`
  const title =
    match.status === 'finished' && match.score
      ? `${match.homeTeam.name} – ${match.awayTeam.name} ${match.score.home}-${match.score.away} | Eredivisie.tv`
      : `${match.homeTeam.name} – ${match.awayTeam.name} op TV: ${when} op ${tv} | Eredivisie.tv`
  const description =
    match.status === 'finished'
      ? `Uitslag en doelpuntenmakers van ${match.homeTeam.name} tegen ${match.awayTeam.name} in de Eredivisie.`
      : `Waar kijk je ${match.homeTeam.name} – ${match.awayTeam.name}? ${when} live op ${tv} en ESPN.nl. Aftraptijd, zender, odds en stadion.`
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/wedstrijd/${match.id}` },
    openGraph: { title, description, url: `${SITE_URL}/wedstrijd/${match.id}`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv' },
  }
}

function eventIcon(type: MatchEvent['type']): string {
  switch (type) {
    case 'goal': return '⚽'
    case 'penalty': return '⚽ (pen.)'
    case 'own-goal': return '⚽ (e.d.)'
    case 'yellow': return '🟨'
    case 'red': return '🟥'
  }
}

function Timeline({ match }: { match: Match }) {
  const events = match.events ?? []
  if (events.length === 0) return null
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8">
      <h2 className="mb-4 text-2xl font-extrabold text-foreground">Verloop</h2>
      <ol className="divide-y divide-border rounded-xl bg-card shadow-sm ring-1 ring-border">
        {events.map((e, i) => {
          const isHome = e.teamId === match.homeTeam.id
          return (
            <li key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2.5 text-sm">
              <span className={`truncate text-right ${isHome ? 'font-semibold text-foreground' : 'text-transparent'}`}>
                {isHome ? `${eventIcon(e.type)} ${e.player}` : '·'}
              </span>
              <span className="w-12 rounded-md bg-foreground/5 py-0.5 text-center text-xs font-bold tabular-nums text-muted">{e.minute}</span>
              <span className={`truncate ${!isHome ? 'font-semibold text-foreground' : 'text-transparent'}`}>
                {!isHome ? `${e.player} ${eventIcon(e.type)}` : '·'}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default async function MatchPage({ params }: Params) {
  const { id } = await params
  const result = await findMatchById(id)
  if (!result) notFound()
  const { match, data } = result

  const tv = match.broadcasts.find((b) => b.type === 'tv')
  const online = match.broadcasts.find((b) => b.type === 'online')
  const headToHead = data.allMatches.filter(
    (m) =>
      m.id !== match.id &&
      ((m.homeTeam.id === match.homeTeam.id && m.awayTeam.id === match.awayTeam.id) ||
        (m.homeTeam.id === match.awayTeam.id && m.awayTeam.id === match.homeTeam.id))
  )
  const homeForm = data.standings.find((s) => s.club.id === match.homeTeam.id)
  const awayForm = data.standings.find((s) => s.club.id === match.awayTeam.id)

  return (
    <PageShell data={data}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(matchStructuredData(match)) }} />

      <section className="mx-auto w-full max-w-5xl px-4 pb-4 pt-10">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-accent">
          {match.round ? `Speelronde ${match.round}` : 'Inhaalwedstrijd'} · {formatDutchDate(match.date)}
        </p>
        <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border sm:p-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <Link href={`/club/${match.homeTeam.slug}`} className="flex min-w-0 flex-col items-center gap-3 text-center hover:text-accent">
              <Image src={match.homeTeam.logo} alt="" width={96} height={96} className="h-20 w-20 sm:h-24 sm:w-24" />
              <span className="text-sm font-extrabold text-foreground sm:text-lg">{match.homeTeam.name}</span>
              {homeForm && <span className="text-xs text-muted">{homeForm.position}e · {homeForm.points} pt</span>}
            </Link>
            <div className="flex flex-col items-center gap-2">
              {match.status === 'scheduled' ? (
                <>
                  <span className="rounded-xl bg-accent-light px-4 py-2 text-3xl font-extrabold tabular-nums text-accent sm:text-4xl">{formatTime(match.date)}</span>
                  <KickoffCountdown date={match.date} />
                </>
              ) : (
                <>
                  <span className="text-4xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-5xl">
                    {match.score?.home ?? 0}<span className="mx-2 text-muted-light">–</span>{match.score?.away ?? 0}
                  </span>
                  {match.status === 'live' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-white">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75 motion-reduce:animate-none" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                      {match.clock ?? 'Live'}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-light">Eindstand</span>
                  )}
                </>
              )}
            </div>
            <Link href={`/club/${match.awayTeam.slug}`} className="flex min-w-0 flex-col items-center gap-3 text-center hover:text-accent">
              <Image src={match.awayTeam.logo} alt="" width={96} height={96} className="h-20 w-20 sm:h-24 sm:w-24" />
              <span className="text-sm font-extrabold text-foreground sm:text-lg">{match.awayTeam.name}</span>
              {awayForm && <span className="text-xs text-muted">{awayForm.position}e · {awayForm.points} pt</span>}
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-border pt-5 text-sm text-muted">
            {match.venue && <span>🏟️ {match.venue}{match.city ? `, ${match.city}` : ''}</span>}
            <span className="flex items-center gap-2">
              Kijk op:
              {tv && <BroadcastBadge broadcast={tv} />}
              {online && <BroadcastBadge broadcast={online} />}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {match.status !== 'finished' && <MatchCalendarButton matchId={match.id} />}
            {match.odds && match.status === 'scheduled' && (
              <a
                href={UNIBET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#147B45] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#00531D] hover:shadow-md"
              >
                <span><span className="text-[#FFE71F]">1</span> {match.odds.home.toFixed(2)}</span>
                <span className="border-l border-white/20 pl-2"><span className="text-[#FFE71F]">X</span> {match.odds.draw.toFixed(2)}</span>
                <span className="border-l border-white/20 pl-2"><span className="text-[#FFE71F]">2</span> {match.odds.away.toFixed(2)}</span>
                <span className="ml-1 rounded bg-[#FFE71F] px-1.5 py-0.5 text-[10px] font-extrabold text-[#00531D]">Unibet</span>
              </a>
            )}
          </div>
        </div>
      </section>

      <Timeline match={match} />

      {headToHead.length > 0 && (
        <section className="mx-auto w-full max-w-5xl px-4 py-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Onderlinge duels dit seizoen</h2>
          <MatchGrid>
            {headToHead.map((m) => (
              <MatchCard key={m.id} match={m} showDate />
            ))}
          </MatchGrid>
        </section>
      )}
    </PageShell>
  )
}

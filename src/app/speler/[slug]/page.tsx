import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchEredivisieData } from '@/lib/espn'
import { findPlayer, sortSquad } from '@/lib/players'
import { PageShell } from '@/components/PageShell'
import { PlayerAvatar } from '@/components/PlayerAvatar'
import { PlayerTile } from '@/components/PlayerTile'
import { MatchCard, MatchGrid } from '@/components/MatchCard'
import { playerStructuredData, SITE_URL } from '@/lib/structured-data'
import { clubTheme } from '@/lib/color'
import { ComparePicker } from '@/components/ComparePicker'
import { Player } from '@/data/types'

type Params = { params: Promise<{ slug: string }> }

export const revalidate = 3600

// Rendered on first visit, then cached (ISR); hundreds of pages, so not at build time
export async function generateStaticParams() {
  return []
}

function positionLabel(p: Player): string {
  return p.position === 'Speler' ? 'speler' : p.position.toLowerCase()
}

function summary(p: Player): string {
  const s = p.stats
  const role = `${positionLabel(p)} van ${p.club.name}`
  if (s.appearances === 0) return `${p.name} is ${role} en kwam dit Eredivisie-seizoen nog niet in actie.`
  if (p.position === 'Keeper')
    return `${p.name} is ${role} en speelde dit seizoen ${s.appearances} Eredivisie-wedstrijden, met ${s.saves} reddingen en ${s.goalsConceded} tegengoals.`
  return `${p.name} is ${role} en speelde dit seizoen ${s.appearances} Eredivisie-wedstrijden${s.subIns ? ` (${s.subIns} keer als invaller)` : ''}, met ${s.goals} doelpunt${s.goals === 1 ? '' : 'en'} en ${s.assists} assist${s.assists === 1 ? '' : 's'}.`
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const result = await findPlayer(slug)
  if (!result) return { title: 'Speler niet gevonden | Eredivisie.tv' }
  const { player } = result
  const title = `${player.name} (${player.club.shortName}): statistieken en wedstrijden | Eredivisie.tv`
  const full = `${summary(player)} Bekijk zijn statistieken en wanneer ${player.club.shortName} weer op TV is.`
  const description = full.length <= 160 ? full : summary(player)
  const url = `${SITE_URL}/speler/${player.slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    // Players without a minute this season stay out of the index until their debut
    robots: player.stats.appearances > 0 ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, type: 'profile', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: player.headshot ? [player.headshot] : undefined },
    twitter: { card: 'summary', title, description },
  }
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-card px-4 py-3 shadow-sm ring-1 ring-border">
      <p className="text-2xl font-extrabold tabular-nums text-foreground">{value}</p>
      <p className="text-xs font-semibold text-muted">{label}</p>
    </div>
  )
}

export default async function PlayerPage({ params }: Params) {
  const { slug } = await params
  const [result, data] = await Promise.all([findPlayer(slug), fetchEredivisieData()])
  if (!result) notFound()
  const { player, players } = result
  const { club, stats } = player
  const theme = clubTheme(club.color)

  const teammates = sortSquad(players.filter((p) => p.club.id === club.id && p.id !== player.id && p.position === player.position)).slice(0, 6)
  const nextMatches = data.allMatches
    .filter((m) => m.status !== 'finished' && (m.homeTeam.id === club.id || m.awayTeam.id === club.id))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
  const goalsRank = [...players].sort((a, b) => b.stats.goals - a.stats.goals).findIndex((p) => p.id === player.id) + 1

  const statTiles: Array<{ label: string; value: number | string }> =
    player.position === 'Keeper'
      ? [
          { label: 'Wedstrijden', value: stats.appearances },
          { label: 'Reddingen', value: stats.saves },
          { label: 'Tegengoals', value: stats.goalsConceded },
          { label: 'Gele kaarten', value: stats.yellowCards },
        ]
      : [
          { label: 'Wedstrijden', value: stats.appearances },
          { label: 'Doelpunten', value: stats.goals },
          { label: 'Assists', value: stats.assists },
          { label: 'Schoten (op doel)', value: `${stats.shots} (${stats.shotsOnTarget})` },
          { label: 'Invalbeurten', value: stats.subIns },
          { label: 'Gele kaarten', value: stats.yellowCards },
          { label: 'Rode kaarten', value: stats.redCards },
        ]

  const facts: Array<[string, string | undefined]> = [
    ['Club', club.name],
    ['Positie', player.position],
    ['Rugnummer', player.jersey],
    ['Leeftijd', player.age ? `${player.age} jaar` : undefined],
    ['Geboortedatum', player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : undefined],
    ['Nationaliteit', player.nationality],
    ['Lengte', player.heightCm ? `${player.heightCm} cm` : undefined],
  ]

  return (
    <PageShell
      data={data}
      breadcrumbs={[
        { label: club.name, href: `/club/${club.slug}` },
        { label: player.name, href: `/speler/${player.slug}` },
      ]}
      sidebarOptions={{ highlightClubIds: [club.id] }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(playerStructuredData(player)) }} />

      <section className="w-full pt-4">
        <div
          className="relative overflow-hidden rounded-2xl p-6 shadow-md sm:p-8"
          style={{ background: `linear-gradient(135deg, ${theme.heroFrom} 0%, ${theme.heroTo} 100%)`, color: theme.onHero }}
        >
          <Image src={club.logo} alt="" width={320} height={320} aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 opacity-10" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="block self-start rounded-full bg-white/90 p-1 shadow-lg">
              <PlayerAvatar player={player} size={104} eager />
            </span>
            <div className="min-w-0 flex-1">
              <Link href={`/club/${club.slug}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:underline" style={{ color: theme.onHeroMuted }}>
                <Image src={club.logo} alt="" width={18} height={18} className="h-[18px] w-[18px] rounded-full bg-white p-0.5" />
                {club.name}
              </Link>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {player.jersey && <span className="mr-2 opacity-60">{player.jersey}</span>}
                {player.name}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: theme.onHeroMuted }}>
                <span>{player.position}</span>
                {player.nationality && (
                  <span className="inline-flex items-center gap-1.5">
                    {player.flag && <Image src={player.flag} alt="" width={16} height={16} className="h-3.5 w-3.5 rounded-sm object-cover" />}
                    {player.nationality}
                  </span>
                )}
                {player.age && <span>{player.age} jaar</span>}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-8">
        <h2 className="mb-2 text-2xl font-extrabold text-foreground">Seizoen {data.standingsSeason?.label ?? ''}</h2>
        <p className="mb-4 max-w-2xl text-sm text-muted">
          {summary(player)}
          {stats.goals > 0 && goalsRank > 0 && goalsRank <= 25 && (
            <> Daarmee staat hij {goalsRank}e op de <Link href="/topscorers" className="font-semibold text-accent hover:underline">topscorerslijst</Link>.</>
          )}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statTiles.map((t) => (
            <Stat key={t.label} label={t.label} value={t.value} />
          ))}
        </div>
      </section>

      <section className="w-full py-8">
        <h2 className="mb-4 text-2xl font-extrabold text-foreground">Profiel</h2>
        <dl className="divide-y divide-border rounded-xl bg-card shadow-sm ring-1 ring-border">
          {facts
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right font-semibold text-foreground">{v}</dd>
              </div>
            ))}
        </dl>
      </section>

      <section className="w-full py-8">
        <h2 className="mb-3 text-2xl font-extrabold text-foreground">Vergelijk {player.name.split(' ').slice(-1)[0]}</h2>
        <ComparePicker initialA={player.name} />
      </section>

      {nextMatches.length > 0 && (
        <section className="w-full py-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">{player.name.split(' ').slice(-1)[0]} op TV</h2>
          <MatchGrid>
            {nextMatches.map((m) => (
              <MatchCard key={m.id} match={m} showDate />
            ))}
          </MatchGrid>
        </section>
      )}

      {teammates.length > 0 && (
        <section className="w-full py-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Andere {positionLabel(player)}s van {club.shortName}</h2>
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {teammates.map((p) => (
              <li key={p.id}>
                <PlayerTile player={p} />
              </li>
            ))}
          </ul>
          <Link href={`/club/${club.slug}`} className="mt-4 inline-block text-sm font-semibold text-accent hover:underline">
            Hele selectie van {club.name} →
          </Link>
        </section>
      )}
    </PageShell>
  )
}

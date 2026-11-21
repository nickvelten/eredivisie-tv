import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { duelSlug, fetchEredivisieData, fetchSeasonArchive, findClubBySlug, seasonOptions } from '@/lib/espn'
import { playersByClub, POSITION_GROUPS } from '@/lib/players'
import { PageShell } from '@/components/PageShell'
import { MatchCard, MatchGrid } from '@/components/MatchCard'
import { KickoffCountdown } from '@/components/KickoffCountdown'
import { ClubCalendarButton } from '@/components/CalendarButtons'
import { SetFavoriteButton } from '@/components/SetFavoriteButton'
import { PushButton } from '@/components/PushButton'
import { Faq } from '@/components/Faq'
import { PlayerTile } from '@/components/PlayerTile'
import { TrophyIcon } from '@/components/Icons'
import { FaqItem, matchStructuredData, SITE_URL } from '@/lib/structured-data'
import { formatDutchDate, formatTime } from '@/lib/utils'
import { FormResult, Match, Club } from '@/data/types'
import { clubTheme } from '@/lib/color'
import type { CSSProperties } from 'react'

type Params = { params: Promise<{ slug: string }> }

export const revalidate = 300

export async function generateStaticParams() {
  const { clubs } = await fetchEredivisieData()
  return clubs.map((c) => ({ slug: c.slug }))
}

const formColors: Record<FormResult, string> = {
  W: 'bg-emerald-500',
  D: 'bg-amber-400',
  L: 'bg-red-500',
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const result = await findClubBySlug(slug)
  if (!result) return { title: 'Club niet gevonden | Eredivisie.tv' }
  const { club, data } = result
  const next = data.allMatches
    .filter((m) => m.status !== 'finished' && (m.homeTeam.id === club.id || m.awayTeam.id === club.id))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
  const tv = next?.broadcasts.find((b) => b.type === 'tv')?.name ?? 'ESPN'
  const title = `${club.name} op TV: programma, zender en uitslagen | Eredivisie.tv`
  const description = next
    ? `${club.name} speelt ${formatDutchDate(next.date)} om ${formatTime(next.date)} tegen ${opponent(next, club).name}, live op ${tv}. Bekijk het hele programma, de uitslagen, de selectie en de stand.`
    : `Alle wedstrijden van ${club.name} in de Eredivisie: programma, aftraptijden, uitslagen, selectie en op welke ESPN-zender je ${club.shortName} live kijkt.`
  const url = `${SITE_URL}/club/${club.slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

function opponent(match: Match, club: Club): Club {
  return match.homeTeam.id === club.id ? match.awayTeam : match.homeTeam
}

function clubFaq(club: Club, nextMatch: Match | undefined, upcoming: Match[], position?: number): FaqItem[] {
  const items: FaqItem[] = []
  if (nextMatch) {
    const tv = nextMatch.broadcasts.find((b) => b.type === 'tv')?.name ?? 'ESPN'
    const opp = opponent(nextMatch, club)
    const where = nextMatch.homeTeam.id === club.id ? 'thuis' : 'uit'
    items.push(
      {
        question: `Op welke zender is ${club.name} te zien?`,
        answer: `De volgende wedstrijd van ${club.name}, ${where} tegen ${opp.name}, is live te zien op ${tv}. Online kijk je in de ESPN Watch-app of de app van je provider. ESPN zit bij Ziggo in elk tv-pakket en is te krijgen via KPN, Odido en Canal Digitaal.`,
      },
      {
        question: `Hoe laat speelt ${club.name}?`,
        answer: `${club.name} speelt ${formatDutchDate(nextMatch.date)} om ${formatTime(nextMatch.date)} ${where} tegen ${opp.name}${nextMatch.venue ? ` in ${nextMatch.venue}` : ''}.`,
      }
    )
  } else {
    items.push({
      question: `Op welke zender is ${club.name} te zien?`,
      answer: `Alle Eredivisie-wedstrijden van ${club.name} zijn live te zien op ESPN (ESPN 1 t/m 4) en online in de ESPN Watch-app.`,
    })
  }
  if (upcoming.length > 1) {
    items.push({
      question: `Tegen wie speelt ${club.name} de komende weken?`,
      answer: upcoming
        .slice(0, 4)
        .map((m) => `${formatDutchDate(m.date)}: ${m.homeTeam.name} – ${m.awayTeam.name}`)
        .join('; ') + '.',
    })
  }
  if (position) {
    items.push({
      question: `Waar staat ${club.name} in de Eredivisie?`,
      answer: `${club.name} staat op dit moment ${position}e in de Eredivisie.`,
    })
  }
  return items
}

export default async function ClubPage({ params }: Params) {
  const { slug } = await params
  const result = await findClubBySlug(slug)
  if (!result) notFound()
  const { club, data } = result
  if (club.slug !== slug) permanentRedirect(`/club/${club.slug}`)
  const squad = await playersByClub(club.id)
  // Final position in each archived season (null when the club played elsewhere)
  const history = await Promise.all(
    (await seasonOptions())
      .filter((o) => !o.isCurrent)
      .map(async (o) => {
        const archive = await fetchSeasonArchive(o.year)
        const row = archive?.standings.find((s) => s.club.id === club.id)
        return { season: o, row, champion: archive?.standings[0]?.club.id === club.id }
      })
  )

  const clubMatches = data.allMatches
    .filter((m) => m.homeTeam.id === club.id || m.awayTeam.id === club.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const upcoming = clubMatches.filter((m) => m.status !== 'finished')
  const played = clubMatches.filter((m) => m.status === 'finished').reverse()
  const standing = data.standings.find((s) => s.club.id === club.id)
  const nextMatch = upcoming[0]
  const theme = clubTheme(club.color)
  const rivals = data.clubs.filter((c) => c.id !== club.id)
  const topScorers = [...squad].filter((p) => p.stats.goals > 0).sort((a, b) => b.stats.goals - a.stats.goals).slice(0, 3)
  // Re-tint the page accent in the club colour (header keeps the site colour)
  const pageStyle = { '--accent': theme.accent, '--accent-light': theme.accentLight, '--club-color': theme.base } as CSSProperties

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SportsTeam',
      name: club.name,
      sport: 'Soccer',
      logo: club.logo,
      url: `${SITE_URL}/club/${club.slug}`,
      memberOf: { '@type': 'SportsOrganization', name: 'Eredivisie' },
      athlete: squad.slice(0, 40).map((p) => ({ '@type': 'Person', name: p.name, url: `${SITE_URL}/speler/${p.slug}` })),
    },
    ...upcoming.slice(0, 5).flatMap(matchStructuredData),
  ]

  return (
    <PageShell
      data={data}
      breadcrumbs={[{ label: 'Clubs', href: '/clubs' }, { label: club.name, href: `/club/${club.slug}` }]}
      sidebarOptions={{ highlightClubIds: [club.id] }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={pageStyle}>
        <section className="w-full pb-4 pt-4">
          <div
            className="relative overflow-hidden rounded-2xl p-6 shadow-md sm:p-8"
            style={{ background: `linear-gradient(135deg, ${theme.heroFrom} 0%, ${theme.heroTo} 100%)`, color: theme.onHero }}
          >
            <Image
              src={club.logo}
              alt=""
              width={320}
              height={320}
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 opacity-10 blur-[1px] sm:h-80 sm:w-80"
            />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white p-3 shadow-lg ring-4 ring-white/30 sm:h-28 sm:w-28">
                <Image src={club.logo} alt={`Logo ${club.name}`} width={96} height={96} loading="eager" fetchPriority="high" className="h-full w-full object-contain" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.onHeroMuted }}>
                  Eredivisie {data.standingsSeason?.label ?? ''}
                </p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{club.name} op TV</h1>
                {standing && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm" style={{ color: theme.onHeroMuted }}>
                    <Link href="/stand" className="hover:underline">
                      <span className="text-lg font-extrabold" style={{ color: theme.onHero }}>{standing.position}e</span> in de stand
                    </Link>
                    <span><span className="text-lg font-extrabold" style={{ color: theme.onHero }}>{standing.points}</span> punten</span>
                    <span>{standing.won}W · {standing.drawn}G · {standing.lost}V</span>
                    {standing.form && standing.form.length > 0 && (
                      <span className="flex items-center gap-1" aria-label="Vorm">
                        {standing.form.map((r, i) => (
                          <span key={i} className={`inline-block h-5 w-5 rounded-full text-center text-[10px] font-bold leading-5 text-white ${formColors[r]}`}>{r}</span>
                        ))}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <SetFavoriteButton clubId={club.id} />
                <ClubCalendarButton slug={club.slug} clubName={club.name} onHero />
                <PushButton club={club} onHero />
              </div>
            </div>
          </div>
        </section>

        {nextMatch && (
          <section className="w-full py-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold text-foreground">Eerstvolgende wedstrijd</h2>
              {nextMatch.status === 'scheduled' && <KickoffCountdown date={nextMatch.date} />}
            </div>
            <MatchGrid>
              <MatchCard match={nextMatch} featured showDate />
            </MatchGrid>
          </section>
        )}

        {upcoming.length > 1 && (
          <section className="w-full py-8">
            <h2 className="mb-4 text-2xl font-extrabold text-foreground">Programma</h2>
            <MatchGrid>
              {upcoming.slice(1).map((m) => (
                <MatchCard key={m.id} match={m} showDate />
              ))}
            </MatchGrid>
          </section>
        )}

        {played.length > 0 && (
          <section className="w-full py-8">
            <h2 className="mb-4 text-2xl font-extrabold text-foreground">Uitslagen</h2>
            <MatchGrid>
              {played.map((m) => (
                <MatchCard key={m.id} match={m} showDate />
              ))}
            </MatchGrid>
          </section>
        )}

        {clubMatches.length === 0 && (
          <section className="w-full py-8">
            <p className="text-sm text-muted">Nog geen wedstrijden van {club.name} in het programma.</p>
          </section>
        )}

        {squad.length > 0 && (
          <section className="w-full py-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-2xl font-extrabold text-foreground">Selectie {club.name}</h2>
              {topScorers.length > 0 && (
                <p className="text-sm text-muted">
                  Topscorer:{' '}
                  <Link href={`/speler/${topScorers[0].slug}`} className="font-semibold text-accent hover:underline">
                    {topScorers[0].name}
                  </Link>{' '}
                  ({topScorers[0].stats.goals})
                </p>
              )}
            </div>
            <div className="flex flex-col gap-6">
              {POSITION_GROUPS.map((pos) => {
                const group = squad.filter((p) => p.position === pos)
                if (group.length === 0) return null
                return (
                  <div key={pos}>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">{pos === 'Speler' ? 'Overig' : `${pos}s`}</h3>
                    <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {group.map((p) => (
                        <li key={p.id}>
                          <PlayerTile player={p} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {history.length > 0 && (
          <section className="w-full py-8">
            <h2 className="mb-4 text-2xl font-extrabold text-foreground">{club.name} in vorige seizoenen</h2>
            <div className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Seizoen</th>
                    <th className="px-4 py-3 text-center">Positie</th>
                    <th className="px-4 py-3 text-center">Punten</th>
                    <th className="hidden px-4 py-3 text-center sm:table-cell">W-G-V</th>
                    <th className="hidden px-4 py-3 text-center sm:table-cell">Doelsaldo</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(({ season, row, champion }) => (
                    <tr key={season.year} className="border-t border-border">
                      <td className="px-4 py-2.5">
                        <Link href={`/stand/${season.slug}`} className="font-semibold text-foreground hover:text-accent">{season.label}</Link>
                      </td>
                      {row ? (
                        <>
                          <td className="px-4 py-2.5 text-center font-extrabold text-foreground"><span className="inline-flex items-center gap-1">{row.position}e{champion && <TrophyIcon className="h-4 w-4 text-amber-500" />}</span></td>
                          <td className="px-4 py-2.5 text-center text-muted">{row.points}</td>
                          <td className="hidden px-4 py-2.5 text-center text-muted sm:table-cell">{row.won}-{row.drawn}-{row.lost}</td>
                          <td className="hidden px-4 py-2.5 text-center text-muted sm:table-cell">{row.goalsFor}-{row.goalsAgainst}</td>
                        </>
                      ) : (
                        <td colSpan={4} className="px-4 py-2.5 text-center text-muted">Niet in de Eredivisie</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <Faq title={`Veelgestelde vragen over ${club.name}`} items={clubFaq(club, nextMatch, upcoming, standing?.position)} />

        <section className="w-full py-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">{club.name} tegen…</h2>
          <ul className="flex flex-wrap gap-2">
            {rivals.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/duel/${duelSlug(club, r)}`}
                  className="inline-flex items-center gap-2 rounded-full bg-card py-1 pl-1 pr-3 text-xs font-semibold text-muted shadow-sm ring-1 ring-border transition-colors hover:text-accent hover:ring-accent/40"
                >
                  <Image src={r.logo} alt="" width={20} height={20} className="h-5 w-5" />
                  {club.shortName} – {r.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  )
}

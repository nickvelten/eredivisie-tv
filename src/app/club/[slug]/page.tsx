import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { findClubBySlug } from '@/lib/espn'
import { PageShell } from '@/components/PageShell'
import { MatchCard, MatchGrid } from '@/components/MatchCard'
import { KickoffCountdown } from '@/components/KickoffCountdown'
import { ClubCalendarButton } from '@/components/CalendarButtons'
import { SetFavoriteButton } from '@/components/SetFavoriteButton'
import { matchStructuredData, SITE_URL } from '@/lib/structured-data'
import { FormResult } from '@/data/types'
import { clubTheme } from '@/lib/color'
import type { CSSProperties } from 'react'

type Params = { params: Promise<{ slug: string }> }

const formColors: Record<FormResult, string> = {
  W: 'bg-emerald-500',
  D: 'bg-amber-400',
  L: 'bg-red-500',
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const result = await findClubBySlug(slug)
  if (!result) return { title: 'Club niet gevonden | Eredivisie.tv' }
  const { club } = result
  const title = `${club.name} op TV — programma, uitslagen en stand | Eredivisie.tv`
  const description = `Alle wedstrijden van ${club.name} in de Eredivisie: programma, aftraptijden, uitslagen, vorm en op welke ESPN-zender je ${club.shortName} live kijkt.`
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/club/${club.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/club/${club.slug}`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv' },
  }
}

export default async function ClubPage({ params }: Params) {
  const { slug } = await params
  const result = await findClubBySlug(slug)
  if (!result) notFound()
  const { club, data } = result

  const clubMatches = data.allMatches
    .filter((m) => m.homeTeam.id === club.id || m.awayTeam.id === club.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const upcoming = clubMatches.filter((m) => m.status !== 'finished')
  const played = clubMatches.filter((m) => m.status === 'finished').reverse()
  const standing = data.standings.find((s) => s.club.id === club.id)
  const nextMatch = upcoming[0]
  const theme = clubTheme(club.color)
  // Re-tint the page accent in the club colour (header keeps the site red)
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
    },
    ...upcoming.slice(0, 5).flatMap(matchStructuredData),
  ]

  return (
    <PageShell data={data}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={pageStyle}>
      <section className="mx-auto w-full max-w-5xl px-4 pb-4 pt-6 sm:pt-10">
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
              <Image src={club.logo} alt={club.name} width={96} height={96} className="h-full w-full object-contain" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.onHeroMuted }}>
                Eredivisie {data.standingsSeason?.label ?? ''}
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{club.name}</h1>
              {standing && (
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm" style={{ color: theme.onHeroMuted }}>
                  <span><span className="text-lg font-extrabold" style={{ color: theme.onHero }}>{standing.position}e</span> in de stand</span>
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
            </div>
          </div>
        </div>
      </section>

      {nextMatch && (
        <section className="mx-auto w-full max-w-5xl px-4 py-8">
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
        <section className="mx-auto w-full max-w-5xl px-4 py-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Programma</h2>
          <MatchGrid>
            {upcoming.slice(1).map((m) => (
              <MatchCard key={m.id} match={m} showDate />
            ))}
          </MatchGrid>
        </section>
      )}

      {played.length > 0 && (
        <section className="mx-auto w-full max-w-5xl px-4 py-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Uitslagen</h2>
          <MatchGrid>
            {played.map((m) => (
              <MatchCard key={m.id} match={m} showDate />
            ))}
          </MatchGrid>
        </section>
      )}

      {clubMatches.length === 0 && (
        <section className="mx-auto w-full max-w-5xl px-4 py-8">
          <p className="text-sm text-muted">Nog geen wedstrijden van {club.name} in het programma.</p>
        </section>
      )}
      </div>
    </PageShell>
  )
}

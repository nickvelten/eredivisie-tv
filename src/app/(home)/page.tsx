import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { FavoriteNextMatch } from '@/components/FavoriteNextMatch'
import { favoriteCandidates } from '@/lib/favorite-candidates'
import { TodayHighlight } from '@/components/TodayHighlight'
import { RoundSchedule } from '@/components/RoundSchedule'
import { Providers } from '@/components/Providers'
import { MatchdayTicker } from '@/components/MatchdayTicker'
import { isToday } from '@/lib/utils'
import { fetchEredivisieData } from '@/lib/espn'
import { matchStructuredData, organizationStructuredData, SITE_URL, websiteStructuredData } from '@/lib/structured-data'
import { languageAlternates } from '@/lib/i18n'

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL, languages: languageAlternates('/', '/en') },
  openGraph: {
    title: 'Eredivisie op TV vandaag: wedstrijden, zenders & tijden',
    description:
      'Welke Eredivisie-wedstrijd is vandaag op TV en op welke zender? Aftraptijden, uitslagen, stand en topscorers op één plek.',
    url: SITE_URL,
    type: 'website',
    locale: 'nl_NL',
    siteName: 'Eredivisie.tv',
  },
}

// Cached for everyone and rebuilt at most every 5 minutes (live scores).
export const revalidate = 300

export default async function Home() {
  const data = await fetchEredivisieData()
  const { matchweeks, allMatches, standings } = data

  // Today's matches are shown in TodayHighlight; the programme continues after them
  const todayIds = allMatches.filter((m) => isToday(m.date)).map((m) => m.id)

  const upcomingMatches = allMatches
    .filter((m) => m.status === 'scheduled')
    .slice(0, 10)
    .flatMap(matchStructuredData)

  return (
    <PageShell data={data}>
        <div className="pt-8 sm:pt-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Eredivisie op TV: wedstrijden, zenders en stand
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            Alle Eredivisie-wedstrijden met aftraptijd en ESPN-zender, de uitslagen, de{' '}
            <Link href="/stand" className="font-semibold text-accent hover:underline">actuele stand</Link> en de{' '}
            <Link href="/topscorers" className="font-semibold text-accent hover:underline">topscorers</Link>.
          </p>
        </div>
        <MatchdayTicker matches={allMatches.filter((m) => isToday(m.date))} />
        <FavoriteNextMatch matches={favoriteCandidates(allMatches)} standings={standings} />
        <TodayHighlight matches={allMatches} standings={standings} />
        <RoundSchedule matchweeks={matchweeks} mode="upcoming" title="Programma" excludeIds={todayIds} />
        <RoundSchedule matchweeks={matchweeks} mode="results" title="Uitslagen" />
        <Providers />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationStructuredData(), websiteStructuredData()]) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(upcomingMatches) }} />
      </PageShell>
  )
}

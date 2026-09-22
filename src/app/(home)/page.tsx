import { PageShell } from '@/components/PageShell'
import { FavoriteNextMatch } from '@/components/FavoriteNextMatch'
import { TodayHighlight } from '@/components/TodayHighlight'
import { MatchSchedule } from '@/components/MatchSchedule'
import { Results } from '@/components/Results'
import { Standings } from '@/components/Standings'
import { TopScorers } from '@/components/TopScorers'
import { Providers } from '@/components/Providers'
import { fetchEredivisieData } from '@/lib/espn'
import { matchStructuredData, SITE_URL } from '@/lib/structured-data'

// Reading the favourite-club cookie makes this route dynamic; the ESPN
// responses themselves are cached per fetch (see lib/espn.ts).

export default async function Home() {
  const data = await fetchEredivisieData()
  const { matchweeks, standings, allMatches, topScorers, topAssisters, standingsSeason, leadersSeason } = data

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Eredivisie.tv',
    url: SITE_URL,
    description:
      'Bekijk alle Eredivisie wedstrijden en ontdek waar je ze live kunt zien op TV en online. Compleet programma, uitslagen, stand, topscorers en TV gids.',
    inLanguage: 'nl',
    publisher: {
      '@type': 'Organization',
      name: 'Eredivisie.tv',
      url: SITE_URL,
    },
  }

  // Structured data for upcoming matches (SportsEvent + BroadcastEvent)
  const upcomingMatches = allMatches
    .filter((m) => m.status === 'scheduled')
    .slice(0, 10)
    .flatMap(matchStructuredData)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(upcomingMatches) }}
      />
      <PageShell data={data} showSections>
        <TodayHighlight matches={allMatches} standings={standings} />
        <FavoriteNextMatch matches={allMatches} />
        <MatchSchedule matchweeks={matchweeks} />
        <Results matchweeks={matchweeks} />
        <Standings standings={standings} season={standingsSeason} />
        <TopScorers topScorers={topScorers} topAssisters={topAssisters} season={leadersSeason} />
        <Providers />
      </PageShell>
    </>
  )
}

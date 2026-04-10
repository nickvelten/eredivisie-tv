import { Header } from '@/components/Header'
import { TodayHighlight } from '@/components/TodayHighlight'
import { MatchSchedule } from '@/components/MatchSchedule'
import { Results } from '@/components/Results'
import { Standings } from '@/components/Standings'
import { TopScorers } from '@/components/TopScorers'
import { Providers } from '@/components/Providers'
import { fetchEredivisieData } from '@/lib/espn'

export const revalidate = 3600 // ISR: revalidate every hour

export default async function Home() {
  const { matchweeks, standings, allMatches, topScorers, topAssisters } = await fetchEredivisieData()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Eredivisie.tv',
    url: 'https://eredivisie.tv',
    description:
      'Bekijk alle Eredivisie wedstrijden en ontdek waar je ze live kunt zien op TV en online. Compleet programma, uitslagen, stand, topscorers en TV gids.',
    inLanguage: 'nl',
    publisher: {
      '@type': 'Organization',
      name: 'Eredivisie.tv',
      url: 'https://eredivisie.tv',
    },
  }

  // Structured data for upcoming matches
  const upcomingMatches = allMatches
    .filter((m) => m.status === 'scheduled')
    .slice(0, 10)
    .map((m) => ({
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
      startDate: m.date,
      homeTeam: { '@type': 'SportsTeam', name: m.homeTeam.name },
      awayTeam: { '@type': 'SportsTeam', name: m.awayTeam.name },
      location: { '@type': 'Place', name: 'Eredivisie' },
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
      offers: {
        '@type': 'Offer',
        name: 'Kijk live op ESPN',
        url: 'https://www.espn.nl',
      },
    }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {upcomingMatches.map((match, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(match) }}
        />
      ))}
      <Header />
      <main className="flex-1">
        <TodayHighlight matches={allMatches} />
        <MatchSchedule matchweeks={matchweeks} />
        <Results matchweeks={matchweeks} />
        <Standings standings={standings} />
        <TopScorers topScorers={topScorers} topAssisters={topAssisters} />
        <Providers />
      </main>
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-sm font-medium text-muted mb-1">eredivisie.tv</p>
          <p className="text-xs text-muted-light">Niet officieel gelieerd aan de Eredivisie</p>
        </div>
      </footer>
    </>
  )
}

import { Header } from '@/components/Header'
import { ClubPicker } from '@/components/ClubPicker'
import { FavoriteClubProvider } from '@/lib/favorite-club'
import { TodayHighlight } from '@/components/TodayHighlight'
import { MatchSchedule } from '@/components/MatchSchedule'
import { Results } from '@/components/Results'
import { Standings } from '@/components/Standings'
import { TopScorers } from '@/components/TopScorers'
import { Providers } from '@/components/Providers'
import { fetchEredivisieData } from '@/lib/espn'

export const revalidate = 3600 // ISR: revalidate every hour

export default async function Home() {
  const { matchweeks, standings, allMatches, topScorers, topAssisters, standingsSeason, leadersSeason } = await fetchEredivisieData()

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
        <FavoriteClubProvider>
          <TodayHighlight matches={allMatches} />
          <ClubPicker matches={allMatches} />
          <MatchSchedule matchweeks={matchweeks} />
          <Results matchweeks={matchweeks} />
          <Standings standings={standings} season={standingsSeason} />
          <TopScorers topScorers={topScorers} topAssisters={topAssisters} season={leadersSeason} />
          <Providers />
        </FavoriteClubProvider>
      </main>
      <footer className="border-t border-border bg-card py-10">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center gap-6 text-center">
            <p className="text-base font-extrabold tracking-tight text-foreground">
              eredivisie<span className="text-accent">.tv</span>
            </p>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-muted">
              <a href="#vandaag" className="transition-colors hover:text-foreground">Vandaag</a>
              <a href="#programma" className="transition-colors hover:text-foreground">Programma</a>
              <a href="#stand" className="transition-colors hover:text-foreground">Stand</a>
              <a href="#topscorers" className="transition-colors hover:text-foreground">Topscorers</a>
              <a href="#providers" className="transition-colors hover:text-foreground">Providers</a>
            </nav>
            <div className="space-y-1.5 text-xs text-muted-light">
              <p>Niet officieel gelieerd aan de Eredivisie. Uitzendinformatie kan wijzigen; raadpleeg je provider.</p>
              <p>18+ | Wat kost gokken jou? Stop op tijd. <a href="https://www.loketkansspel.nl" target="_blank" rel="noopener noreferrer" className="underline transition-colors hover:text-foreground">loketkansspel.nl</a></p>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

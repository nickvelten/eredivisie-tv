import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { FavoriteNextMatch } from '@/components/FavoriteNextMatch'
import { TodayHighlight } from '@/components/TodayHighlight'
import { MatchSchedule } from '@/components/MatchSchedule'
import { Results } from '@/components/Results'
import { Providers } from '@/components/Providers'
import { MatchdayTicker } from '@/components/MatchdayTicker'
import { isToday } from '@/lib/utils'
import { fetchEredivisieData } from '@/lib/espn'
import { matchStructuredData, websiteStructuredData } from '@/lib/structured-data'

// Cached for everyone and rebuilt at most every 5 minutes (live scores).
export const revalidate = 300

export default async function Home() {
  const data = await fetchEredivisieData()
  const { matchweeks, allMatches, standings } = data

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
        <TodayHighlight matches={allMatches} standings={standings} />
        <FavoriteNextMatch matches={allMatches} />
        <MatchSchedule matchweeks={matchweeks} />
        <Results matchweeks={matchweeks} />
        <Providers />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(upcomingMatches) }} />
      </PageShell>
  )
}

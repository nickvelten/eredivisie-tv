import type { Metadata } from 'next'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import { PageShell } from '@/components/PageShell'
import { RoundSchedule } from '@/components/RoundSchedule'
import { LeagueCalendarButtons } from '@/components/CalendarButtons'
import { fetchEredivisieData } from '@/lib/espn'
import { matchStructuredData, SITE_URL } from '@/lib/structured-data'

export const revalidate = 300

const title = 'Eredivisie programma: alle wedstrijden en aftraptijden | Eredivisie.tv'
const description = 'Het complete Eredivisie-programma per speelronde: datum, aftraptijd, stadion en op welke ESPN-zender je elke wedstrijd live kijkt.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/programma` },
  openGraph: { title, description, url: `${SITE_URL}/programma`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
}

export default async function ProgrammaPage() {
  const data = await fetchEredivisieData()
  const jsonLd = data.allMatches.filter((m) => m.status === 'scheduled').slice(0, 18).flatMap(matchStructuredData)
  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Programma', href: '/programma' }]} sidebarOptions={{ hideUpcoming: true }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie programma</h1>
      <div className="mt-4">
        <LeagueCalendarButtons />
      </div>
      <RoundSchedule matchweeks={data.matchweeks} mode="upcoming" title="Eerstvolgende speelronde" showIndex />
    </PageShell>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { DayTabs } from '@/components/DayTabs'
import { ThreeDayGuide } from '@/components/ThreeDayGuide'
import { Faq } from '@/components/Faq'
import { fetchEredivisieData } from '@/lib/espn'
import { matchStructuredData, SITE_URL } from '@/lib/structured-data'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import { amsterdamDate, amsterdamDayFromToday, formatDutchDate, formatTime } from '@/lib/utils'

export const revalidate = 300

const title = 'Eredivisie op TV morgen: wedstrijden, tijden en zenders | Eredivisie.tv'
const description = 'Welke Eredivisie-wedstrijden zijn morgen op TV? Aftraptijden en de ESPN-zender per wedstrijd, plus de dag erna.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/eredivisie-op-tv-morgen` },
  openGraph: { title, description, url: `${SITE_URL}/eredivisie-op-tv-morgen`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
}

export default async function OpTvMorgenPage() {
  const data = await fetchEredivisieData()
  const tomorrowKey = amsterdamDayFromToday(1)
  const tomorrow = data.allMatches.filter((m) => amsterdamDate(m.date) === tomorrowKey)
  const next = data.allMatches
    .filter((m) => m.status === 'scheduled' && amsterdamDate(m.date) > tomorrowKey)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Op TV morgen', href: '/eredivisie-op-tv-morgen' }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tomorrow.flatMap(matchStructuredData)) }} />
      <DayTabs active="/eredivisie-op-tv-morgen" />
      <h1 className="pt-4 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie op TV morgen</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        {tomorrow.length > 0
          ? `Morgen ${tomorrow.length === 1 ? 'is er 1 wedstrijd' : `zijn er ${tomorrow.length} wedstrijden`} live op ESPN.`
          : next
            ? `Morgen geen Eredivisie. De eerstvolgende wedstrijd is ${next.homeTeam.name} – ${next.awayTeam.name}, ${formatDutchDate(next.date)} om ${formatTime(next.date)}.`
            : 'Morgen geen Eredivisie.'}{' '}
        Zie ook het <Link href="/programma" className="font-semibold text-accent hover:underline">volledige programma</Link>.
      </p>
      <ThreeDayGuide matches={data.allMatches} startOffset={1} />
      <Faq
        title="Veelgestelde vragen"
        items={[
          {
            question: 'Welke Eredivisie-wedstrijden zijn morgen op TV?',
            answer:
              tomorrow.length > 0
                ? tomorrow.map((m) => `${m.homeTeam.name} – ${m.awayTeam.name} om ${formatTime(m.date)} op ${m.broadcasts.find((b) => b.type === 'tv')?.name ?? 'ESPN'}`).join('; ') + '.'
                : 'Morgen wordt er geen Eredivisie gespeeld.',
          },
        ]}
      />
    </PageShell>
  )
}

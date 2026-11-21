import type { Metadata } from 'next'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { TodayHighlight } from '@/components/TodayHighlight'
import { Providers } from '@/components/Providers'
import { Faq } from '@/components/Faq'
import { DayTabs } from '@/components/DayTabs'
import { ThreeDayGuide } from '@/components/ThreeDayGuide'
import { fetchEredivisieData } from '@/lib/espn'
import { matchStructuredData, SITE_URL, FaqItem } from '@/lib/structured-data'
import { formatDutchDate, formatTime, isToday } from '@/lib/utils'

export const revalidate = 300

const title = 'Eredivisie op TV vandaag: welke wedstrijd op welke zender? | Eredivisie.tv'
const description =
  'Welke Eredivisie-wedstrijden zijn vandaag op TV? Alle aftraptijden en de ESPN-zender per wedstrijd, plus waar je ESPN kunt kijken en wat het kost.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/eredivisie-op-tv-vandaag` },
  openGraph: { title, description, url: `${SITE_URL}/eredivisie-op-tv-vandaag`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
}

export default async function OpTvVandaagPage() {
  const data = await fetchEredivisieData()
  const today = data.allMatches.filter((m) => isToday(m.date))
  const next = data.allMatches
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

  const faq: FaqItem[] = [
    {
      question: 'Welke Eredivisie-wedstrijden zijn vandaag op TV?',
      answer:
        today.length > 0
          ? today.map((m) => `${m.homeTeam.name} – ${m.awayTeam.name} om ${formatTime(m.date)} op ${m.broadcasts.find((b) => b.type === 'tv')?.name ?? 'ESPN'}`).join('; ') + '.'
          : next
            ? `Vandaag wordt er geen Eredivisie gespeeld. De eerstvolgende wedstrijd is ${next.homeTeam.name} – ${next.awayTeam.name} op ${formatDutchDate(next.date)} om ${formatTime(next.date)}.`
            : 'Vandaag wordt er geen Eredivisie gespeeld.',
    },
    {
      question: 'Op welke zender is de Eredivisie te zien?',
      answer:
        'Alle Eredivisie-wedstrijden zijn live te zien bij ESPN, verdeeld over ESPN 1, ESPN 2, ESPN 3 en ESPN 4. De topper van een speelmoment staat meestal op ESPN 1.',
    },
    {
      question: 'Kan ik de Eredivisie gratis kijken?',
      answer:
        'Nee, live wedstrijden zijn alleen te zien met ESPN via een tv-provider. Bij Ziggo zit ESPN in elk tv-pakket; bij Odido kan het ook met een dagpas. Samenvattingen zijn na afloop gratis te zien bij NOS Studio Sport.',
    },
    {
      question: 'Hoe kijk ik de Eredivisie online?',
      answer: 'Met ESPN via je provider kijk je in de ESPN Watch-app of de app van je provider (zoals Ziggo GO, KPN TV+ of de CANAL+ app) op je telefoon, tablet, laptop of smart-tv.',
    },
  ]

  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Op TV vandaag', href: '/eredivisie-op-tv-vandaag' }]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify((today.length > 0 ? today : []).flatMap(matchStructuredData)) }}
      />
      <DayTabs active="/eredivisie-op-tv-vandaag" />
      <h1 className="pt-4 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie op TV vandaag</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        {today.length > 0
          ? `Vandaag ${today.length === 1 ? 'is er 1 Eredivisie-wedstrijd' : `zijn er ${today.length} Eredivisie-wedstrijden`} live op ESPN.`
          : 'Vandaag geen Eredivisie. Hieronder de eerstvolgende speeldag.'}{' '}
        Bekijk het hele <Link href="/programma" className="font-semibold text-accent hover:underline">programma</Link>.
      </p>
      <TodayHighlight matches={data.allMatches} standings={data.standings} />
      <ThreeDayGuide matches={data.allMatches} startOffset={1} />
      <Providers />
      <Faq title="Veelgestelde vragen" items={faq} />
    </PageShell>
  )
}

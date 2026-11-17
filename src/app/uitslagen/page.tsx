import type { Metadata } from 'next'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import { PageShell } from '@/components/PageShell'
import { Results } from '@/components/Results'
import { fetchEredivisieData, seasonOptions } from '@/lib/espn'
import { SeasonSwitch } from '@/components/SeasonSwitch'
import { SITE_URL } from '@/lib/structured-data'

export const revalidate = 300

const title = 'Eredivisie uitslagen: alle scores van dit seizoen | Eredivisie.tv'
const description = 'Alle uitslagen van de Eredivisie per speelronde, met doelpuntenmakers en kaarten per wedstrijd.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/uitslagen` },
  openGraph: { title, description, url: `${SITE_URL}/uitslagen`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
}

export default async function UitslagenPage() {
  const options = await seasonOptions()
  const data = await fetchEredivisieData()
  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Uitslagen', href: '/uitslagen' }]}>
      <SeasonSwitch options={options} active={options[0].year} basePath="/uitslagen" />
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie uitslagen</h1>
      <Results matchweeks={data.matchweeks} title="Per speelronde" />
    </PageShell>
  )
}

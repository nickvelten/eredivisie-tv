import type { Metadata } from 'next'
import { CompetitionView } from '@/components/CompetitionPage'
import { fetchCompetition, fetchEredivisieData } from '@/lib/espn'
import { SITE_URL } from '@/lib/structured-data'
import { OG_DEFAULT_IMAGES } from '@/lib/og'

export const revalidate = 300

const title = 'KNVB Beker op TV: wedstrijden, zender en uitslagen | Eredivisie.tv'
const description = 'Wanneer en op welke zender is de KNVB Beker te zien? Het bekerprogramma met aftraptijden en de laatste uitslagen.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/knvb-beker` },
  openGraph: { title, description, url: `${SITE_URL}/knvb-beker`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
}

export default async function Page() {
  const [data, competition] = await Promise.all([fetchEredivisieData(), fetchCompetition('ned.cup')])
  return <CompetitionView data={data} competition={competition} path="/knvb-beker" intro="De KNVB Beker is het nationale bekertoernooi. Hier zie je de komende bekerwedstrijden en de laatste uitslagen." />
}

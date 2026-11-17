import type { Metadata } from 'next'
import { CompetitionView } from '@/components/CompetitionPage'
import { fetchCompetition, fetchEredivisieData } from '@/lib/espn'
import { SITE_URL } from '@/lib/structured-data'
import { OG_DEFAULT_IMAGES } from '@/lib/og'

export const revalidate = 300

const title = 'Eerste Divisie op TV (Keuken Kampioen Divisie): programma, zender en stand | Eredivisie.tv'
const description = 'Alle wedstrijden in de Eerste Divisie (Keuken Kampioen Divisie) met aftraptijd en zender, plus de actuele stand en de laatste uitslagen.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/eerste-divisie` },
  openGraph: { title, description, url: `${SITE_URL}/eerste-divisie`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
}

export default async function Page() {
  const [data, competition] = await Promise.all([fetchEredivisieData(), fetchCompetition('ned.2')])
  return <CompetitionView data={data} competition={competition} path="/eerste-divisie" intro="De Eerste Divisie, onder sponsornaam Keuken Kampioen Divisie, is het tweede niveau van het Nederlandse profvoetbal. Hier zie je de komende wedstrijden, de laatste uitslagen en de stand." />
}

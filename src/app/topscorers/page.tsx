import type { Metadata } from 'next'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import { PageShell } from '@/components/PageShell'
import { TopScorers } from '@/components/TopScorers'
import { fetchEredivisieData, seasonOptions } from '@/lib/espn'
import { SeasonSwitch } from '@/components/SeasonSwitch'
import { fetchAllPlayers } from '@/lib/players'
import { SITE_URL } from '@/lib/structured-data'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchEredivisieData()
  const season = (data.leadersSeason)?.label ?? ''
  const title = `Topscorers Eredivisie ${season}: doelpunten en assists | Eredivisie.tv`.replace('  ', ' ')
  const description = 'Wie is de topscorer van de Eredivisie? De ranglijst met doelpunten en assists van dit seizoen, met club en aantal wedstrijden.'
  return {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/topscorers` },
  openGraph: { title, description, url: `${SITE_URL}/topscorers`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
  }
}

export default async function TopscorersPage() {
  const options = await seasonOptions()
  const [data, players] = await Promise.all([fetchEredivisieData(), fetchAllPlayers()])
  const playerSlugs = Object.fromEntries(players.map((p) => [p.id, p.slug]))
  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Topscorers', href: '/topscorers' }]} sidebarOptions={{ hideScorers: true }}>
      <SeasonSwitch options={options} active={options[0].year} basePath="/topscorers" />
      <TopScorers
        topScorers={data.topScorers}
        topAssisters={data.topAssisters}
        season={data.leadersSeason}
        playerSlugs={playerSlugs}
        title="Topscorers Eredivisie"
        as="h1"
      />
    </PageShell>
  )
}

import type { Metadata } from 'next'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { Standings } from '@/components/Standings'
import { fetchEredivisieData, seasonOptions } from '@/lib/espn'
import { SeasonSwitch } from '@/components/SeasonSwitch'
import { StandTabs } from '@/components/StandTabs'
import { SITE_URL } from '@/lib/structured-data'
import { languageAlternates } from '@/lib/i18n'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchEredivisieData()
  const season = (data.standingsSeason)?.label ?? ''
  const title = `Eredivisie stand ${season}: actuele ranglijst | Eredivisie.tv`.replace('  ', ' ')
  const description = 'De actuele stand van de Eredivisie: punten, doelsaldo en vorm van alle 18 clubs, plus wie er Europees voetbal haalt en wie tegen degradatie vecht.'
  return {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/stand`, languages: languageAlternates('/stand', '/en/table') },
  openGraph: { title, description, url: `${SITE_URL}/stand`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
  }
}

export default async function StandPage() {
  const options = await seasonOptions()
  const data = await fetchEredivisieData()
  const leader = data.standings[0]
  const runnerUp = data.standings[1]
  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Stand', href: '/stand' }]} sidebarOptions={{ hideStandings: true }}>
      <SeasonSwitch options={options} active={options[0].year} basePath="/stand" />
      <StandTabs active="/stand" />
      <Standings standings={data.standings} season={data.standingsSeason} title="Eredivisie stand" as="h1" />
      {leader && runnerUp && (
        <p className="-mt-4 pb-8 text-sm text-muted">
          <Link href={`/club/${leader.club.slug}`} className="font-semibold text-accent hover:underline">{leader.club.name}</Link> staat
          bovenaan met {leader.points} punten uit {leader.played} wedstrijden, {leader.points - runnerUp.points === 0 ? 'gelijk met' : `${leader.points - runnerUp.points} punt${leader.points - runnerUp.points === 1 ? '' : 'en'} voor`}{' '}
          <Link href={`/club/${runnerUp.club.slug}`} className="font-semibold text-accent hover:underline">{runnerUp.club.name}</Link>.
          Bekijk ook de <Link href="/topscorers" className="font-semibold text-accent hover:underline">topscorers</Link> en het{' '}
          <Link href="/programma" className="font-semibold text-accent hover:underline">programma</Link>.
        </p>
      )}
    </PageShell>
  )
}

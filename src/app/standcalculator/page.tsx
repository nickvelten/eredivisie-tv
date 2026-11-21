import type { Metadata } from 'next'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import { PageShell } from '@/components/PageShell'
import { StandTabs } from '@/components/StandTabs'
import { TableCalculator, CalcClub } from '@/components/TableCalculator'
import { fetchEredivisieData } from '@/lib/espn'
import { SITE_URL } from '@/lib/structured-data'
import { Club } from '@/data/types'

export const revalidate = 300

const title = 'Standcalculator Eredivisie: wat als? | Eredivisie.tv'
const description = 'Voorspel de komende Eredivisie-wedstrijden en zie direct hoe de stand verandert. Wie komt bovenaan, wie zakt naar de degradatieplek?'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/standcalculator` },
  openGraph: { title, description, url: `${SITE_URL}/standcalculator`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
}

const slim = (c: Club): CalcClub => ({ id: c.id, shortName: c.shortName, logo: c.logo })

export default async function StandcalculatorPage() {
  const data = await fetchEredivisieData()
  // The next three rounds: enough to play with, small enough to send to the browser
  const rounds = [...new Set(data.allMatches.filter((m) => m.status === 'scheduled').sort((a, b) => a.date.localeCompare(b.date)).map((m) => m.round ?? 0))].slice(0, 3)
  const matches = data.allMatches
    .filter((m) => m.status === 'scheduled' && rounds.includes(m.round ?? 0))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({ id: m.id, round: m.round, date: m.date, home: slim(m.homeTeam), away: slim(m.awayTeam) }))
  const rows = data.standings.map((s) => ({ club: slim(s.club), position: s.position, played: s.played, points: s.points, goalsFor: s.goalsFor, goalsAgainst: s.goalsAgainst }))

  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Stand', href: '/stand' }, { label: 'Standcalculator', href: '/standcalculator' }]} sidebar={false}>
      <StandTabs active="/standcalculator" />
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Standcalculator</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Wat als? Kies voor de komende wedstrijden een 1 (thuiswinst), X (gelijk) of 2 (uitwinst) en zie direct hoe de stand verandert. Een overwinning telt als 1-0. Je keuzes blijven bewaard in deze browser.
      </p>
      {matches.length === 0 ? (
        <p className="py-10 text-sm text-muted">Er staan nu geen wedstrijden in het programma om te voorspellen.</p>
      ) : (
        <TableCalculator rows={rows} matches={matches} />
      )}
    </PageShell>
  )
}

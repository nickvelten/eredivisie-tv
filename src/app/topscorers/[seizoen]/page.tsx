import type { Metadata } from 'next'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import { notFound, permanentRedirect } from 'next/navigation'
import { PageShell } from '@/components/PageShell'
import { TopScorers } from '@/components/TopScorers'
import { SeasonSwitch } from '@/components/SeasonSwitch'
import { fetchEredivisieData, fetchSeasonArchive, parseSeasonSlug, seasonOptions } from '@/lib/espn'
import { SITE_URL } from '@/lib/structured-data'

type Params = { params: Promise<{ seizoen: string }> }

export const revalidate = 86400

export async function generateStaticParams() {
  return (await seasonOptions()).filter((o) => !o.isCurrent).map((o) => ({ seizoen: o.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { seizoen } = await params
  const year = parseSeasonSlug(seizoen)
  const archive = year ? await fetchSeasonArchive(year) : null
  if (!archive) return { title: 'Seizoen niet gevonden | Eredivisie.tv' }
  const top = archive.topScorers[0]
  const title = `Topscorers Eredivisie ${archive.label} | Eredivisie.tv`
  const description = `De topscorers van de Eredivisie ${archive.label}${top ? `: ${top.name} werd topscorer met ${top.goals} doelpunten` : ''}. Plus de assistkoning van dat seizoen.`
  const url = `${SITE_URL}/topscorers/${seizoen}`
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES } }
}

export default async function TopscorersArchivePage({ params }: Params) {
  const { seizoen } = await params
  const year = parseSeasonSlug(seizoen)
  const options = await seasonOptions()
  if (year && options.find((o) => o.isCurrent)?.year === year) permanentRedirect('/topscorers')
  const [archive, data] = await Promise.all([year ? fetchSeasonArchive(year) : null, fetchEredivisieData()])
  if (!archive) notFound()

  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Topscorers', href: '/topscorers' }, { label: archive.label, href: `/topscorers/${seizoen}` }]}>
      <SeasonSwitch options={options} active={archive.year} basePath="/topscorers" />
      <TopScorers
        topScorers={archive.topScorers}
        topAssisters={archive.topAssisters}
        season={{ label: archive.label, isCurrent: true }}
        title={`Topscorers Eredivisie ${archive.label}`}
        as="h1"
      />
    </PageShell>
  )
}

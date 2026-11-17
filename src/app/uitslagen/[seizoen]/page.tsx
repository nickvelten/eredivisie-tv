import type { Metadata } from 'next'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import { notFound, permanentRedirect } from 'next/navigation'
import { PageShell } from '@/components/PageShell'
import { Results } from '@/components/Results'
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
  const title = `Uitslagen Eredivisie ${archive.label}: alle scores | Eredivisie.tv`
  const description = `Alle uitslagen van de Eredivisie ${archive.label}, per speelronde.`
  const url = `${SITE_URL}/uitslagen/${seizoen}`
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES } }
}

export default async function UitslagenArchivePage({ params }: Params) {
  const { seizoen } = await params
  const year = parseSeasonSlug(seizoen)
  const options = await seasonOptions()
  if (year && options.find((o) => o.isCurrent)?.year === year) permanentRedirect('/uitslagen')
  const [archive, data] = await Promise.all([year ? fetchSeasonArchive(year) : null, fetchEredivisieData()])
  if (!archive) notFound()

  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Uitslagen', href: '/uitslagen' }, { label: archive.label, href: `/uitslagen/${seizoen}` }]}>
      <SeasonSwitch options={options} active={archive.year} basePath="/uitslagen" />
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Uitslagen Eredivisie {archive.label}</h1>
      <Results matchweeks={archive.matchweeks} title="Per speelronde" />
    </PageShell>
  )
}

import type { Metadata } from 'next'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { PageShell } from '@/components/PageShell'
import { Standings } from '@/components/Standings'
import { SeasonSwitch } from '@/components/SeasonSwitch'
import { fetchEredivisieData, fetchSeasonArchive, parseSeasonSlug, seasonOptions } from '@/lib/espn'
import { SITE_URL } from '@/lib/structured-data'

type Params = { params: Promise<{ seizoen: string }> }

// A finished season no longer changes
export const revalidate = 86400

export async function generateStaticParams() {
  return (await seasonOptions()).filter((o) => !o.isCurrent).map((o) => ({ seizoen: o.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { seizoen } = await params
  const year = parseSeasonSlug(seizoen)
  const archive = year ? await fetchSeasonArchive(year) : null
  if (!archive) return { title: 'Seizoen niet gevonden | Eredivisie.tv' }
  const champion = archive.standings[0]
  const title = `Eindstand Eredivisie ${archive.label} | Eredivisie.tv`
  const description = `De eindstand van de Eredivisie ${archive.label}${champion ? `: ${champion.club.name} werd kampioen met ${champion.points} punten` : ''}. Punten, doelsaldo en vorm van alle clubs.`
  const url = `${SITE_URL}/stand/${seizoen}`
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES } }
}

export default async function StandArchivePage({ params }: Params) {
  const { seizoen } = await params
  const year = parseSeasonSlug(seizoen)
  const options = await seasonOptions()
  if (year && options.find((o) => o.isCurrent)?.year === year) permanentRedirect('/stand')
  const [archive, data] = await Promise.all([year ? fetchSeasonArchive(year) : null, fetchEredivisieData()])
  if (!archive) notFound()
  const champion = archive.standings[0]

  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Stand', href: '/stand' }, { label: archive.label, href: `/stand/${seizoen}` }]}>
      <SeasonSwitch options={options} active={archive.year} basePath="/stand" />
      <Standings
        standings={archive.standings}
        season={{ label: archive.label, isCurrent: true }}
        title={`Eindstand Eredivisie ${archive.label}`}
        as="h1"
      />
      {champion && (
        <p className="-mt-4 pb-8 text-sm text-muted">
          <Link href={`/club/${champion.club.slug}`} className="font-semibold text-accent hover:underline">{champion.club.name}</Link> werd
          kampioen met {champion.points} punten. Bekijk ook de{' '}
          <Link href={`/topscorers/${seizoen}`} className="font-semibold text-accent hover:underline">topscorers</Link> en{' '}
          <Link href={`/uitslagen/${seizoen}`} className="font-semibold text-accent hover:underline">uitslagen</Link> van {archive.label}.
        </p>
      )}
    </PageShell>
  )
}

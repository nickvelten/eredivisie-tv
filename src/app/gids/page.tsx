import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { fetchEredivisieData } from '@/lib/espn'
import { GUIDES } from '@/data/guides'
import { CHANNELS } from '@/lib/channels'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import { SITE_URL } from '@/lib/structured-data'

export const revalidate = 3600

const title = 'Eredivisie kijken: gidsen over ESPN, providers en zenders | Eredivisie.tv'
const description = 'Hoe en waar kijk je de Eredivisie? Gidsen over ESPN-abonnementen, kijken zonder Ziggo, kijken in het buitenland en de ESPN-zenders.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/gids` },
  openGraph: { title, description, url: `${SITE_URL}/gids`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
}

export default async function GidsIndex() {
  const data = await fetchEredivisieData()
  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Gidsen', href: '/gids' }]}>
      <h1 className="pt-4 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie kijken</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">Alles over waar en hoe je de Eredivisie ziet.</p>
      <div className="grid gap-4 py-8 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/gids/${g.slug}`} className="rounded-xl bg-card p-5 shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:ring-accent/20">
            <h2 className="text-base font-bold text-foreground">{g.h1}</h2>
            <p className="mt-1 text-sm text-muted">{g.intro}</p>
          </Link>
        ))}
      </div>
      <h2 className="text-xl font-extrabold text-foreground">Zenders</h2>
      <div className="flex flex-wrap gap-2 py-4 pb-8">
        {CHANNELS.map((c) => (
          <Link key={c.slug} href={`/zender/${c.slug}`} className="rounded-full bg-card px-3 py-1.5 text-sm font-semibold text-foreground ring-1 ring-border hover:ring-accent/40">
            Eredivisie op {c.name}
          </Link>
        ))}
      </div>
    </PageShell>
  )
}

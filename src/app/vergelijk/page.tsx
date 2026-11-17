import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { ComparePicker } from '@/components/ComparePicker'
import { fetchEredivisieData } from '@/lib/espn'
import { fetchAllPlayers } from '@/lib/players'
import { SITE_URL } from '@/lib/structured-data'
import { OG_DEFAULT_IMAGES } from '@/lib/og'

export const revalidate = 3600

const title = 'Spelers vergelijken: Eredivisie-statistieken naast elkaar | Eredivisie.tv'
const description = 'Vergelijk twee Eredivisie-spelers: doelpunten, assists, schoten, kaarten en wedstrijden van dit seizoen naast elkaar.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/vergelijk` },
  openGraph: { title, description, url: `${SITE_URL}/vergelijk`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
}

export default async function VergelijkPage() {
  const [data, players] = await Promise.all([fetchEredivisieData(), fetchAllPlayers()])
  // Suggested comparisons: the top scorers against each other
  const top = [...players].sort((a, b) => b.stats.goals - a.stats.goals).slice(0, 6)
  const pairs: Array<[typeof top[number], typeof top[number]]> = []
  for (let i = 0; i < top.length; i += 2) if (top[i + 1]) pairs.push([top[i], top[i + 1]])
  for (let i = 0; i + 2 < top.length; i += 2) pairs.push([top[i], top[i + 2]])

  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Vergelijken', href: '/vergelijk' }]}>
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Spelers vergelijken</h1>
      <p className="mb-5 mt-2 max-w-2xl text-sm text-muted">Kies twee spelers en zie hun statistieken van dit seizoen naast elkaar.</p>
      <ComparePicker />
      {pairs.length > 0 && (
        <section className="py-8">
          <h2 className="mb-3 text-lg font-extrabold text-foreground">Populaire vergelijkingen</h2>
          <ul className="flex flex-wrap gap-2">
            {pairs.map(([a, b]) => (
              <li key={`${a.id}-${b.id}`}>
                <Link
                  href={`/vergelijk/${[a.slug, b.slug].sort().join('-vs-')}`}
                  className="inline-block rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-border hover:text-accent"
                >
                  {a.name} vs {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  )
}

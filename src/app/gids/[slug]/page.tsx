import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageShell } from '@/components/PageShell'
import { Providers } from '@/components/Providers'
import { Faq } from '@/components/Faq'
import { fetchEredivisieData } from '@/lib/espn'
import { findGuide, GUIDES } from '@/data/guides'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import { SITE_URL } from '@/lib/structured-data'

export const revalidate = 3600
export const dynamicParams = false

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = findGuide((await params).slug)
  if (!guide) return {}
  const url = `${SITE_URL}/gids/${guide.slug}`
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: { title: guide.title, description: guide.description, url, type: 'article', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = findGuide((await params).slug)
  if (!guide) notFound()
  const data = await fetchEredivisieData()
  const others = GUIDES.filter((g) => g.slug !== guide.slug)
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.h1,
    description: guide.description,
    inLanguage: 'nl-NL',
    url: `${SITE_URL}/gids/${guide.slug}`,
    publisher: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Eredivisie.tv', url: SITE_URL },
  }

  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Gidsen', href: '/gids' }, { label: guide.h1, href: `/gids/${guide.slug}` }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <article className="max-w-2xl pt-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{guide.h1}</h1>
        <p className="mt-3 text-base text-muted">{guide.intro}</p>
        {guide.sections.map((s) => (
          <section key={s.heading} className="pt-6">
            <h2 className="text-xl font-extrabold text-foreground">{s.heading}</h2>
            {s.paragraphs.map((p) => (
              <p key={p} className="mt-2 text-sm leading-relaxed text-foreground/90">{p}</p>
            ))}
          </section>
        ))}
      </article>
      {guide.providerTable && <Providers />}
      <Faq title="Veelgestelde vragen" items={guide.faq} />
      <section className="pb-8">
        <h2 className="mb-3 text-lg font-extrabold text-foreground">Meer gidsen</h2>
        <ul className="space-y-1 text-sm">
          {others.map((g) => (
            <li key={g.slug}>
              <Link href={`/gids/${g.slug}`} className="font-semibold text-accent hover:underline">{g.h1}</Link>
            </li>
          ))}
          <li>
            <Link href="/eredivisie-op-tv-vandaag" className="font-semibold text-accent hover:underline">Eredivisie op TV vandaag</Link>
          </li>
        </ul>
      </section>
    </PageShell>
  )
}

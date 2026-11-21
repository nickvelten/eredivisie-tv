import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'
import { FOR_SALE_MAILTO } from '@/components/SiteNotices'
import { fetchEredivisieData } from '@/lib/espn'
import { SITE_URL } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Eredivisie.tv is te koop | Eredivisie.tv',
  description: 'De domeinnaam eredivisie.tv met een werkende site: live data, club- en wedstrijdpagina\'s, agenda-feeds en een goede SEO-basis.',
  alternates: { canonical: `${SITE_URL}/te-koop` },
  robots: { index: false, follow: true },
}

const POINTS = [
  'Sterke, korte domeinnaam die precies zegt wat de site doet',
  'Live wedstrijddata, uitslagen, stand, topscorers en spelers',
  'Pagina\'s per club, wedstrijd, duel, speelronde, stadion en seizoen',
  'Agenda-abonnementen per club en een insluitbare widget',
  'Technische SEO op orde: structured data, sitemaps, snelle statische pagina\'s',
]

export default async function TeKoopPage() {
  const data = await fetchEredivisieData()
  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Te koop', href: '/te-koop' }]}>
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie.tv is te koop</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
        eredivisie.tv is een sterke domeinnaam met een werkende, goed geïndexeerde site erop. Interesse in overname?
        Stuur een bericht, dan vertel ik je graag meer over bezoekers en mogelijkheden.
      </p>
      <ul className="mt-6 grid max-w-2xl gap-2">
        {POINTS.map((p) => (
          <li key={p} className="flex gap-3 rounded-xl bg-card px-4 py-3 text-sm text-foreground shadow-sm ring-1 ring-border">
            <span className="font-bold text-accent" aria-hidden="true">✓</span>
            {p}
          </li>
        ))}
      </ul>
      <a
        href={FOR_SALE_MAILTO}
        className="mt-6 mb-10 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-accent/90 hover:shadow-md"
      >
        Ik heb interesse →
      </a>
    </PageShell>
  )
}

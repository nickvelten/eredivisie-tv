import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'
import { fetchEredivisieData } from '@/lib/espn'
import { SITE_URL } from '@/lib/structured-data'
import { OG_DEFAULT_IMAGES } from '@/lib/og'

export const revalidate = 3600

const title = 'Gratis Eredivisie-widget voor je website | Eredivisie.tv'
const description = 'Zet gratis een widget met de Eredivisie-wedstrijden van vandaag, de aftraptijden en de ESPN-zender op je eigen website of blog.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/widget-insluiten` },
  openGraph: { title, description, url: `${SITE_URL}/widget-insluiten`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
}

const SNIPPET = `<iframe src="${SITE_URL}/widget/vandaag" title="Eredivisie op TV vandaag" width="320" height="300" style="border:0;border-radius:12px" loading="lazy"></iframe>`

export default async function WidgetInsluitenPage() {
  const data = await fetchEredivisieData()
  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Widget', href: '/widget-insluiten' }]}>
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie-widget voor je website</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Laat je bezoekers zien welke Eredivisie-wedstrijden vandaag op TV zijn. De widget ververst zichzelf en is gratis te gebruiken. Plak
        deze code in je website:
      </p>
      <pre className="mt-4 overflow-x-auto rounded-xl bg-foreground/5 p-4 text-xs text-foreground ring-1 ring-border">
        <code>{SNIPPET}</code>
      </pre>
      <h2 className="mb-3 mt-8 text-lg font-extrabold text-foreground">Voorbeeld</h2>
      <iframe src="/widget/vandaag" title="Eredivisie op TV vandaag" width={320} height={300} className="rounded-xl ring-1 ring-border" loading="lazy" />
      <div className="pb-10" />
    </PageShell>
  )
}

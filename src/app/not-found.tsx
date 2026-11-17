import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { fetchEredivisieData } from '@/lib/espn'

export const metadata: Metadata = {
  title: 'Pagina niet gevonden | Eredivisie.tv',
  robots: { index: false, follow: true },
}

export default async function NotFound() {
  const data = await fetchEredivisieData()
  return (
    <PageShell data={data}>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-foreground">Buitenspel</h1>
        <p className="mt-2 max-w-md text-sm text-muted">Deze pagina bestaat niet of de wedstrijd staat niet meer in het programma.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-accent/90 hover:shadow-md">
            Naar het overzicht
          </Link>
          <Link href="/zoeken" className="rounded-full bg-card px-5 py-2 text-sm font-bold text-foreground shadow-sm ring-1 ring-border hover:text-accent">
            Zoeken
          </Link>
        </div>
      </div>
    </PageShell>
  )
}

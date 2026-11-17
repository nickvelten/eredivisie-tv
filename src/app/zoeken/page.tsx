import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { fetchEredivisieData } from '@/lib/espn'
import { buildSearchIndex, searchItems } from '@/lib/search'

type Props = { searchParams: Promise<{ q?: string }> }

export const metadata: Metadata = {
  title: 'Zoeken | Eredivisie.tv',
  alternates: { canonical: 'https://eredivisie.tv/zoeken' },
  robots: { index: false, follow: true },
}

export default async function ZoekPage({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const [data, index] = await Promise.all([fetchEredivisieData(), buildSearchIndex()])
  const results = q.trim() ? searchItems(index, q, 40) : []

  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Zoeken', href: '/zoeken' }]}>
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Zoeken</h1>
      <form action="/zoeken" className="mt-4 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Zoek een club, speler of wedstrijd"
          aria-label="Zoekterm"
          className="h-11 min-w-0 flex-1 rounded-lg bg-card px-4 text-sm text-foreground ring-1 ring-border outline-none focus:ring-2 focus:ring-accent"
        />
        <button type="submit" className="rounded-lg bg-accent px-5 text-sm font-bold text-white hover:bg-accent/90">Zoek</button>
      </form>
      {q.trim() && (
        <p className="mt-6 text-sm text-muted">
          {results.length === 0 ? `Niets gevonden voor "${q}".` : `${results.length} resultaat${results.length === 1 ? '' : 'en'} voor "${q}"`}
        </p>
      )}
      <ul className="grid gap-2 py-6 sm:grid-cols-2">
        {results.map((r) => (
          <li key={r.href}>
            <Link href={r.href} className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm ring-1 ring-border hover:ring-accent/30">
              {r.image && <Image src={r.image} alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" />}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-foreground">{r.title}</span>
                <span className="block truncate text-xs text-muted">{r.subtitle}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  )
}

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { fetchEredivisieData } from '@/lib/espn'

export const metadata: Metadata = {
  title: 'Pagina niet gevonden | Eredivisie.tv',
}

export default async function NotFound() {
  const data = await fetchEredivisieData()
  return (
    <PageShell data={data}>
      <div className="flex flex-col items-center justify-center pb-10 pt-16 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-foreground">Buitenspel</h1>
        <p className="mt-2 max-w-md text-sm text-muted">Deze pagina bestaat niet of de wedstrijd staat niet meer in het programma. Zoek een club, speler of wedstrijd:</p>
        <form action="/zoeken" className="mt-5 flex w-full max-w-md gap-2">
          <input
            type="search"
            name="q"
            placeholder="Bijvoorbeeld Ajax of Feyenoord"
            aria-label="Zoekterm"
            className="h-11 min-w-0 flex-1 rounded-lg bg-card px-4 text-sm text-foreground ring-1 ring-border outline-none focus:ring-2 focus:ring-accent"
          />
          <button type="submit" className="rounded-lg bg-accent px-5 text-sm font-bold text-white hover:bg-accent/90">Zoek</button>
        </form>
        <Link href="/" className="mt-4 text-sm font-semibold text-accent hover:underline">
          Of ga naar het overzicht →
        </Link>
      </div>
      {data.clubs.length > 0 && (
        <nav aria-label="Clubs" className="pb-12">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-muted">Naar een clubpagina</p>
          <ul className="flex flex-wrap justify-center gap-2">
            {data.clubs.map((club) => (
              <li key={club.id}>
                <Link href={`/club/${club.slug}`} className="inline-flex items-center gap-2 rounded-full bg-card py-1.5 pl-2 pr-3 text-sm font-semibold text-foreground shadow-sm ring-1 ring-border hover:text-accent">
                  <Image src={club.logo} alt="" width={20} height={20} className="h-5 w-5" />
                  {club.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </PageShell>
  )
}

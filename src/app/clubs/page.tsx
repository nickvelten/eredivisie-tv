import type { Metadata } from 'next'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import Image from 'next/image'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { fetchEredivisieData } from '@/lib/espn'
import { SITE_URL } from '@/lib/structured-data'
import { formatShortDate, formatTime } from '@/lib/utils'

export const revalidate = 300

const title = 'Alle Eredivisie-clubs: programma en zender per club | Eredivisie.tv'
const description = 'De 18 clubs van de Eredivisie. Kies je club en zie wanneer en op welke ESPN-zender de volgende wedstrijd is, plus selectie en uitslagen.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/clubs` },
  openGraph: { title, description, url: `${SITE_URL}/clubs`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
}

export default async function ClubsPage() {
  const data = await fetchEredivisieData()
  const upcoming = data.allMatches
    .filter((m) => m.status !== 'finished')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Clubs', href: '/clubs' }]}>
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie-clubs</h1>
      <p className="mt-2 text-sm text-muted">Alle 18 clubs met hun eerstvolgende wedstrijd en zender.</p>
      <ul className="grid gap-3 py-8 sm:grid-cols-2 xl:grid-cols-3">
        {data.clubs.map((club) => {
          const next = upcoming.find((m) => m.homeTeam.id === club.id || m.awayTeam.id === club.id)
          const standing = data.standings.find((s) => s.club.id === club.id)
          const opp = next ? (next.homeTeam.id === club.id ? next.awayTeam : next.homeTeam) : null
          return (
            <li key={club.id}>
              <Link href={`/club/${club.slug}`} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:ring-accent/30">
                <Image src={club.logo} alt={`Logo ${club.name}`} width={48} height={48} className="h-12 w-12 shrink-0 object-contain" />
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold text-foreground">{club.name}</span>
                  {standing && <span className="block text-xs text-muted">{standing.position}e · {standing.points} punten</span>}
                  {next && opp && (
                    <span className="mt-1 block truncate text-xs text-muted">
                      {formatShortDate(next.date)} {formatTime(next.date)} vs {opp.shortName} · {next.broadcasts.find((b) => b.type === 'tv')?.name}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </PageShell>
  )
}

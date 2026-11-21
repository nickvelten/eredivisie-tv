import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageShell } from '@/components/PageShell'
import { MatchCard, MatchGrid } from '@/components/MatchCard'
import { fetchEredivisieData, fetchStadiums } from '@/lib/espn'
import { SITE_URL } from '@/lib/structured-data'
import { OG_DEFAULT_IMAGES } from '@/lib/og'

type Params = { params: Promise<{ slug: string }> }

export const revalidate = 3600

export async function generateStaticParams() {
  return (await fetchStadiums()).map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const stadium = (await fetchStadiums()).find((s) => s.slug === slug)
  if (!stadium) return { title: 'Stadion niet gevonden | Eredivisie.tv' }
  const club = stadium.clubs[0]
  const title = `${stadium.name}${stadium.city ? ` (${stadium.city})` : ''}: wedstrijden en programma | Eredivisie.tv`
  const description = `${stadium.name} is het stadion van ${club?.name ?? 'een Eredivisie-club'}. Bekijk welke Eredivisie-wedstrijden er gespeeld worden, de aftraptijden en op welke zender ze te zien zijn.`
  const url = `${SITE_URL}/stadion/${slug}`
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES } }
}

export default async function StadionPage({ params }: Params) {
  const { slug } = await params
  const [stadiums, data] = await Promise.all([fetchStadiums(), fetchEredivisieData()])
  const stadium = stadiums.find((s) => s.slug === slug)
  if (!stadium) notFound()
  const club = stadium.clubs[0]
  const upcoming = stadium.matches.filter((m) => m.status !== 'finished').sort((a, b) => a.date.localeCompare(b.date))
  const played = stadium.matches.filter((m) => m.status === 'finished').sort((a, b) => b.date.localeCompare(a.date))
  const homeWins = played.filter((m) => m.homeTeam.id === club?.id && m.score && m.score.home > m.score.away).length
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'StadiumOrArena',
    name: stadium.name,
    url: `${SITE_URL}/stadion/${slug}`,
    address: stadium.city ? { '@type': 'PostalAddress', addressLocality: stadium.city, addressCountry: 'NL' } : undefined,
  }

  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Clubs', href: '/clubs' }, { label: stadium.name, href: `/stadion/${slug}` }]} sidebarOptions={{ highlightClubIds: club ? [club.id] : [] }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex items-center gap-4 pt-6">
        {club && <Image src={club.logo} alt={`Logo ${club.name}`} width={56} height={56} loading="eager" className="h-14 w-14 shrink-0" />}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{stadium.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {stadium.city && <>{stadium.city} · </>}
            Thuishaven van {club ? <Link href={`/club/${club.slug}`} className="font-semibold text-accent hover:underline">{club.name}</Link> : 'een Eredivisie-club'}
          </p>
        </div>
      </div>
      {played.length > 0 && club && (
        <p className="mt-4 text-sm text-foreground">
          {club.name} speelde dit seizoen {played.filter((m) => m.homeTeam.id === club.id).length} thuiswedstrijden in {stadium.name} en won er {homeWins}.
        </p>
      )}
      {upcoming.length > 0 && (
        <section className="w-full py-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Komende wedstrijden</h2>
          <MatchGrid>
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} showDate />
            ))}
          </MatchGrid>
        </section>
      )}
      {played.length > 0 && (
        <section className="w-full py-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Gespeeld dit seizoen</h2>
          <MatchGrid>
            {played.map((m) => (
              <MatchCard key={m.id} match={m} showDate />
            ))}
          </MatchGrid>
        </section>
      )}
    </PageShell>
  )
}

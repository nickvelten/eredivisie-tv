import type { Metadata } from 'next'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { findDuel } from '@/lib/espn'
import { PageShell } from '@/components/PageShell'
import { MatchCard, MatchGrid } from '@/components/MatchCard'
import { Faq } from '@/components/Faq'
import { FaqItem, SITE_URL } from '@/lib/structured-data'
import { formatDutchDate, formatTime } from '@/lib/utils'

type Params = { params: Promise<{ slug: string }> }

export const revalidate = 3600

// Rendered on first visit, then cached (ISR); hundreds of pages, so not at build time
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const result = await findDuel(slug)
  if (!result) return { title: 'Duel niet gevonden | Eredivisie.tv' }
  const [a, b] = result.clubs
  // Without a meeting in the published window the page is thin: keep it out of the index
  const hasMeetings = result.data.allMatches.some(
    (m) => (m.homeTeam.id === a.id && m.awayTeam.id === b.id) || (m.homeTeam.id === b.id && m.awayTeam.id === a.id)
  )
  const title = `${a.name} – ${b.name} op TV: datum, zender en uitslagen | Eredivisie.tv`
  const description = `Wanneer spelen ${a.name} en ${b.name} tegen elkaar en op welke zender? De onderlinge wedstrijden van dit seizoen, de stand en de vorm van beide clubs.`
  const url = `${SITE_URL}/duel/${slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: hasMeetings ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
  }
}

export default async function DuelPage({ params }: Params) {
  const { slug } = await params
  const result = await findDuel(slug)
  if (!result) notFound()
  const { clubs: [a, b], data } = result

  const meetings = data.allMatches
    .filter((m) => (m.homeTeam.id === a.id && m.awayTeam.id === b.id) || (m.homeTeam.id === b.id && m.awayTeam.id === a.id))
    .sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime())
  const next = meetings.find((m) => m.status !== 'finished')
  const played = meetings.filter((m) => m.status === 'finished')
  const sa = data.standings.find((s) => s.club.id === a.id)
  const sb = data.standings.find((s) => s.club.id === b.id)
  const tv = next?.broadcasts.find((x) => x.type === 'tv')?.name ?? 'ESPN'

  const faq: FaqItem[] = [
    {
      question: `Wanneer speelt ${a.name} tegen ${b.name}?`,
      answer: next
        ? `${next.homeTeam.name} – ${next.awayTeam.name} wordt gespeeld op ${formatDutchDate(next.date)} om ${formatTime(next.date)}${next.venue ? ` in ${next.venue}` : ''}.`
        : played.length > 0
          ? `${a.name} en ${b.name} hebben elkaar dit seizoen al getroffen; de volgende ontmoeting staat nog niet in het gepubliceerde programma.`
          : `De ontmoeting tussen ${a.name} en ${b.name} staat nog niet in het gepubliceerde programma van ESPN.`,
    },
    {
      question: `Op welke zender is ${a.name} – ${b.name} te zien?`,
      answer: next
        ? `${next.homeTeam.name} – ${next.awayTeam.name} is live te zien op ${tv} en online via ESPN.nl.`
        : `Alle Eredivisie-wedstrijden, dus ook ${a.name} – ${b.name}, zijn live te zien op ESPN en via ESPN.nl.`,
    },
  ]
  if (played.length > 0) {
    faq.push({
      question: `Wat was de laatste uitslag van ${a.name} – ${b.name}?`,
      answer: (() => {
        const last = played[played.length - 1]
        return `${last.homeTeam.name} – ${last.awayTeam.name} eindigde op ${formatDutchDate(last.date)} in ${last.score?.home}-${last.score?.away}.`
      })(),
    })
  }

  return (
    <PageShell
      data={data}
      breadcrumbs={[{ label: 'Clubs', href: '/clubs' }, { label: `${a.shortName} – ${b.shortName}`, href: `/duel/${slug}` }]}
      sidebarOptions={{ highlightClubIds: [a.id, b.id] }}
    >
      <section className="w-full pt-4">
        <div className="flex items-center justify-center gap-4 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border sm:gap-8">
          <Link href={`/club/${a.slug}`} className="flex flex-col items-center gap-2 text-center hover:text-accent">
            <Image src={a.logo} alt={`Logo ${a.name}`} width={72} height={72} loading="eager" className="h-16 w-16 sm:h-20 sm:w-20" />
            {sa && <span className="text-xs text-muted">{sa.position}e · {sa.points} pt</span>}
          </Link>
          <h1 className="text-center text-xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {a.name} – {b.name}
          </h1>
          <Link href={`/club/${b.slug}`} className="flex flex-col items-center gap-2 text-center hover:text-accent">
            <Image src={b.logo} alt={`Logo ${b.name}`} width={72} height={72} loading="eager" className="h-16 w-16 sm:h-20 sm:w-20" />
            {sb && <span className="text-xs text-muted">{sb.position}e · {sb.points} pt</span>}
          </Link>
        </div>
      </section>

      {next && (
        <section className="w-full py-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Volgende ontmoeting</h2>
          <MatchGrid>
            <MatchCard match={next} featured showDate />
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

      {!next && played.length === 0 && (
        <p className="py-8 text-sm text-muted">
          {a.name} en {b.name} staan nog niet tegenover elkaar in het gepubliceerde programma. ESPN maakt de speeldata enkele weken vooraf bekend.
        </p>
      )}

      <Faq title={`${a.shortName} – ${b.shortName}: veelgestelde vragen`} items={faq} />
    </PageShell>
  )
}

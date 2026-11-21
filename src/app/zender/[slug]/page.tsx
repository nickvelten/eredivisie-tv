import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageShell } from '@/components/PageShell'
import { MatchCard, MatchGrid } from '@/components/MatchCard'
import { Faq } from '@/components/Faq'
import { fetchEredivisieData } from '@/lib/espn'
import { CHANNELS, findChannel } from '@/lib/channels'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import { SITE_URL } from '@/lib/structured-data'
import { formatDutchDate, formatTime, groupMatchesByDate } from '@/lib/utils'

export const revalidate = 300
export const dynamicParams = false

export function generateStaticParams() {
  return CHANNELS.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const channel = findChannel((await params).slug)
  if (!channel) return {}
  const title = `Eredivisie op ${channel.name}: welke wedstrijden zijn er te zien? | Eredivisie.tv`
  const description = `Welke Eredivisie-wedstrijden zijn op ${channel.name}? De komende wedstrijden met aftraptijd, plus waar je ${channel.name} kunt kijken.`
  const url = `${SITE_URL}/zender/${channel.slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
  }
}

export default async function ZenderPage({ params }: { params: Promise<{ slug: string }> }) {
  const channel = findChannel((await params).slug)
  if (!channel) notFound()
  const data = await fetchEredivisieData()
  const upcoming = data.allMatches
    .filter((m) => m.status !== 'finished' && m.broadcasts.some((b) => b.type === 'tv' && b.name === channel.name))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 12)
  const days = [...groupMatchesByDate(upcoming)]
  const next = upcoming[0]

  return (
    <PageShell data={data} breadcrumbs={[{ label: channel.name, href: `/zender/${channel.slug}` }]}>
      <nav aria-label="Zenders" className="flex flex-wrap gap-2 pt-4">
        {CHANNELS.map((c) => (
          <Link
            key={c.slug}
            href={`/zender/${c.slug}`}
            aria-current={c.slug === channel.slug ? 'page' : undefined}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ${c.slug === channel.slug ? 'bg-accent text-white ring-accent' : 'bg-card text-foreground ring-border hover:ring-accent/40'}`}
          >
            {c.name}
          </Link>
        ))}
      </nav>
      <h1 className="pt-4 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie op {channel.name}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        {channel.name} is {channel.blurb}.{' '}
        {next
          ? `Eerstvolgende wedstrijd: ${next.homeTeam.name} – ${next.awayTeam.name}, ${formatDutchDate(next.date)} om ${formatTime(next.date)}.`
          : 'Er staan nu geen Eredivisie-wedstrijden op dit kanaal gepland.'}
      </p>
      <p className="mt-2 max-w-2xl text-xs text-muted">
        De zender per wedstrijd is onze verwachting op basis van de stand en het tijdslot. ESPN maakt de definitieve indeling kort voor de speelronde bekend.
        Alle wedstrijden zijn ook te zien in de ESPN Watch-app.
      </p>
      {days.map(([day, list]) => (
        <section key={day} className="w-full py-6">
          <h2 className="mb-4 text-xl font-extrabold text-foreground">{formatDutchDate(list[0].date)}</h2>
          <MatchGrid>
            {list.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </MatchGrid>
        </section>
      ))}
      <Faq
        title="Veelgestelde vragen"
        items={[
          {
            question: `Waar kan ik ${channel.name} kijken?`,
            answer: `${channel.name} zit bij Ziggo in elk digitaal tv-pakket. Bij KPN, Odido en Canal Digitaal neem je ESPN Compleet af. Online kijk je via de ESPN Watch-app of de app van je provider.`,
          },
          {
            question: `Welke Eredivisie-wedstrijd is als eerste op ${channel.name}?`,
            answer: next
              ? `${next.homeTeam.name} – ${next.awayTeam.name} op ${formatDutchDate(next.date)} om ${formatTime(next.date)}.`
              : `Er staat op dit moment geen Eredivisie-wedstrijd op ${channel.name} gepland.`,
          },
        ]}
      />
      <p className="pb-8 text-sm text-muted">
        Bekijk ook <Link href="/eredivisie-op-tv-vandaag" className="font-semibold text-accent hover:underline">Eredivisie op TV vandaag</Link> en{' '}
        <Link href="/gids/espn-abonnement-vergelijken" className="font-semibold text-accent hover:underline">ESPN-abonnementen vergeleken</Link>.
      </p>
    </PageShell>
  )
}

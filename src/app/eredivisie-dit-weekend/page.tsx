import type { Metadata } from 'next'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { MatchCard, MatchGrid } from '@/components/MatchCard'
import { Faq } from '@/components/Faq'
import { DayTabs } from '@/components/DayTabs'
import { fetchEredivisieData } from '@/lib/espn'
import { matchStructuredData, SITE_URL } from '@/lib/structured-data'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import { amsterdamDate, amsterdamDayFromToday, formatDutchDate, formatTime } from '@/lib/utils'

export const revalidate = 300

const title = 'Eredivisie dit weekend: alle wedstrijden, tijden en zenders | Eredivisie.tv'
const description = 'Welke Eredivisie-wedstrijden zijn er dit weekend? Van vrijdag tot en met zondag alle aftraptijden en de ESPN-zender per wedstrijd.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/eredivisie-dit-weekend` },
  openGraph: { title, description, url: `${SITE_URL}/eredivisie-dit-weekend`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
}

/** Amsterdam dates of this weekend (Fri to Sun), or the next one from Monday on. */
function weekendDays(): string[] {
  const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short' }).format(new Date())
  const index = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(weekday)
  const toFriday = index <= 4 ? 4 - index : -(index - 4)
  return [0, 1, 2].map((i) => amsterdamDayFromToday(toFriday + i))
}

export default async function DitWeekendPage() {
  const data = await fetchEredivisieData()
  const days = weekendDays()
  const weekend = data.allMatches.filter((m) => days.includes(amsterdamDate(m.date))).sort((a, b) => a.date.localeCompare(b.date))
  const perDay = days.map((d) => ({ day: d, list: weekend.filter((m) => amsterdamDate(m.date) === d) })).filter((d) => d.list.length > 0)
  const rounds = [...new Set(weekend.map((m) => m.round).filter(Boolean))]
  const next = data.allMatches.filter((m) => m.status === 'scheduled').sort((a, b) => a.date.localeCompare(b.date))[0]

  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Dit weekend', href: '/eredivisie-dit-weekend' }]}>
      <DayTabs active="/eredivisie-dit-weekend" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(weekend.flatMap(matchStructuredData)) }} />
      <h1 className="pt-4 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie dit weekend</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        {weekend.length > 0
          ? `Dit weekend ${weekend.length === 1 ? 'staat 1 wedstrijd' : `staan ${weekend.length} wedstrijden`} op het programma${rounds.length === 1 ? `, speelronde ${rounds[0]}` : ''}. Alles is live op ESPN.`
          : next
            ? `Dit weekend geen Eredivisie. De eerstvolgende wedstrijd is ${next.homeTeam.name} – ${next.awayTeam.name}, ${formatDutchDate(next.date)} om ${formatTime(next.date)}.`
            : 'Dit weekend geen Eredivisie.'}{' '}
        {rounds.length === 1 && (
          <Link href={`/speelronde/${rounds[0]}`} className="font-semibold text-accent hover:underline">Hele speelronde bekijken</Link>
        )}
      </p>
      {perDay.map(({ day, list }) => (
        <section key={day} className="w-full py-6">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">{formatDutchDate(list[0].date)}</h2>
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
            question: 'Welke Eredivisie-wedstrijden zijn er dit weekend?',
            answer:
              weekend.length > 0
                ? weekend.map((m) => `${m.homeTeam.name} – ${m.awayTeam.name} (${formatDutchDate(m.date)}, ${formatTime(m.date)})`).join('; ') + '.'
                : 'Dit weekend wordt er geen Eredivisie gespeeld.',
          },
          {
            question: 'Op welke zender is de Eredivisie dit weekend?',
            answer: 'Alle Eredivisie-wedstrijden zijn live op ESPN 1 tot en met 4 en in de ESPN Watch-app. Per wedstrijd zie je hierboven het verwachte kanaal.',
          },
        ]}
      />
    </PageShell>
  )
}

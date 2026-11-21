import type { Metadata } from 'next'
import Link from 'next/link'
import { EnShell } from '@/components/en/EnShell'
import { EnMatchList } from '@/components/en/EnMatchList'
import { EnTable } from '@/components/en/EnTable'
import { fetchEredivisieData } from '@/lib/espn'
import { enMetadata, formatEnglishDate } from '@/lib/i18n'
import { amsterdamDate, amsterdamDayFromToday } from '@/lib/utils'

export const revalidate = 300

export const metadata: Metadata = enMetadata({
  title: 'Eredivisie on TV today: fixtures, kickoff times and channels | Eredivisie.tv',
  description: 'Which Eredivisie matches are on today? Kickoff times in Amsterdam and your own time zone, the ESPN channel, live scores, the table and top scorers.',
  enPath: '/en',
  nlPath: '/',
})

export default async function EnHome() {
  const data = await fetchEredivisieData()
  const today = amsterdamDayFromToday(0)
  const todays = data.allMatches.filter((m) => amsterdamDate(m.date) === today)
  const upcoming = data.allMatches.filter((m) => m.status === 'scheduled').sort((a, b) => a.date.localeCompare(b.date))
  const nextDay = upcoming[0] ? amsterdamDate(upcoming[0].date) : null
  const next = todays.length > 0 ? todays : upcoming.filter((m) => amsterdamDate(m.date) === nextDay)
  const recent = data.allMatches
    .filter((m) => m.status === 'finished')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)

  return (
    <EnShell nlHref="/" active="/en">
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie on TV today</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Every Eredivisie match is broadcast live by ESPN in the Netherlands. Times are shown in Amsterdam time, with your own time next to it when it differs.
      </p>
      <section className="pt-8">
        <h2 className="mb-4 text-2xl font-extrabold text-foreground">
          {todays.length > 0 ? 'Today' : next[0] ? `Next up · ${formatEnglishDate(next[0].date)}` : 'No upcoming matches'}
        </h2>
        <EnMatchList matches={next} />
        <p className="mt-3 text-sm">
          <Link href="/en/fixtures" className="font-semibold text-accent hover:underline">All fixtures →</Link>
        </p>
      </section>
      {data.standings.length > 0 && (
        <section className="pt-10">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Top of the table</h2>
          <EnTable standings={data.standings} rows={data.standings.slice(0, 6)} />
          <p className="mt-3 text-sm">
            <Link href="/en/table" className="font-semibold text-accent hover:underline">Full table →</Link>
          </p>
        </section>
      )}
      {recent.length > 0 && (
        <section className="pt-10">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Latest results</h2>
          <EnMatchList matches={recent} />
        </section>
      )}
      <section className="pt-10">
        <h2 className="mb-2 text-xl font-extrabold text-foreground">How to watch the Eredivisie</h2>
        <p className="max-w-2xl text-sm text-muted">
          In the Netherlands, ESPN shows every match on ESPN 1 to 4, available through TV providers such as Ziggo, KPN, Odido and Canal Digitaal, and online in the ESPN Watch app.
          Abroad, broadcasters differ per country. Within the EU, Dutch subscribers can keep using their streaming apps while travelling.
        </p>
      </section>
    </EnShell>
  )
}

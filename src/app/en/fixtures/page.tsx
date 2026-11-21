import type { Metadata } from 'next'
import { EnShell } from '@/components/en/EnShell'
import { EnMatchList } from '@/components/en/EnMatchList'
import { fetchEredivisieData } from '@/lib/espn'
import { enMetadata } from '@/lib/i18n'

export const revalidate = 300

export const metadata: Metadata = enMetadata({
  title: 'Eredivisie fixtures: upcoming matches, kickoff times and TV channels | Eredivisie.tv',
  description: 'All upcoming Eredivisie fixtures with kickoff times in Amsterdam and your own time zone, and the ESPN channel for each match.',
  enPath: '/en/fixtures',
  nlPath: '/programma',
})

export default async function EnFixtures() {
  const data = await fetchEredivisieData()
  const rounds = data.matchweeks
    .filter((w) => w.matches.some((m) => m.status !== 'finished'))
    .slice(0, 3)

  return (
    <EnShell nlHref="/programma" active="/en/fixtures">
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie fixtures</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">The next rounds, with kickoff times in Amsterdam time and the expected ESPN channel.</p>
      {rounds.length === 0 && <p className="pt-8 text-sm text-muted">No upcoming fixtures right now.</p>}
      {rounds.map((w) => (
        <section key={w.number} className="pt-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">{w.round ? `Matchday ${w.round}` : 'Rescheduled matches'}</h2>
          <EnMatchList matches={w.matches} />
        </section>
      ))}
    </EnShell>
  )
}

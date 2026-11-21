import type { Metadata } from 'next'
import { EnShell } from '@/components/en/EnShell'
import { EnTable } from '@/components/en/EnTable'
import { fetchEredivisieData } from '@/lib/espn'
import { enMetadata } from '@/lib/i18n'

export const revalidate = 300

export const metadata: Metadata = enMetadata({
  title: 'Eredivisie table: current standings | Eredivisie.tv',
  description: 'The current Eredivisie table: points, goal difference and results for all 18 clubs, from the title race to the relegation battle.',
  enPath: '/en/table',
  nlPath: '/stand',
})

export default async function EnTablePage() {
  const data = await fetchEredivisieData()
  const [leader, second] = data.standings
  return (
    <EnShell nlHref="/stand" active="/en/table">
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie table {data.standingsSeason?.label ?? ''}</h1>
      {leader && second && (
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {leader.club.name} lead with {leader.points} points from {leader.played} matches,{' '}
          {leader.points === second.points ? `level with ${second.club.name}` : `${leader.points - second.points} point${leader.points - second.points === 1 ? '' : 's'} ahead of ${second.club.name}`}.
        </p>
      )}
      <div className="pt-6">
        <EnTable standings={data.standings} />
      </div>
      <p className="mt-4 text-xs text-muted">
        P played · W won · D drawn · L lost · GD goal difference · Pts points. The champion qualifies for the Champions League; the bottom clubs face relegation to the Eerste Divisie.
      </p>
    </EnShell>
  )
}

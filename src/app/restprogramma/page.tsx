import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import { PageShell } from '@/components/PageShell'
import { StandTabs } from '@/components/StandTabs'
import { fetchEredivisieData } from '@/lib/espn'
import { remainingSchedule } from '@/lib/table'
import { SITE_URL } from '@/lib/structured-data'

export const revalidate = 300

const title = 'Restprogramma Eredivisie: wie heeft het zwaarste programma? | Eredivisie.tv'
const description = 'Het restprogramma van alle Eredivisie-clubs, gerangschikt op zwaarte: de gemiddelde positie van de tegenstanders die nog komen, en hoeveel thuis- en uitwedstrijden.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/restprogramma` },
  openGraph: { title, description, url: `${SITE_URL}/restprogramma`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
}

export default async function RestprogrammaPage() {
  const data = await fetchEredivisieData()
  const rows = data.standings
    .map((s) => ({ standing: s, ...remainingSchedule(s.club.id, data.allMatches, data.standings) }))
    .filter((r) => r.remaining.length > 0 && r.avgOpponentPosition !== null)
    .sort((a, b) => a.avgOpponentPosition! - b.avgOpponentPosition!)
  const hardest = rows[0]
  const easiest = rows[rows.length - 1]

  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Stand', href: '/stand' }, { label: 'Restprogramma', href: '/restprogramma' }]}>
      <StandTabs active="/restprogramma" />
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Restprogramma Eredivisie</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Hoe zwaar is het programma dat nog komt? We nemen de huidige standpositie van elke tegenstander en middelen die: hoe lager het getal, hoe sterker de tegenstanders.
        {hardest && easiest && hardest !== easiest && (
          <>
            {' '}
            <strong className="text-foreground">{hardest.standing.club.name}</strong> heeft op papier het zwaarste restprogramma, <strong className="text-foreground">{easiest.standing.club.name}</strong> het lichtste.
          </>
        )}
      </p>
      {rows.length === 0 ? (
        <p className="py-10 text-sm text-muted">Er staan geen wedstrijden meer in het programma.</p>
      ) : (
        <div className="my-8 overflow-x-auto rounded-xl bg-card shadow-sm ring-1 ring-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-light">
                <th className="py-3 pl-4 pr-2">Zwaarte</th>
                <th className="px-2 py-3">Club</th>
                <th className="px-2 py-3 text-center">Stand</th>
                <th className="px-2 py-3 text-center">Nog te spelen</th>
                <th className="hidden px-2 py-3 text-center sm:table-cell">Thuis / uit</th>
                <th className="py-3 pl-2 pr-4 text-right">Gem. tegenstander</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.standing.club.id} className="border-t border-border">
                  <td className="py-2.5 pl-4 pr-2 font-bold tabular-nums text-muted">{i + 1}</td>
                  <td className="px-2 py-2.5">
                    <Link href={`/club/${r.standing.club.slug}#restprogramma`} className="flex items-center gap-2 font-semibold text-foreground hover:text-accent">
                      <Image src={r.standing.club.logo} alt="" width={20} height={20} className="h-5 w-5" />
                      {r.standing.club.shortName}
                    </Link>
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums text-muted">{r.standing.position}e</td>
                  <td className="px-2 py-2.5 text-center tabular-nums">{r.remaining.length}</td>
                  <td className="hidden px-2 py-2.5 text-center tabular-nums text-muted sm:table-cell">{r.home} / {r.away}</td>
                  <td className="py-2.5 pl-2 pr-4 text-right font-extrabold tabular-nums">{r.avgOpponentPosition!.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="pb-10 text-xs text-muted-light">
        Op basis van het programma dat nu bekend is bij ESPN; verderop in het seizoen kunnen nog wedstrijden worden toegevoegd of verplaatst.
      </p>
    </PageShell>
  )
}

import Image from 'next/image'
import { EredivisieData } from '@/data/types'
import type { Competition } from '@/lib/espn'
import { MatchCard, MatchGrid } from './MatchCard'
import { PageShell } from './PageShell'
import { Faq } from './Faq'
import { FaqItem, matchStructuredData } from '@/lib/structured-data'
import { formatDutchDate, formatTime, groupMatchesByDate } from '@/lib/utils'

/** Shared layout for KKD and KNVB Beker: upcoming matches, results and (for KKD) the table. */
export function CompetitionView({ data, competition, intro, path }: { data: EredivisieData; competition: Competition; intro: string; path: string }) {
  const upcoming = competition.matches.filter((m) => m.status !== 'finished').sort((a, b) => a.date.localeCompare(b.date))
  const played = competition.matches.filter((m) => m.status === 'finished').sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12)
  const next = upcoming[0]
  const faq: FaqItem[] = [
    {
      question: `Op welke zender is de ${competition.name} te zien?`,
      answer: `Wedstrijden uit de ${competition.name} worden uitgezonden door ESPN en zijn online te zien via ESPN.nl en de ESPN-app.`,
    },
  ]
  if (next) {
    faq.push({
      question: `Wanneer is de volgende wedstrijd in de ${competition.name}?`,
      answer: `${next.homeTeam.name} – ${next.awayTeam.name} op ${formatDutchDate(next.date)} om ${formatTime(next.date)}.`,
    })
  }

  return (
    <PageShell data={data} breadcrumbs={[{ label: competition.name, href: path }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(upcoming.slice(0, 10).flatMap(matchStructuredData)) }} />
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">{competition.name} op TV</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{intro}</p>

      {upcoming.length > 0 ? (
        [...groupMatchesByDate(upcoming.slice(0, 20)).entries()].map(([key, list]) => (
          <section key={key} className="w-full pt-8">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">{formatDutchDate(list[0].date)}</h2>
            <MatchGrid>
              {list.map((m) => (
                <MatchCard key={m.id} match={m} link={false} />
              ))}
            </MatchGrid>
          </section>
        ))
      ) : (
        <p className="py-8 text-sm text-muted">Er staan de komende weken geen wedstrijden gepland.</p>
      )}

      {competition.standings.length > 0 && (
        <section className="w-full py-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Stand {competition.name}</h2>
          <div className="overflow-x-auto rounded-xl bg-card shadow-sm ring-1 ring-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th className="px-3 py-3">#</th>
                  <th className="px-2 py-3">Club</th>
                  <th className="px-2 py-3 text-center">GS</th>
                  <th className="hidden px-2 py-3 text-center sm:table-cell">W-G-V</th>
                  <th className="px-2 py-3 text-center">+/-</th>
                  <th className="px-3 py-3 text-center">Pt</th>
                </tr>
              </thead>
              <tbody>
                {competition.standings.map((s) => (
                  <tr key={s.club.id} className="border-t border-border">
                    <td className="px-3 py-2.5 font-bold text-muted">{s.position}</td>
                    <td className="px-2 py-2.5">
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        <Image src={s.club.logo} alt="" width={20} height={20} className="h-5 w-5" />
                        {s.club.shortName}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center text-muted">{s.played}</td>
                    <td className="hidden px-2 py-2.5 text-center text-muted sm:table-cell">{s.won}-{s.drawn}-{s.lost}</td>
                    <td className="px-2 py-2.5 text-center text-muted">{s.goalsFor - s.goalsAgainst > 0 ? '+' : ''}{s.goalsFor - s.goalsAgainst}</td>
                    <td className="px-3 py-2.5 text-center font-extrabold text-foreground">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {played.length > 0 && (
        <section className="w-full py-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Laatste uitslagen</h2>
          <MatchGrid>
            {played.map((m) => (
              <MatchCard key={m.id} match={m} link={false} showDate />
            ))}
          </MatchGrid>
        </section>
      )}

      <Faq title="Veelgestelde vragen" items={faq} />
    </PageShell>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import { StandingEntry, FormResult, SeasonInfo } from '@/data/types'

const formColors: Record<FormResult, string> = {
  W: 'bg-emerald-500',
  D: 'bg-amber-400',
  L: 'bg-red-500',
}

const formLabels: Record<FormResult, string> = {
  W: 'Winst',
  D: 'Gelijk',
  L: 'Verlies',
}

// Dot color per position, matching the legend below the table
function positionDot(pos: number): { color: string; label: string } | null {
  if (pos === 1) return { color: 'bg-yellow-400', label: 'Kampioen / Champions League' }
  if (pos <= 3) return { color: 'bg-blue-400', label: 'Europa League' }
  if (pos === 4) return { color: 'bg-emerald-400', label: 'Conference League' }
  if (pos >= 16 && pos <= 17) return { color: 'bg-orange-400', label: 'Nacompetitie' }
  if (pos === 18) return { color: 'bg-red-400', label: 'Degradatie' }
  return null
}

export function Standings({
  standings,
  season,
  title = 'Eredivisie Stand',
  as: Heading = 'h2',
  zones = true,
}: {
  standings: StandingEntry[]
  season?: SeasonInfo | null
  title?: string
  as?: 'h1' | 'h2'
  /** Europe/relegation markers; off for home, away and form tables */
  zones?: boolean
}) {
  if (standings.length === 0) {
    return (
      <section id="stand" className="w-full py-10">
        <Heading className="mb-4 text-2xl font-extrabold text-foreground">{title}</Heading>
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-foreground">Stand tijdelijk niet beschikbaar</p>
          <p className="mt-1 text-sm text-muted">De standen van ESPN konden niet worden geladen. Probeer het over een paar minuten opnieuw.</p>
        </div>
      </section>
    )
  }

  const showForm = standings.some((entry) => entry.form && entry.form.length > 0)

  return (
    <section id="stand" className="w-full py-10">
      <div className={`flex flex-wrap items-center gap-3 ${season && !season.isCurrent ? 'mb-2' : 'mb-6'}`}>
        <Heading className="text-2xl font-extrabold text-foreground">{title}</Heading>
        {season && (
          <span className="rounded-full bg-accent-light px-3 py-0.5 text-xs font-semibold text-accent">
            {season.isCurrent ? `Seizoen ${season.label}` : `Eindstand ${season.label}`}
          </span>
        )}
      </div>
      {season && !season.isCurrent && (
        <p className="mb-6 text-sm text-muted">
          Het nieuwe seizoen is nog niet begonnen. Zodra de eerste wedstrijden gespeeld zijn, zie je hier de actuele stand.
        </p>
      )}
      <div className="overflow-x-auto rounded-xl bg-card shadow-sm ring-1 ring-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-accent/10 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
              <th className="w-12 px-3 py-3.5 sm:px-4">#</th>
              <th className="px-2 py-3.5 sm:px-4">Club</th>
              <th className="px-2 py-3.5 text-center sm:px-4">GS</th>
              <th className="hidden px-4 py-3.5 text-center sm:table-cell">W</th>
              <th className="hidden px-4 py-3.5 text-center sm:table-cell">G</th>
              <th className="hidden px-4 py-3.5 text-center sm:table-cell">V</th>
              <th className="px-4 py-3.5 text-center hidden md:table-cell">DV</th>
              <th className="px-4 py-3.5 text-center hidden md:table-cell">DT</th>
              <th className="px-2 py-3.5 text-center sm:px-4">+/-</th>
              <th className="px-3 py-3.5 text-center sm:px-4">Pt</th>
              {showForm && <th className="px-4 py-3.5 text-center hidden xl:table-cell">Vorm</th>}
            </tr>
          </thead>
          <tbody>
            {standings.map((entry) => {
              const dot = zones ? positionDot(entry.position) : null
              return (
                <tr
                  key={entry.club.id}
                  className="border-b border-border transition-colors last:border-b-0 hover:bg-background"
                >
                  <td className="px-3 py-3 sm:px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 font-bold text-muted">{entry.position}</span>
                      {dot ? (
                        <span title={dot.label} className={`h-2 w-2 shrink-0 rounded-full ${dot.color}`} />
                      ) : (
                        <span className="h-2 w-2 shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3 sm:px-4">
                    <Link href={`/club/${entry.club.slug}`} className="flex items-center gap-2.5 hover:text-accent">
                      <Image src={entry.club.logo} alt="" width={22} height={22} className="h-[22px] w-[22px] shrink-0" />
                      <span className="whitespace-nowrap font-semibold text-foreground sm:hidden">{entry.club.shortName}</span>
                      <span className="hidden whitespace-nowrap font-semibold text-foreground sm:inline">{entry.club.name}</span>
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-center text-muted sm:px-4">{entry.played}</td>
                  <td className="hidden px-4 py-3 text-center text-muted sm:table-cell">{entry.won}</td>
                  <td className="hidden px-4 py-3 text-center text-muted sm:table-cell">{entry.drawn}</td>
                  <td className="hidden px-4 py-3 text-center text-muted sm:table-cell">{entry.lost}</td>
                  <td className="px-4 py-3 text-center text-muted hidden md:table-cell">{entry.goalsFor}</td>
                  <td className="px-4 py-3 text-center text-muted hidden md:table-cell">{entry.goalsAgainst}</td>
                  <td className="px-2 py-3 text-center tabular-nums text-muted sm:px-4">
                    {entry.goalsFor - entry.goalsAgainst > 0 ? '+' : ''}
                    {entry.goalsFor - entry.goalsAgainst}
                  </td>
                  <td className="px-3 py-3 text-center text-base font-extrabold text-foreground sm:px-4">{entry.points}</td>
                  {showForm && (
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {entry.form && entry.form.length > 0 && (
                        <div className="flex items-center justify-center gap-1">
                          {entry.form.map((result, i) => (
                            <span
                              key={i}
                              title={formLabels[result]}
                              className={`inline-block h-5 w-5 rounded-full text-[10px] font-bold leading-5 text-center text-white ${formColors[result]}`}
                            >
                              {result}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {zones && <div className="mt-4 flex flex-wrap gap-5 text-xs font-medium text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" /> Champions League
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-400" /> Europa League
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Conference League
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-400" /> Nacompetitie
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" /> Degradatie
        </span>
      </div>}
    </section>
  )
}

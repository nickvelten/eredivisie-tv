import Image from 'next/image'
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

export function Standings({ standings, season }: { standings: StandingEntry[]; season?: SeasonInfo | null }) {
  if (standings.length === 0) {
    return (
      <section id="stand" className="mx-auto w-full max-w-5xl px-4 py-10">
        <h2 className="mb-4 text-2xl font-extrabold text-foreground">Eredivisie Stand</h2>
        <p className="text-sm text-muted">Stand niet beschikbaar.</p>
      </section>
    )
  }

  const showForm = standings.some((entry) => entry.form && entry.form.length > 0)

  return (
    <section id="stand" className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className={`flex flex-wrap items-center gap-3 ${season && !season.isCurrent ? 'mb-2' : 'mb-6'}`}>
        <h2 className="text-2xl font-extrabold text-foreground">Eredivisie Stand</h2>
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
              <th className="px-4 py-3.5 w-12">#</th>
              <th className="px-4 py-3.5">Club</th>
              <th className="px-4 py-3.5 text-center">GS</th>
              <th className="px-4 py-3.5 text-center">W</th>
              <th className="px-4 py-3.5 text-center">G</th>
              <th className="px-4 py-3.5 text-center">V</th>
              <th className="px-4 py-3.5 text-center hidden sm:table-cell">DV</th>
              <th className="px-4 py-3.5 text-center hidden sm:table-cell">DT</th>
              <th className="px-4 py-3.5 text-center hidden sm:table-cell">+/-</th>
              <th className="px-4 py-3.5 text-center">Pt</th>
              {showForm && <th className="px-4 py-3.5 text-center hidden md:table-cell">Vorm</th>}
            </tr>
          </thead>
          <tbody>
            {standings.map((entry) => {
              const dot = positionDot(entry.position)
              return (
                <tr
                  key={entry.club.id}
                  className="border-b border-border transition-colors last:border-b-0 hover:bg-background"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 font-bold text-muted">{entry.position}</span>
                      {dot ? (
                        <span title={dot.label} className={`h-2 w-2 shrink-0 rounded-full ${dot.color}`} />
                      ) : (
                        <span className="h-2 w-2 shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Image src={entry.club.logo} alt={entry.club.name} width={22} height={22} />
                      <span className="font-semibold text-foreground">{entry.club.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-muted">{entry.played}</td>
                  <td className="px-4 py-3 text-center text-muted">{entry.won}</td>
                  <td className="px-4 py-3 text-center text-muted">{entry.drawn}</td>
                  <td className="px-4 py-3 text-center text-muted">{entry.lost}</td>
                  <td className="px-4 py-3 text-center text-muted hidden sm:table-cell">{entry.goalsFor}</td>
                  <td className="px-4 py-3 text-center text-muted hidden sm:table-cell">{entry.goalsAgainst}</td>
                  <td className="px-4 py-3 text-center text-muted hidden sm:table-cell">
                    {entry.goalsFor - entry.goalsAgainst > 0 ? '+' : ''}
                    {entry.goalsFor - entry.goalsAgainst}
                  </td>
                  <td className="px-4 py-3 text-center text-base font-extrabold text-foreground">{entry.points}</td>
                  {showForm && (
                    <td className="px-4 py-3 hidden md:table-cell">
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
      <div className="mt-4 flex flex-wrap gap-5 text-xs font-medium text-muted">
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
      </div>
    </section>
  )
}

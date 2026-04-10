import Image from 'next/image'
import { StandingEntry, FormResult } from '@/data/types'

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

function positionStyle(pos: number): string {
  if (pos === 1) return 'border-l-3 border-yellow-400 bg-yellow-400/10'
  if (pos <= 3) return 'border-l-3 border-blue-400'
  if (pos === 4) return 'border-l-3 border-emerald-400'
  if (pos >= 16 && pos <= 17) return 'border-l-3 border-orange-400 bg-orange-400/10'
  if (pos === 18) return 'border-l-3 border-red-400 bg-red-400/10'
  return 'border-l-3 border-transparent'
}

export function Standings({ standings }: { standings: StandingEntry[] }) {
  if (standings.length === 0) {
    return (
      <section id="stand" className="mx-auto w-full max-w-5xl px-4 py-10">
        <h2 className="mb-4 text-2xl font-extrabold text-foreground">Eredivisie Stand</h2>
        <p className="text-sm text-muted">Stand niet beschikbaar.</p>
      </section>
    )
  }

  return (
    <section id="stand" className="mx-auto w-full max-w-5xl px-4 py-10">
      <h2 className="mb-6 text-2xl font-extrabold text-foreground">Eredivisie Stand</h2>
      <div className="overflow-x-auto rounded-xl bg-card shadow-sm ring-1 ring-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-accent/10 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
              <th className="px-4 py-3.5 w-8">#</th>
              <th className="px-4 py-3.5">Club</th>
              <th className="px-4 py-3.5 text-center">GS</th>
              <th className="px-4 py-3.5 text-center">W</th>
              <th className="px-4 py-3.5 text-center">G</th>
              <th className="px-4 py-3.5 text-center">V</th>
              <th className="px-4 py-3.5 text-center hidden sm:table-cell">DV</th>
              <th className="px-4 py-3.5 text-center hidden sm:table-cell">DT</th>
              <th className="px-4 py-3.5 text-center hidden sm:table-cell">+/-</th>
              <th className="px-4 py-3.5 text-center">Pt</th>
              <th className="px-4 py-3.5 text-center hidden md:table-cell">Vorm</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((entry) => (
              <tr
                key={entry.club.id}
                className={`border-b border-border transition-colors hover:bg-background ${positionStyle(entry.position)}`}
              >
                <td className="px-4 py-3 font-bold text-muted">{entry.position}</td>
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
              </tr>
            ))}
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

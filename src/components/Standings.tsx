import Image from 'next/image'
import { StandingEntry } from '@/data/types'

function positionStyle(pos: number): string {
  if (pos === 1) return 'border-l-3 border-yellow-400 bg-yellow-50/50'
  if (pos <= 3) return 'border-l-3 border-blue-400'
  if (pos === 4) return 'border-l-3 border-emerald-400'
  if (pos >= 17) return 'border-l-3 border-red-400 bg-red-50/30'
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
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-accent/10 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
              <th className="px-4 py-3.5 w-8">#</th>
              <th className="px-4 py-3.5">Club</th>
              <th className="px-4 py-3.5 text-center">W</th>
              <th className="px-4 py-3.5 text-center">G</th>
              <th className="px-4 py-3.5 text-center">V</th>
              <th className="px-4 py-3.5 text-center hidden sm:table-cell">+/-</th>
              <th className="px-4 py-3.5 text-center">Pt</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((entry) => (
              <tr
                key={entry.club.id}
                className={`border-b border-black/5 transition-colors hover:bg-background ${positionStyle(entry.position)}`}
              >
                <td className="px-4 py-3 font-bold text-muted">{entry.position}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Image src={entry.club.logo} alt={entry.club.name} width={22} height={22} />
                    <span className="font-semibold text-foreground">{entry.club.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-muted">{entry.won}</td>
                <td className="px-4 py-3 text-center text-muted">{entry.drawn}</td>
                <td className="px-4 py-3 text-center text-muted">{entry.lost}</td>
                <td className="px-4 py-3 text-center text-muted hidden sm:table-cell">
                  {entry.goalsFor - entry.goalsAgainst > 0 ? '+' : ''}
                  {entry.goalsFor - entry.goalsAgainst}
                </td>
                <td className="px-4 py-3 text-center text-base font-extrabold text-foreground">{entry.points}</td>
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
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" /> Degradatie
        </span>
      </div>
    </section>
  )
}

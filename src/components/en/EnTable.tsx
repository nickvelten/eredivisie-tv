import Image from 'next/image'
import Link from 'next/link'
import { StandingEntry } from '@/data/types'

/** League table; `highlight` marks one club, `rows` limits to a window. */
export function EnTable({ standings, highlight, rows }: { standings: StandingEntry[]; highlight?: string; rows?: StandingEntry[] }) {
  const list = rows ?? standings
  return (
    <div className="overflow-x-auto rounded-xl bg-card shadow-sm ring-1 ring-border">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wide text-muted">
          <tr className="border-b border-border">
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">Club</th>
            <th className="px-2 py-2 text-right" title="Played">P</th>
            <th className="hidden px-2 py-2 text-right sm:table-cell" title="Won">W</th>
            <th className="hidden px-2 py-2 text-right sm:table-cell" title="Drawn">D</th>
            <th className="hidden px-2 py-2 text-right sm:table-cell" title="Lost">L</th>
            <th className="px-2 py-2 text-right" title="Goal difference">GD</th>
            <th className="px-3 py-2 text-right" title="Points">Pts</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => (
            <tr key={s.club.id} className={`border-b border-border last:border-0 ${s.club.id === highlight ? 'bg-accent/10 font-bold' : ''}`}>
              <td className="px-3 py-2 tabular-nums text-muted">{s.position}</td>
              <td className="px-3 py-2">
                <Link href={`/en/club/${s.club.slug}`} className="flex items-center gap-2 font-semibold text-foreground hover:text-accent">
                  <Image src={s.club.logo} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
                  {s.club.shortName}
                </Link>
              </td>
              <td className="px-2 py-2 text-right tabular-nums">{s.played}</td>
              <td className="hidden px-2 py-2 text-right tabular-nums sm:table-cell">{s.won}</td>
              <td className="hidden px-2 py-2 text-right tabular-nums sm:table-cell">{s.drawn}</td>
              <td className="hidden px-2 py-2 text-right tabular-nums sm:table-cell">{s.lost}</td>
              <td className="px-2 py-2 text-right tabular-nums">{s.goalsFor - s.goalsAgainst > 0 ? '+' : ''}{s.goalsFor - s.goalsAgainst}</td>
              <td className="px-3 py-2 text-right font-extrabold tabular-nums text-foreground">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import Image from 'next/image'
import { standings } from '@/data/standings'

function positionClass(pos: number): string {
  if (pos === 1) return 'border-l-2 border-yellow-500'
  if (pos <= 3) return 'border-l-2 border-blue-500'
  if (pos === 4) return 'border-l-2 border-green-500'
  if (pos >= 17) return 'border-l-2 border-red-500'
  return 'border-l-2 border-transparent'
}

export function Standings() {
  return (
    <section id="stand" className="mx-auto w-full max-w-5xl px-4 py-8">
      <h2 className="mb-6 text-xl font-bold text-white">Eredivisie Stand</h2>
      <div className="overflow-x-auto rounded-xl bg-[#141414]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 w-8">#</th>
              <th className="px-4 py-3">Club</th>
              <th className="px-4 py-3 text-center">W</th>
              <th className="px-4 py-3 text-center">G</th>
              <th className="px-4 py-3 text-center">V</th>
              <th className="px-4 py-3 text-center hidden sm:table-cell">+/-</th>
              <th className="px-4 py-3 text-center font-bold">Pt</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((entry) => (
              <tr
                key={entry.club.id}
                className={`border-b border-white/5 transition-colors hover:bg-[#1a1a1a] ${positionClass(entry.position)}`}
              >
                <td className="px-4 py-2.5 text-zinc-400">{entry.position}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Image src={entry.club.logo} alt={entry.club.name} width={20} height={20} className="rounded-full" />
                    <span className="font-medium text-white">{entry.club.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-center text-zinc-300">{entry.won}</td>
                <td className="px-4 py-2.5 text-center text-zinc-300">{entry.drawn}</td>
                <td className="px-4 py-2.5 text-center text-zinc-300">{entry.lost}</td>
                <td className="px-4 py-2.5 text-center text-zinc-300 hidden sm:table-cell">
                  {entry.goalsFor - entry.goalsAgainst > 0 ? '+' : ''}{entry.goalsFor - entry.goalsAgainst}
                </td>
                <td className="px-4 py-2.5 text-center font-bold text-white">{entry.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500" /> Champions League</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Europa League</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Conference League</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Degradatie</span>
      </div>
    </section>
  )
}

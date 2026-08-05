'use client'

import { useState } from 'react'
import Image from 'next/image'
import { TopScorer, TopAssister, SeasonInfo } from '@/data/types'

type Tab = 'goals' | 'assists'

// Medal-tinted rank badge for the top 3, plain number below that
const medalStyles: Record<number, string> = {
  1: 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-400',
  2: 'bg-slate-400/20 text-slate-500 dark:text-slate-300',
  3: 'bg-orange-400/20 text-orange-600 dark:text-orange-400',
}

function RankBadge({ position }: { position: number }) {
  const medal = medalStyles[position]
  if (!medal) return <span className="inline-block w-7 text-center font-bold text-muted">{position}</span>
  return (
    <span className={`inline-block h-7 w-7 rounded-full text-center text-xs font-extrabold leading-7 ${medal}`}>
      {position}
    </span>
  )
}

export function TopScorers({
  topScorers,
  topAssisters,
  season,
}: {
  topScorers: TopScorer[]
  topAssisters: TopAssister[]
  season?: SeasonInfo | null
}) {
  const [tab, setTab] = useState<Tab>('goals')

  if (topScorers.length === 0 && topAssisters.length === 0) return null

  const rows =
    tab === 'goals'
      ? topScorers.map((s) => ({ position: s.position, name: s.name, flag: s.flag, matches: s.matches, value: s.goals }))
      : topAssisters.map((a) => ({ position: a.position, name: a.name, flag: a.flag, matches: a.matches, value: a.assists }))

  return (
    <section id="topscorers" className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className={`flex flex-wrap items-center gap-3 ${season && !season.isCurrent ? 'mb-2' : 'mb-6'}`}>
        <h2 className="text-2xl font-extrabold text-foreground">Topscorers</h2>
        {season && (
          <span className="rounded-full bg-accent-light px-3 py-0.5 text-xs font-semibold text-accent">
            {season.isCurrent ? `Seizoen ${season.label}` : `Eindklassement ${season.label}`}
          </span>
        )}
      </div>
      {season && !season.isCurrent && (
        <p className="mb-6 text-sm text-muted">
          Het nieuwe seizoen is nog niet begonnen. Dit is het eindklassement van vorig seizoen; zodra er gescoord wordt, zie je hier de actuele topscorers.
        </p>
      )}

      <div className="mb-4 flex gap-1">
        <button
          onClick={() => setTab('goals')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tab === 'goals'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-card text-muted ring-1 ring-border hover:text-foreground'
          }`}
        >
          Doelpunten
        </button>
        <button
          onClick={() => setTab('assists')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tab === 'assists'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-card text-muted ring-1 ring-border hover:text-foreground'
          }`}
        >
          Assists
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-card shadow-sm ring-1 ring-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-accent/10 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
              <th className="px-4 py-3.5 w-12">#</th>
              <th className="px-4 py-3.5">Speler</th>
              <th className="px-4 py-3.5 text-center hidden sm:table-cell">Wed.</th>
              <th className="px-4 py-3.5 text-center">{tab === 'goals' ? 'Goals' : 'Assists'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.position}
                className="border-b border-border transition-colors last:border-b-0 hover:bg-background"
              >
                <td className="px-4 py-2.5">
                  <RankBadge position={row.position} />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    {row.flag && (
                      <Image
                        src={row.flag}
                        alt=""
                        width={20}
                        height={20}
                        className="h-4 w-4 rounded-sm object-cover"
                      />
                    )}
                    <span className="font-semibold text-foreground">{row.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-center text-muted hidden sm:table-cell">{row.matches}</td>
                <td className="px-4 py-2.5 text-center text-base font-extrabold text-foreground">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

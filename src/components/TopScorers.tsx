'use client'

import { useState } from 'react'
import Image from 'next/image'
import { TopScorer, TopAssister } from '@/data/types'

type Tab = 'goals' | 'assists'

export function TopScorers({
  topScorers,
  topAssisters,
}: {
  topScorers: TopScorer[]
  topAssisters: TopAssister[]
}) {
  const [tab, setTab] = useState<Tab>('goals')

  if (topScorers.length === 0 && topAssisters.length === 0) return null

  return (
    <section id="topscorers" className="mx-auto w-full max-w-5xl px-4 py-10">
      <h2 className="mb-6 text-2xl font-extrabold text-foreground">Topscorers</h2>

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
              <th className="px-4 py-3.5 w-8">#</th>
              <th className="px-4 py-3.5">Speler</th>
              <th className="px-4 py-3.5 text-center hidden sm:table-cell">Wed.</th>
              <th className="px-4 py-3.5 text-center">{tab === 'goals' ? 'Goals' : 'Assists'}</th>
            </tr>
          </thead>
          <tbody>
            {tab === 'goals'
              ? topScorers.map((scorer) => (
                  <tr
                    key={scorer.position}
                    className={`border-b border-border transition-colors hover:bg-background ${
                      scorer.position <= 3 ? 'border-l-3 border-accent/30' : 'border-l-3 border-transparent'
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-muted">{scorer.position}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {scorer.flag && (
                          <Image
                            src={scorer.flag}
                            alt=""
                            width={20}
                            height={20}
                            className="h-4 w-4 rounded-sm object-cover"
                          />
                        )}
                        <span className="font-semibold text-foreground">{scorer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-muted hidden sm:table-cell">{scorer.matches}</td>
                    <td className="px-4 py-3 text-center text-base font-extrabold text-foreground">{scorer.goals}</td>
                  </tr>
                ))
              : topAssisters.map((assister) => (
                  <tr
                    key={assister.position}
                    className={`border-b border-border transition-colors hover:bg-background ${
                      assister.position <= 3 ? 'border-l-3 border-accent/30' : 'border-l-3 border-transparent'
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-muted">{assister.position}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {assister.flag && (
                          <Image
                            src={assister.flag}
                            alt=""
                            width={20}
                            height={20}
                            className="h-4 w-4 rounded-sm object-cover"
                          />
                        )}
                        <span className="font-semibold text-foreground">{assister.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-muted hidden sm:table-cell">{assister.matches}</td>
                    <td className="px-4 py-3 text-center text-base font-extrabold text-foreground">{assister.assists}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

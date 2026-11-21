'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

export type CalcClub = { id: string; shortName: string; logo: string }
export type CalcRow = { club: CalcClub; position: number; played: number; points: number; goalsFor: number; goalsAgainst: number }
export type CalcMatch = { id: string; round?: number; date: string; home: CalcClub; away: CalcClub }
type Pick = '1' | 'X' | '2'

const STORAGE_KEY = 'standcalculator'

/**
 * "What if": pick 1, X or 2 for the coming matches and see the table move.
 * A win counts as 1-0 for goal difference. Picks stay in this browser.
 */
export function TableCalculator({ rows, matches }: { rows: CalcRow[]; matches: CalcMatch[] }) {
  const [picks, setPicks] = useState<Record<string, Pick>>({})

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, Pick>
      const valid = Object.fromEntries(Object.entries(saved).filter(([id]) => matches.some((m) => m.id === id)))
      // eslint-disable-next-line react-hooks/set-state-in-effect -- saved picks are only readable in the browser
      setPicks(valid)
    } catch {}
  }, [matches])

  const choose = (id: string, pick: Pick) => {
    setPicks((prev) => {
      const next = { ...prev }
      if (next[id] === pick) delete next[id]
      else next[id] = pick
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const table = useMemo(() => {
    const map = new Map(rows.map((r) => [r.club.id, { ...r }]))
    for (const m of matches) {
      const p = picks[m.id]
      if (!p) continue
      const h = map.get(m.home.id)
      const a = map.get(m.away.id)
      if (!h || !a) continue
      h.played++
      a.played++
      if (p === '1') {
        h.points += 3
        h.goalsFor++
        a.goalsAgainst++
      } else if (p === '2') {
        a.points += 3
        a.goalsFor++
        h.goalsAgainst++
      } else {
        h.points++
        a.points++
      }
    }
    return [...map.values()].sort(
      (x, y) => y.points - x.points || y.goalsFor - y.goalsAgainst - (x.goalsFor - x.goalsAgainst) || y.goalsFor - x.goalsFor
    )
  }, [rows, matches, picks])

  const rounds = [...new Set(matches.map((m) => m.round ?? 0))]
  const count = Object.keys(picks).length

  return (
    <div className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-foreground">Kies de uitslagen</h2>
          {count > 0 && (
            <button type="button" onClick={() => { setPicks({}); try { localStorage.removeItem(STORAGE_KEY) } catch {} }} className="text-xs font-semibold text-accent hover:underline">
              Wis alles ({count})
            </button>
          )}
        </div>
        <div className="flex flex-col gap-5">
          {rounds.map((round) => (
            <div key={round}>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">{round ? `Speelronde ${round}` : 'Inhaalwedstrijden'}</p>
              <ul className="divide-y divide-border rounded-xl bg-card shadow-sm ring-1 ring-border">
                {matches.filter((m) => (m.round ?? 0) === round).map((m) => (
                  <li key={m.id} className="flex items-center gap-2 px-3 py-2">
                    <span className="flex min-w-0 flex-1 items-center justify-end gap-1.5 text-right text-sm font-semibold text-foreground">
                      <span className="truncate">{m.home.shortName}</span>
                      <Image src={m.home.logo} alt="" width={18} height={18} className="h-[18px] w-[18px] shrink-0" />
                    </span>
                    <span className="flex shrink-0 gap-1" role="group" aria-label={`${m.home.shortName} tegen ${m.away.shortName}`}>
                      {(['1', 'X', '2'] as Pick[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => choose(m.id, p)}
                          aria-pressed={picks[m.id] === p}
                          aria-label={p === '1' ? `${m.home.shortName} wint` : p === '2' ? `${m.away.shortName} wint` : 'Gelijkspel'}
                          className={`h-8 w-8 rounded-lg text-xs font-bold ring-1 transition-colors ${picks[m.id] === p ? 'bg-accent text-white ring-accent' : 'bg-background text-muted ring-border hover:text-accent'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </span>
                    <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Image src={m.away.logo} alt="" width={18} height={18} className="h-[18px] w-[18px] shrink-0" />
                      <span className="truncate">{m.away.shortName}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:sticky lg:top-40 lg:self-start">
        <h2 className="mb-3 text-lg font-extrabold text-foreground">Zo komt de stand eruit te zien</h2>
        <div className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-light">
                <th className="py-2 pl-4 pr-1">#</th>
                <th className="px-1 py-2">Club</th>
                <th className="px-1 py-2 text-center">GS</th>
                <th className="px-1 py-2 text-center">+/-</th>
                <th className="py-2 pl-1 pr-4 text-right">Pt</th>
              </tr>
            </thead>
            <tbody>
              {table.map((r, i) => {
                const move = r.position - (i + 1)
                return (
                  <tr key={r.club.id} className="border-t border-border">
                    <td className="py-1.5 pl-4 pr-1 font-bold tabular-nums text-muted">
                      {i + 1}
                      {move !== 0 && (
                        <span className={`ml-1 text-[10px] ${move > 0 ? 'text-emerald-600' : 'text-red-500'}`} aria-label={move > 0 ? `${move} plaats omhoog` : `${-move} plaats omlaag`}>
                          {move > 0 ? '▲' : '▼'}
                          {Math.abs(move)}
                        </span>
                      )}
                    </td>
                    <td className="px-1 py-1.5">
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        <Image src={r.club.logo} alt="" width={16} height={16} className="h-4 w-4" />
                        {r.club.shortName}
                      </span>
                    </td>
                    <td className="px-1 py-1.5 text-center tabular-nums text-muted">{r.played}</td>
                    <td className="px-1 py-1.5 text-center tabular-nums text-muted">{r.goalsFor - r.goalsAgainst > 0 ? '+' : ''}{r.goalsFor - r.goalsAgainst}</td>
                    <td className="py-1.5 pl-1 pr-4 text-right font-extrabold tabular-nums">{r.points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import { EredivisieData } from '@/data/types'
import { playerSlugMap } from '@/lib/players'
import { formatTime, formatShortDate } from '@/lib/utils'

export type SidebarOptions = {
  hideStandings?: boolean
  hideScorers?: boolean
  hideUpcoming?: boolean
  highlightClubIds?: string[]
}

function WidgetHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <h3 className="text-sm font-extrabold text-foreground">{title}</h3>
      <Link href={href} className="text-xs font-semibold text-accent hover:underline">
        {linkLabel}
      </Link>
    </div>
  )
}

/** Right-hand column on wide screens (below the content on mobile): compact stand, top scorers and upcoming matches. */
export async function Sidebar({ data, options = {} }: { data: EredivisieData; options?: SidebarOptions }) {
  const { standings, topScorers, allMatches, standingsSeason } = data
  const highlight = new Set(options.highlightClubIds ?? [])
  const slugs = options.hideScorers ? new Map<string, string>() : await playerSlugMap()
  const upcoming = allMatches
    .filter((m) => m.status !== 'finished')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6)

  return (
    <aside aria-label="Stand en topscorers" className="flex flex-col gap-5 pb-10 lg:pt-10">
      {!options.hideStandings && standings.length > 0 && (
        <section className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border">
          <WidgetHeader
            title={`Stand${standingsSeason ? ` ${standingsSeason.label}` : ''}`}
            href="/stand"
            linkLabel="Volledig →"
          />
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-light">
                <th className="py-2 pl-4 pr-1">#</th>
                <th className="px-1 py-2">Club</th>
                <th className="px-1 py-2 text-center">GS</th>
                <th className="px-1 py-2 text-center">+/-</th>
                <th className="py-2 pl-1 pr-4 text-right">Pt</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s) => {
                const diff = s.goalsFor - s.goalsAgainst
                const active = highlight.has(s.club.id)
                return (
                  <tr key={s.club.id} className={`border-t border-border ${active ? 'bg-accent-light [&_td]:text-foreground' : ''}`}>
                    <td className="py-1.5 pl-4 pr-1 font-bold tabular-nums text-muted">{s.position}</td>
                    <td className="px-1 py-1.5">
                      <Link href={`/club/${s.club.slug}`} className="flex items-center gap-2 font-semibold text-foreground hover:text-accent">
                        <Image src={s.club.logo} alt="" width={16} height={16} className="h-4 w-4 shrink-0" />
                        <span className="truncate">{s.club.shortName}</span>
                      </Link>
                    </td>
                    <td className="px-1 py-1.5 text-center tabular-nums text-muted">{s.played}</td>
                    <td className="px-1 py-1.5 text-center tabular-nums text-muted">{diff > 0 ? `+${diff}` : diff}</td>
                    <td className="py-1.5 pl-1 pr-4 text-right font-extrabold tabular-nums text-foreground">{s.points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      )}

      {!options.hideScorers && topScorers.length > 0 && (
        <section className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border">
          <WidgetHeader title="Topscorers" href="/topscorers" linkLabel="Alle →" />
          <ol>
            {topScorers.slice(0, 5).map((s) => {
              const slug = s.playerId ? slugs.get(s.playerId) : undefined
              const name = slug ? (
                <Link href={`/speler/${slug}`} className="truncate font-semibold text-foreground hover:text-accent">{s.name}</Link>
              ) : (
                <span className="truncate font-semibold text-foreground">{s.name}</span>
              )
              return (
                <li key={s.position} className="flex items-center gap-3 border-t border-border px-4 py-2 text-xs first:border-t-0">
                  <span className="w-4 font-bold tabular-nums text-muted">{s.position}</span>
                  {s.club && <Image src={s.club.logo} alt="" width={16} height={16} className="h-4 w-4 shrink-0" />}
                  <span className="flex min-w-0 flex-1 flex-col">
                    {name}
                    {s.club && <span className="text-[11px] text-muted">{s.club.shortName}</span>}
                  </span>
                  <span className="text-sm font-extrabold tabular-nums text-foreground">{s.goals}</span>
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {!options.hideUpcoming && upcoming.length > 0 && (
        <section className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border">
          <WidgetHeader title="Komende wedstrijden" href="/programma" linkLabel="Programma →" />
          <ul>
            {upcoming.map((m) => {
              const tv = m.broadcasts.find((b) => b.type === 'tv')
              return (
                <li key={m.id} className="border-t border-border first:border-t-0">
                  <Link href={`/wedstrijd/${m.slug}`} className="flex items-center gap-3 px-4 py-2 text-xs transition-colors hover:bg-background">
                    <span className="w-12 shrink-0 text-[11px] leading-tight text-muted">
                      {m.status === 'live' ? (
                        <span className="font-bold text-accent">Live</span>
                      ) : (
                        <>
                          {formatShortDate(m.date)}
                          <span className="block font-bold text-foreground">{formatTime(m.date)}</span>
                        </>
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5 font-semibold text-foreground">
                      <span className="flex items-center gap-1.5 truncate">
                        <Image src={m.homeTeam.logo} alt="" width={14} height={14} className="h-3.5 w-3.5 shrink-0" />
                        {m.homeTeam.shortName}
                      </span>
                      <span className="flex items-center gap-1.5 truncate">
                        <Image src={m.awayTeam.logo} alt="" width={14} height={14} className="h-3.5 w-3.5 shrink-0" />
                        {m.awayTeam.shortName}
                      </span>
                    </span>
                    {tv && <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{tv.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </aside>
  )
}

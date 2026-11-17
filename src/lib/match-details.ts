import { Match } from '@/data/types'

const ESPN_API = 'https://site.api.espn.com/apis'

export type LineupPlayer = {
  id: string
  name: string
  jersey?: string
  position?: string
  starter: boolean
  subbedIn: boolean
  subbedOut: boolean
}

export type Lineup = {
  teamId: string
  formation?: string
  starters: LineupPlayer[]
  bench: LineupPlayer[]
}

export type TeamStats = {
  possession?: number
  shots?: number
  shotsOnTarget?: number
  corners?: number
  fouls?: number
  offsides?: number
  saves?: number
  passes?: number
  passAccuracy?: number
  yellowCards?: number
  redCards?: number
  tackles?: number
}

export type MatchDetails = {
  lineups: Lineup[]
  stats: Record<string, TeamStats> // by team id
  attendance?: number
  referee?: string
}

interface ESPNSummary {
  rosters?: Array<{
    team: { id: string }
    formation?: string
    roster?: Array<{
      starter?: boolean
      subbedIn?: boolean
      subbedOut?: boolean
      jersey?: string
      athlete: { id: string; displayName: string }
      position?: { abbreviation?: string }
    }>
  }>
  boxscore?: { teams?: Array<{ team: { id: string }; statistics?: Array<{ name: string; displayValue: string }> }> }
  gameInfo?: { attendance?: number; officials?: Array<{ displayName: string; position?: { name?: string } }> }
}

function num(v: string | undefined): number | undefined {
  if (v === undefined) return undefined
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : undefined
}

/**
 * Line-ups, team statistics, attendance and referee for one match, from
 * ESPN's summary endpoint. Returns null when ESPN has nothing yet (line-ups
 * appear about an hour before kickoff).
 */
export async function fetchMatchDetails(match: Pick<Match, 'id' | 'status'>, league = 'ned.1'): Promise<MatchDetails | null> {
  try {
    const res = await fetch(`${ESPN_API}/site/v2/sports/soccer/${league}/summary?event=${match.id}`, {
      next: { revalidate: match.status === 'finished' ? 86400 : 120 },
    })
    if (!res.ok) return null
    const data: ESPNSummary = await res.json()

    const lineups: Lineup[] = (data.rosters ?? [])
      .filter((r) => (r.roster?.length ?? 0) > 0)
      .map((r) => {
        const players: LineupPlayer[] = (r.roster ?? []).map((p) => ({
          id: p.athlete.id,
          name: p.athlete.displayName,
          jersey: p.jersey,
          position: p.position?.abbreviation,
          starter: !!p.starter,
          subbedIn: !!p.subbedIn,
          subbedOut: !!p.subbedOut,
        }))
        return {
          teamId: r.team.id,
          formation: r.formation,
          starters: players.filter((p) => p.starter),
          bench: players.filter((p) => !p.starter),
        }
      })

    const stats: Record<string, TeamStats> = {}
    for (const t of data.boxscore?.teams ?? []) {
      const s = Object.fromEntries((t.statistics ?? []).map((x) => [x.name, x.displayValue]))
      if (Object.keys(s).length === 0) continue
      const passPct = num(s.passPct)
      stats[t.team.id] = {
        possession: num(s.possessionPct),
        shots: num(s.totalShots),
        shotsOnTarget: num(s.shotsOnTarget),
        corners: num(s.wonCorners),
        fouls: num(s.foulsCommitted),
        offsides: num(s.offsides),
        saves: num(s.saves),
        passes: num(s.totalPasses),
        passAccuracy: passPct !== undefined ? Math.round(passPct * 100) : undefined,
        yellowCards: num(s.yellowCards),
        redCards: num(s.redCards),
        tackles: num(s.totalTackles),
      }
    }

    const referee = data.gameInfo?.officials?.find((o) => o.position?.name === 'Referee')?.displayName
    const details: MatchDetails = { lineups, stats, attendance: data.gameInfo?.attendance || undefined, referee }
    const empty = lineups.length === 0 && Object.keys(stats).length === 0 && !details.attendance && !referee
    return empty ? null : details
  } catch (error) {
    console.error(`ESPN summary failed for ${match.id}:`, error)
    return null
  }
}

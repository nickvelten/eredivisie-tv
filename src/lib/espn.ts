import { Match, Matchweek, StandingEntry, Odds } from '@/data/types'

const ESPN_API = 'https://site.api.espn.com/apis'
const LEAGUE = 'ned.1'
const REVALIDATE = 3600 // 1 hour

// --- ESPN API response types ---

interface ESPNTeam {
  id: string
  displayName: string
  abbreviation: string
  logo?: string
  logos?: Array<{ href: string }>
}

interface ESPNCompetitor {
  homeAway: 'home' | 'away'
  score: string
  team: ESPNTeam
}

interface ESPNOdds {
  provider: { id: string; name: string }
  moneyline?: {
    home?: { close?: { odds: string } }
    away?: { close?: { odds: string } }
    draw?: { close?: { odds: string } }
  }
}

interface ESPNEvent {
  id: string
  date: string
  name: string
  competitions: Array<{
    competitors: ESPNCompetitor[]
    status: {
      type: {
        name: string
        state: string
        completed: boolean
      }
    }
    odds?: ESPNOdds[]
  }>
}

interface ESPNScoreboardResponse {
  leagues: Array<{
    id: string
    calendar: string[]
  }>
  events: ESPNEvent[]
}

interface ESPNStandingsResponse {
  children: Array<{
    standings: {
      entries: Array<{
        team: ESPNTeam
        stats: Array<{
          name: string
          value: number
        }>
      }>
    }
  }>
}

// --- Date helpers ---

function formatDateParam(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}

// --- Calendar → Matchweek grouping ---

function groupCalendarIntoWeeks(calendar: string[]): { start: Date; end: Date; number: number }[] {
  if (calendar.length === 0) return []

  const dates = calendar.map((d) => new Date(d)).sort((a, b) => a.getTime() - b.getTime())
  const weeks: { start: Date; end: Date; number: number }[] = []

  let weekStart = dates[0]
  let weekEnd = dates[0]
  let weekNum = 1

  for (let i = 1; i < dates.length; i++) {
    const gapDays = (dates[i].getTime() - weekEnd.getTime()) / (1000 * 60 * 60 * 24)
    if (gapDays <= 5) {
      weekEnd = dates[i]
    } else {
      weeks.push({ start: weekStart, end: weekEnd, number: weekNum++ })
      weekStart = dates[i]
      weekEnd = dates[i]
    }
  }
  weeks.push({ start: weekStart, end: weekEnd, number: weekNum })

  return weeks
}

function findCurrentWeekIndex(weeks: { start: Date; end: Date }[], today: Date): number {
  for (let i = 0; i < weeks.length; i++) {
    if (today <= weeks[i].end) return i
  }
  return weeks.length - 1
}

// --- Data transformers ---

// Convert American odds to European decimal odds
function americanToDecimal(american: string): number {
  const num = parseInt(american)
  if (isNaN(num)) return 0
  if (num > 0) return Math.round(((num / 100) + 1) * 100) / 100
  return Math.round(((100 / Math.abs(num)) + 1) * 100) / 100
}

function extractOdds(comp: ESPNEvent['competitions'][0]): Odds | undefined {
  const oddsData = comp.odds?.[0]
  if (!oddsData?.moneyline) return undefined

  const home = oddsData.moneyline.home?.close?.odds
  const draw = oddsData.moneyline.draw?.close?.odds
  const away = oddsData.moneyline.away?.close?.odds

  if (!home || !draw || !away) return undefined

  return {
    home: americanToDecimal(home),
    draw: americanToDecimal(draw),
    away: americanToDecimal(away),
  }
}

function getTeamLogo(team: ESPNTeam): string {
  if (team.logo) return team.logo
  if (team.logos?.[0]?.href) return team.logos[0].href
  return `https://a.espncdn.com/i/teamlogos/soccer/500/${team.id}.png`
}

function transformEvent(event: ESPNEvent): Match {
  const comp = event.competitions[0]
  const home = comp.competitors.find((c) => c.homeAway === 'home')!
  const away = comp.competitors.find((c) => c.homeAway === 'away')!

  const statusName = comp.status.type.name
  const state = comp.status.type.state
  let status: Match['status'] = 'scheduled'
  if (comp.status.type.completed || statusName === 'STATUS_FULL_TIME' || statusName === 'STATUS_FINAL') {
    status = 'finished'
  } else if (state === 'in') {
    status = 'live'
  }

  return {
    id: event.id,
    homeTeam: {
      id: home.team.id,
      name: home.team.displayName,
      shortName: home.team.abbreviation,
      logo: getTeamLogo(home.team),
    },
    awayTeam: {
      id: away.team.id,
      name: away.team.displayName,
      shortName: away.team.abbreviation,
      logo: getTeamLogo(away.team),
    },
    date: event.date,
    status,
    score:
      status !== 'scheduled'
        ? { home: parseInt(home.score) || 0, away: parseInt(away.score) || 0 }
        : undefined,
    broadcasts: [
      { name: 'ESPN', type: 'tv' },
      { name: 'ESPN.nl', type: 'online', url: 'https://www.espn.nl' },
    ],
    odds: status === 'scheduled' ? extractOdds(comp) : undefined,
  }
}

function transformStandings(data: ESPNStandingsResponse): StandingEntry[] {
  const entries = data.children?.[0]?.standings?.entries ?? []

  return entries
    .map((entry) => {
      const stat = (name: string) => entry.stats.find((s) => s.name === name)?.value ?? 0

      return {
        position: 0, // assigned after sorting
        club: {
          id: entry.team.id,
          name: entry.team.displayName,
          shortName: entry.team.abbreviation,
          logo: getTeamLogo(entry.team),
        },
        played: stat('gamesPlayed'),
        won: stat('wins'),
        drawn: stat('ties'),
        lost: stat('losses'),
        goalsFor: stat('pointsFor'),
        goalsAgainst: stat('pointsAgainst'),
        points: stat('points'),
      }
    })
    .sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))
    .map((entry, i) => ({ ...entry, position: i + 1 }))
}

// --- Main fetch function ---

export async function fetchEredivisieData(): Promise<{
  matchweeks: Matchweek[]
  standings: StandingEntry[]
  allMatches: Match[]
}> {
  try {
    // 1. Fetch scoreboard to get calendar
    const calUrl = `${ESPN_API}/site/v2/sports/soccer/${LEAGUE}/scoreboard`
    const calRes = await fetch(calUrl, { next: { revalidate: REVALIDATE } })
    if (!calRes.ok) throw new Error('Failed to fetch calendar')
    const calData: ESPNScoreboardResponse = await calRes.json()

    const calendar = calData.leagues[0]?.calendar ?? []
    const weeks = groupCalendarIntoWeeks(calendar)

    // 2. Find current week and determine fetch range
    const today = new Date()
    const currentIdx = findCurrentWeekIndex(weeks, today)
    const startIdx = Math.max(0, currentIdx - 2)
    const endIdx = Math.min(weeks.length - 1, currentIdx + 2)

    // Extend date range by 1 day on each side for safety
    const rangeStart = new Date(weeks[startIdx].start)
    rangeStart.setDate(rangeStart.getDate() - 1)
    const rangeEnd = new Date(weeks[endIdx].end)
    rangeEnd.setDate(rangeEnd.getDate() + 1)

    // 3. Fetch matches for the range
    const matchUrl = `${ESPN_API}/site/v2/sports/soccer/${LEAGUE}/scoreboard?dates=${formatDateParam(rangeStart)}-${formatDateParam(rangeEnd)}&limit=200`
    const matchRes = await fetch(matchUrl, { next: { revalidate: REVALIDATE } })
    if (!matchRes.ok) throw new Error('Failed to fetch matches')
    const matchData: ESPNScoreboardResponse = await matchRes.json()

    const allMatches = matchData.events.map(transformEvent)

    // 4. Assign matches to matchweeks
    const matchweeks: Matchweek[] = []
    for (let i = startIdx; i <= endIdx; i++) {
      const week = weeks[i]
      const weekMatches = allMatches.filter((m) => {
        const matchDate = new Date(m.date)
        const dayBefore = new Date(week.start)
        dayBefore.setDate(dayBefore.getDate() - 1)
        const dayAfter = new Date(week.end)
        dayAfter.setDate(dayAfter.getDate() + 1)
        return matchDate >= dayBefore && matchDate <= dayAfter
      })

      if (weekMatches.length > 0) {
        matchweeks.push({
          number: week.number,
          matches: weekMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        })
      }
    }

    // 5. Fetch standings
    const standingsUrl = `${ESPN_API}/v2/sports/soccer/${LEAGUE}/standings`
    const standRes = await fetch(standingsUrl, { next: { revalidate: REVALIDATE } })
    const standings = standRes.ok ? transformStandings(await standRes.json()) : []

    return { matchweeks, standings, allMatches }
  } catch (error) {
    console.error('Failed to fetch Eredivisie data:', error)
    return { matchweeks: [], standings: [], allMatches: [] }
  }
}

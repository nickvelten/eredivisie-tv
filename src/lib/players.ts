import { Club, Player, PlayerPosition, PlayerStats } from '@/data/types'
import { fetchEredivisieData, slugify } from '@/lib/espn'

const ESPN_API = 'https://site.api.espn.com/apis'
const LEAGUE = 'ned.1'
const REVALIDATE = 3600 // rosters and season stats: 1 hour

interface ESPNStat {
  name: string
  value: number
}

interface ESPNAthlete {
  id: string
  slug?: string
  firstName?: string
  lastName?: string
  displayName: string
  age?: number
  dateOfBirth?: string
  height?: number // inches
  jersey?: string
  citizenship?: string
  flag?: { href?: string }
  headshot?: { href?: string }
  position?: { abbreviation?: string }
  statistics?: { splits?: { categories?: Array<{ name: string; stats: ESPNStat[] }> } }
}

const POSITIONS: Record<string, PlayerPosition> = {
  G: 'Keeper',
  D: 'Verdediger',
  M: 'Middenvelder',
  F: 'Aanvaller',
}

// ESPN reports nationality in English; the site is Dutch.
const COUNTRIES_NL: Record<string, string> = {
  Netherlands: 'Nederland',
  Belgium: 'België',
  Germany: 'Duitsland',
  France: 'Frankrijk',
  England: 'Engeland',
  Spain: 'Spanje',
  Portugal: 'Portugal',
  Italy: 'Italië',
  Denmark: 'Denemarken',
  Norway: 'Noorwegen',
  Sweden: 'Zweden',
  Finland: 'Finland',
  Iceland: 'IJsland',
  Austria: 'Oostenrijk',
  Switzerland: 'Zwitserland',
  Poland: 'Polen',
  'Czech Republic': 'Tsjechië',
  Czechia: 'Tsjechië',
  Slovakia: 'Slowakije',
  Croatia: 'Kroatië',
  Serbia: 'Servië',
  Slovenia: 'Slovenië',
  'Bosnia-Herzegovina': 'Bosnië en Herzegovina',
  Greece: 'Griekenland',
  Turkey: 'Turkije',
  Türkiye: 'Turkije',
  Ukraine: 'Oekraïne',
  Russia: 'Rusland',
  Georgia: 'Georgië',
  Morocco: 'Marokko',
  Algeria: 'Algerije',
  Tunisia: 'Tunesië',
  Egypt: 'Egypte',
  Ghana: 'Ghana',
  Nigeria: 'Nigeria',
  Senegal: 'Senegal',
  'Ivory Coast': 'Ivoorkust',
  "Cote d'Ivoire": 'Ivoorkust',
  Cameroon: 'Kameroen',
  Suriname: 'Suriname',
  Curacao: 'Curaçao',
  Curaçao: 'Curaçao',
  Japan: 'Japan',
  'South Korea': 'Zuid-Korea',
  'Korea Republic': 'Zuid-Korea',
  Australia: 'Australië',
  'United States': 'Verenigde Staten',
  USA: 'Verenigde Staten',
  Canada: 'Canada',
  Mexico: 'Mexico',
  Brazil: 'Brazilië',
  Argentina: 'Argentinië',
  Uruguay: 'Uruguay',
  Colombia: 'Colombia',
  Scotland: 'Schotland',
  Wales: 'Wales',
  Ireland: 'Ierland',
  'Republic of Ireland': 'Ierland',
  'Northern Ireland': 'Noord-Ierland',
  Luxembourg: 'Luxemburg',
  Albania: 'Albanië',
  Kosovo: 'Kosovo',
  'North Macedonia': 'Noord-Macedonië',
  Hungary: 'Hongarije',
  Romania: 'Roemenië',
  Bulgaria: 'Bulgarije',
  Israel: 'Israël',
  Indonesia: 'Indonesië',
  'Cape Verde': 'Kaapverdië',
  'Cape Verde Islands': 'Kaapverdië',
}

function stat(athlete: ESPNAthlete, category: string, name: string): number {
  const cat = athlete.statistics?.splits?.categories?.find((c) => c.name === category)
  return Math.round(cat?.stats.find((s) => s.name === name)?.value ?? 0)
}

function transformStats(a: ESPNAthlete): PlayerStats {
  return {
    appearances: stat(a, 'general', 'appearances'),
    subIns: stat(a, 'general', 'subIns'),
    goals: stat(a, 'offensive', 'totalGoals'),
    assists: stat(a, 'offensive', 'goalAssists'),
    shots: stat(a, 'offensive', 'totalShots'),
    shotsOnTarget: stat(a, 'offensive', 'shotsOnTarget'),
    yellowCards: stat(a, 'general', 'yellowCards'),
    redCards: stat(a, 'general', 'redCards'),
    saves: stat(a, 'goalKeeping', 'saves'),
    goalsConceded: stat(a, 'goalKeeping', 'goalsConceded'),
  }
}

function transformAthlete(a: ESPNAthlete, club: Club): Player {
  return {
    id: a.id,
    slug: a.slug || slugify(a.displayName),
    name: a.displayName,
    firstName: a.firstName,
    lastName: a.lastName,
    club,
    jersey: a.jersey,
    position: POSITIONS[a.position?.abbreviation ?? ''] ?? 'Speler',
    age: a.age,
    dateOfBirth: a.dateOfBirth,
    nationality: a.citizenship ? COUNTRIES_NL[a.citizenship] ?? a.citizenship : undefined,
    flag: a.flag?.href,
    headshot: a.headshot?.href,
    heightCm: a.height ? Math.round(a.height * 2.54) : undefined,
    stats: transformStats(a),
  }
}

async function fetchRoster(club: Club): Promise<Player[]> {
  try {
    const res = await fetch(`${ESPN_API}/site/v2/sports/soccer/${LEAGUE}/teams/${club.id}/roster`, {
      next: { revalidate: REVALIDATE },
    })
    if (!res.ok) return []
    const data: { athletes?: ESPNAthlete[] } = await res.json()
    return (data.athletes ?? []).map((a) => transformAthlete(a, club))
  } catch (error) {
    console.error(`ESPN roster failed for ${club.name}:`, error)
    return []
  }
}

const POSITION_ORDER: PlayerPosition[] = ['Keeper', 'Verdediger', 'Middenvelder', 'Aanvaller', 'Speler']

/** Every Eredivisie player with season stats. Slugs are made unique across the league. */
export async function fetchAllPlayers(): Promise<Player[]> {
  const { clubs } = await fetchEredivisieData()
  const rosters = await Promise.all(clubs.map(fetchRoster))
  const players = rosters.flat()

  const counts = new Map<string, number>()
  for (const p of players) counts.set(p.slug, (counts.get(p.slug) ?? 0) + 1)
  for (const p of players) if ((counts.get(p.slug) ?? 0) > 1) p.slug = `${p.slug}-${p.id}`

  return players
}

export function sortSquad(players: Player[]): Player[] {
  return [...players].sort(
    (a, b) =>
      POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position) ||
      (parseInt(a.jersey ?? '99') || 99) - (parseInt(b.jersey ?? '99') || 99) ||
      a.name.localeCompare(b.name, 'nl')
  )
}

export async function findPlayer(slug: string): Promise<{ player: Player; players: Player[] } | null> {
  const players = await fetchAllPlayers()
  const player = players.find((p) => p.slug === slug)
  return player ? { player, players } : null
}

export async function playersByClub(clubId: string): Promise<Player[]> {
  return sortSquad((await fetchAllPlayers()).filter((p) => p.club.id === clubId))
}

/** Map from ESPN athlete id to player slug, for linking leaders and match events. */
export async function playerSlugMap(): Promise<Map<string, string>> {
  return new Map((await fetchAllPlayers()).map((p) => [p.id, p.slug]))
}

export const POSITION_GROUPS = POSITION_ORDER

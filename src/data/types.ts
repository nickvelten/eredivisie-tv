export type Club = {
  id: string
  name: string
  shortName: string
  logo: string
}

export type Broadcast = {
  name: string
  type: 'tv' | 'online' | 'app'
  url?: string
}

export type Odds = {
  home: number // decimal odds, e.g. 1.53
  draw: number
  away: number
}

export type Match = {
  id: string
  homeTeam: Club
  awayTeam: Club
  date: string
  status: 'scheduled' | 'live' | 'finished'
  score?: { home: number; away: number }
  broadcasts: Broadcast[]
  odds?: Odds
}

export type Matchweek = {
  number: number
  matches: Match[]
}

export type StandingEntry = {
  position: number
  club: Club
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export type Provider = {
  name: string
  logo: string
  price: string
  description: string
  url: string
  channels: string[]
}

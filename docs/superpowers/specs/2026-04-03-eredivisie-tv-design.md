# eredivisie.tv — Design Spec

## Overview

Single-page Next.js app showing the full Eredivisie match schedule with TV/streaming info. Dark theme in official Eredivisie style with the real Eredivisie logo.

## Sections (top to bottom)

### 1. Header
- Official Eredivisie logo (SVG from eredivisie.nl)
- Site title "eredivisie.tv"
- Anchor navigation: Vandaag, Programma, Stand, Providers
- Sticky header on scroll

### 2. "Vandaag op TV" Highlight
- Prominent hero section showing today's/tonight's matches
- Red "LIVE" badge for matches currently in progress
- Shows kickoff time + TV channel directly
- If no matches today, show next upcoming match with countdown or date

### 3. Match Schedule (main section)
- **Layout**: Matchweek-centered with day grouping (option C)
- **Navigation**: Previous/next matchweek arrows + matchweek number
- **Per day**: Date header in red, matches listed below
- **Match card** (option B — two layers):
  - Top row: Home club (with logo) — Away club (with logo) + kickoff time
  - Bottom row: "Kijk op:" label + colored badges for viewing options
    - TV channels: green badge (e.g., "📺 ESPN 1")
    - Online streaming: blue badge (e.g., "💻 ESPN.nl")
    - App streaming: purple badge (e.g., "📱 Ziggo GO")
  - Played matches show final score instead of kickoff time

### 4. Eredivisie Stand (table)
- Classic league table: position, club logo + name, matches played, W/D/L, goal difference, points
- Highlight top positions (Champions League, Europa League, Conference League, relegation)
- 18 clubs

### 5. Providers Page
- Cards per provider: Ziggo, KPN, Odido, T-Mobile, Canal Digitaal, etc.
- Per provider: what's included, monthly price, link to subscription page
- Brief intro explaining ESPN is the main Eredivisie broadcaster

## Data Model

All data lives in `/src/data/` as TypeScript files with typed exports.

### Types (`/src/data/types.ts`)
```ts
type Club = { id: string; name: string; shortName: string; logo: string }
type Match = {
  id: string
  homeTeam: Club
  awayTeam: Club
  date: string // ISO datetime
  status: 'scheduled' | 'live' | 'finished'
  score?: { home: number; away: number }
  broadcasts: Broadcast[]
}
type Broadcast = {
  name: string
  type: 'tv' | 'online' | 'app'
  url?: string
}
type Matchweek = { number: number; matches: Match[] }
type StandingEntry = {
  position: number; club: Club
  played: number; won: number; drawn: number; lost: number
  goalsFor: number; goalsAgainst: number; points: number
}
type Provider = {
  name: string; logo: string; price: string
  description: string; url: string; channels: string[]
}
```

### Data files
- `/src/data/clubs.ts` — all 18 Eredivisie clubs with logos
- `/src/data/matches.ts` — multiple matchweeks with realistic dummy data
- `/src/data/standings.ts` — current standings
- `/src/data/providers.ts` — TV/streaming providers

## Club Logos
Use official club logos via publicly accessible URLs or inline SVGs for the 18 Eredivisie 2024/25 clubs.

## Visual Style
- Background: #0a0a0a (near-black)
- Card background: #141414
- Card hover: #1a1a1a
- Accent red: #e01e36 (Eredivisie red)
- Text primary: #ffffff
- Text secondary: #888888
- TV badge: bg-#1a3a1a text-#4ade80
- Online badge: bg-#1a2a4a text-#60a5fa
- App badge: bg-#2a1a3a text-#c084fc
- Font: Geist (already configured)
- Responsive: mobile-first, single column on mobile, max-width container on desktop

## Tech Stack
- Next.js 16 + TypeScript + Tailwind CSS 4
- Static data (no API, no database)
- Single page with scroll sections and anchor navigation
- Official Eredivisie logo (SVG)
- Club logos as images

## Out of Scope (for now)
- Real API integration (football-data.org)
- Live score updates
- User accounts / preferences
- Search functionality
- Match detail pages

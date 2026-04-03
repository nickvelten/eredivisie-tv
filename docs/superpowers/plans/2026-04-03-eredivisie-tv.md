# eredivisie.tv Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Eredivisie match schedule site with TV/streaming info, standings, and provider overview.

**Architecture:** Static data in TypeScript files, rendered as a single scrollable page with anchor navigation. Components for each section: header, today-highlight, match schedule, standings table, providers. Client interactivity only for matchweek navigation.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, Geist font (pre-configured)

---

## File Structure

```
src/
├── app/
│   ├── globals.css          — MODIFY: dark theme, custom colors
│   ├── layout.tsx           — MODIFY: metadata, lang="nl"
│   └── page.tsx             — MODIFY: compose all sections
├── components/
│   ├── Header.tsx           — sticky header with logo + nav
│   ├── TodayHighlight.tsx   — "vandaag op TV" hero section
│   ├── MatchSchedule.tsx    — matchweek navigator + match list (client component)
│   ├── MatchCard.tsx        — single match card (two-layer design)
│   ├── BroadcastBadge.tsx   — colored badge for TV/online/app
│   ├── Standings.tsx        — league table
│   └── Providers.tsx        — provider cards
├── data/
│   ├── types.ts             — all TypeScript types
│   ├── clubs.ts             — 18 Eredivisie clubs
│   ├── matches.ts           — matchweeks with dummy data
│   ├── standings.ts         — league standings
│   └── providers.ts         — TV/streaming providers
└── lib/
    └── utils.ts             — date formatting helpers
public/
└── eredivisie-logo.svg      — official Eredivisie logo
```

---

### Task 1: Data Types and Club Data

**Files:**
- Create: `src/data/types.ts`
- Create: `src/data/clubs.ts`

- [ ] **Step 1: Create types file**

```ts
// src/data/types.ts
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

export type Match = {
  id: string
  homeTeam: Club
  awayTeam: Club
  date: string
  status: 'scheduled' | 'live' | 'finished'
  score?: { home: number; away: number }
  broadcasts: Broadcast[]
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
```

- [ ] **Step 2: Create clubs data with all 18 Eredivisie 2024/25 clubs**

```ts
// src/data/clubs.ts
import { Club } from './types'

export const clubs: Record<string, Club> = {
  ajax: {
    id: 'ajax',
    name: 'Ajax',
    shortName: 'AJX',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/244/Logo.png',
  },
  feyenoord: {
    id: 'feyenoord',
    name: 'Feyenoord',
    shortName: 'FEY',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/247/Logo.png',
  },
  psv: {
    id: 'psv',
    name: 'PSV',
    shortName: 'PSV',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/246/Logo.png',
  },
  az: {
    id: 'az',
    name: 'AZ',
    shortName: 'AZ',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/249/Logo.png',
  },
  twente: {
    id: 'twente',
    name: 'FC Twente',
    shortName: 'TWE',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/251/Logo.png',
  },
  utrecht: {
    id: 'utrecht',
    name: 'FC Utrecht',
    shortName: 'UTR',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/253/Logo.png',
  },
  groningen: {
    id: 'groningen',
    name: 'FC Groningen',
    shortName: 'GRO',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/250/Logo.png',
  },
  heerenveen: {
    id: 'heerenveen',
    name: 'sc Heerenveen',
    shortName: 'HEE',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/252/Logo.png',
  },
  sparta: {
    id: 'sparta',
    name: 'Sparta Rotterdam',
    shortName: 'SPA',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/254/Logo.png',
  },
  nac: {
    id: 'nac',
    name: 'NAC Breda',
    shortName: 'NAC',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/255/Logo.png',
  },
  nec: {
    id: 'nec',
    name: 'NEC',
    shortName: 'NEC',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/256/Logo.png',
  },
  goahead: {
    id: 'goahead',
    name: 'Go Ahead Eagles',
    shortName: 'GAE',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/257/Logo.png',
  },
  heracles: {
    id: 'heracles',
    name: 'Heracles Almelo',
    shortName: 'HER',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/258/Logo.png',
  },
  almere: {
    id: 'almere',
    name: 'Almere City FC',
    shortName: 'ALM',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/259/Logo.png',
  },
  waalwijk: {
    id: 'waalwijk',
    name: 'RKC Waalwijk',
    shortName: 'RKC',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/260/Logo.png',
  },
  fortuna: {
    id: 'fortuna',
    name: 'Fortuna Sittard',
    shortName: 'FOR',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/261/Logo.png',
  },
  pec: {
    id: 'pec',
    name: 'PEC Zwolle',
    shortName: 'PEC',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/262/Logo.png',
  },
  willem: {
    id: 'willem',
    name: 'Willem II',
    shortName: 'WIL',
    logo: 'https://www.eredivisie.nl/cdn-cgi/image/format=auto,width=64/https://images.eredivisie.nl/Eredivisie%20Images/Logos/Clubs/263/Logo.png',
  },
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data/types.ts src/data/clubs.ts
git commit -m "feat: add data types and club data for 18 Eredivisie clubs"
```

---

### Task 2: Match Data, Standings, and Providers

**Files:**
- Create: `src/data/matches.ts`
- Create: `src/data/standings.ts`
- Create: `src/data/providers.ts`

- [ ] **Step 1: Create match data with 3 matchweeks (27, 28, 29)**

Create `src/data/matches.ts` with realistic dummy data. Each matchweek has 9 matches (18 clubs / 2). Use realistic dates around current date (April 2026). Mix of `finished`, `scheduled`, and one `live` status. Each match has 1-3 broadcast entries. Matchweek 27 = all finished with scores. Matchweek 28 = mix (some today). Matchweek 29 = all scheduled.

Broadcasts should use real Dutch providers:
- TV: ESPN 1, ESPN 2, ESPN 3, ESPN 4, ESPN Extra
- Online: ESPN.nl (url: https://www.espn.nl), Ziggo GO (url: https://www.ziggogo.tv)
- App: ESPN App (url: https://www.espn.nl/app)

- [ ] **Step 2: Create standings data**

Create `src/data/standings.ts` with realistic 2024/25 standings for all 18 clubs. PSV top, followed by Ajax, Feyenoord, AZ, Twente in top 5. Realistic points/goals.

- [ ] **Step 3: Create providers data**

Create `src/data/providers.ts` with Dutch TV/streaming providers:
- Ziggo Sport: ESPN channels included, €14.95/month extra, https://www.ziggo.nl/televisie/sport
- KPN: ESPN via iTV, €15.95/month, https://www.kpn.com/televisie/espn.htm
- Odido (T-Mobile): ESPN via TV pakket, €14.95/month, https://www.odido.nl/televisie/espn
- Canal Digitaal: ESPN, €15.95/month, https://www.canaldigitaal.nl/televisie/espn
- ESPN.nl: Direct streaming, €16.99/month, https://www.espn.nl
- Ziggo GO: Streaming voor Ziggo klanten, bij abonnement, https://www.ziggogo.tv

- [ ] **Step 4: Commit**

```bash
git add src/data/matches.ts src/data/standings.ts src/data/providers.ts
git commit -m "feat: add match schedule, standings, and provider data"
```

---

### Task 3: Utility Functions and Global Styles

**Files:**
- Create: `src/lib/utils.ts`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create date formatting utils**

```ts
// src/lib/utils.ts
const DUTCH_DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
const DUTCH_MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']

export function formatDutchDate(dateStr: string): string {
  const date = new Date(dateStr)
  const day = DUTCH_DAYS[date.getDay()]
  const num = date.getDate()
  const month = DUTCH_MONTHS[date.getMonth()]
  return `${day} ${num} ${month}`
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

export function groupMatchesByDate(matches: { date: string }[]): Map<string, typeof matches> {
  const groups = new Map<string, typeof matches>()
  for (const match of matches) {
    const key = new Date(match.date).toISOString().split('T')[0]
    const existing = groups.get(key) ?? []
    existing.push(match)
    groups.set(key, existing)
  }
  return groups
}

export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  return date.toISOString().split('T')[0] === now.toISOString().split('T')[0]
}
```

- [ ] **Step 2: Update globals.css for dark Eredivisie theme**

Replace `src/app/globals.css` with forced dark theme (no light mode). Set background to #0a0a0a, foreground to #ededed. Remove the `prefers-color-scheme` media query. Keep @import tailwindcss and @theme inline.

- [ ] **Step 3: Update layout.tsx**

Change `lang="en"` to `lang="nl"`. Update metadata title to "Eredivisie.tv — Wedstrijden & TV Gids" and description to "Bekijk alle Eredivisie wedstrijden en ontdek waar je ze live kunt zien op TV en online." Set body background to `bg-[#0a0a0a]`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils.ts src/app/globals.css src/app/layout.tsx
git commit -m "feat: add utils, dark theme, and Dutch metadata"
```

---

### Task 4: Eredivisie Logo and Header Component

**Files:**
- Create: `public/eredivisie-logo.svg`
- Create: `src/components/Header.tsx`

- [ ] **Step 1: Download/create the Eredivisie logo**

Fetch the official Eredivisie logo SVG from the eredivisie.nl website and save to `public/eredivisie-logo.svg`. If not available as SVG, use the PNG from their CDN via `next/image`.

- [ ] **Step 2: Create Header component**

```tsx
// src/components/Header.tsx
import Image from 'next/image'

const navItems = [
  { label: 'Vandaag', href: '#vandaag' },
  { label: 'Programma', href: '#programma' },
  { label: 'Stand', href: '#stand' },
  { label: 'Providers', href: '#providers' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <a href="#" className="flex items-center gap-3">
          <Image
            src="/eredivisie-logo.svg"
            alt="Eredivisie"
            width={32}
            height={32}
          />
          <span className="text-lg font-bold text-white">
            eredivisie<span className="text-[#e01e36]">.tv</span>
          </span>
        </a>
        <nav className="flex gap-6">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add public/eredivisie-logo.svg src/components/Header.tsx
git commit -m "feat: add Eredivisie logo and sticky header"
```

---

### Task 5: BroadcastBadge and MatchCard Components

**Files:**
- Create: `src/components/BroadcastBadge.tsx`
- Create: `src/components/MatchCard.tsx`

- [ ] **Step 1: Create BroadcastBadge component**

```tsx
// src/components/BroadcastBadge.tsx
import { Broadcast } from '@/data/types'

const styles = {
  tv: 'bg-[#1a3a1a] text-[#4ade80]',
  online: 'bg-[#1a2a4a] text-[#60a5fa]',
  app: 'bg-[#2a1a3a] text-[#c084fc]',
}

const icons = {
  tv: '📺',
  online: '💻',
  app: '📱',
}

export function BroadcastBadge({ broadcast }: { broadcast: Broadcast }) {
  const inner = (
    <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${styles[broadcast.type]}`}>
      {icons[broadcast.type]} {broadcast.name}
    </span>
  )

  if (broadcast.url) {
    return (
      <a href={broadcast.url} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
        {inner}
      </a>
    )
  }
  return inner
}
```

- [ ] **Step 2: Create MatchCard component (two-layer design)**

```tsx
// src/components/MatchCard.tsx
import Image from 'next/image'
import { Match } from '@/data/types'
import { formatTime } from '@/lib/utils'
import { BroadcastBadge } from './BroadcastBadge'

export function MatchCard({ match }: { match: Match }) {
  return (
    <div className="rounded-xl bg-[#141414] transition-colors hover:bg-[#1a1a1a]">
      {/* Top row: teams + time/score */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Image src={match.homeTeam.logo} alt={match.homeTeam.name} width={28} height={28} className="rounded-full" />
          <span className="text-sm font-semibold text-white">{match.homeTeam.name}</span>
          <span className="text-xs text-zinc-500">—</span>
          <span className="text-sm font-semibold text-white">{match.awayTeam.name}</span>
          <Image src={match.awayTeam.logo} alt={match.awayTeam.name} width={28} height={28} className="rounded-full" />
        </div>
        <div className="text-right">
          {match.status === 'finished' && match.score ? (
            <span className="text-sm font-bold text-white">{match.score.home} - {match.score.away}</span>
          ) : match.status === 'live' ? (
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#e01e36] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Live</span>
              {match.score && <span className="text-sm font-bold text-white">{match.score.home} - {match.score.away}</span>}
            </div>
          ) : (
            <span className="text-sm font-semibold text-[#e01e36]">{formatTime(match.date)}</span>
          )}
        </div>
      </div>
      {/* Bottom row: broadcast badges */}
      {match.broadcasts.length > 0 && (
        <div className="flex items-center gap-2 border-t border-white/5 px-4 py-2.5">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500">Kijk op:</span>
          {match.broadcasts.map((b) => (
            <BroadcastBadge key={b.name} broadcast={b} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/BroadcastBadge.tsx src/components/MatchCard.tsx
git commit -m "feat: add MatchCard and BroadcastBadge components"
```

---

### Task 6: TodayHighlight Component

**Files:**
- Create: `src/components/TodayHighlight.tsx`

- [ ] **Step 1: Create TodayHighlight component**

Server component that finds today's matches across all matchweeks. If none today, shows next upcoming match. Uses MatchCard for rendering. Has a section id="vandaag".

```tsx
// src/components/TodayHighlight.tsx
import { matchweeks } from '@/data/matches'
import { isToday, formatDutchDate } from '@/lib/utils'
import { MatchCard } from './MatchCard'
import { Match } from '@/data/types'

export function TodayHighlight() {
  const allMatches = matchweeks.flatMap((mw) => mw.matches)
  const todayMatches = allMatches.filter((m) => isToday(m.date))

  let displayMatches: Match[]
  let title: string

  if (todayMatches.length > 0) {
    displayMatches = todayMatches
    title = 'Vandaag op TV'
  } else {
    const upcoming = allMatches
      .filter((m) => m.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    displayMatches = upcoming.slice(0, 3)
    title = displayMatches.length > 0
      ? `Eerstvolgende: ${formatDutchDate(displayMatches[0].date)}`
      : 'Geen wedstrijden gepland'
  }

  if (displayMatches.length === 0) return null

  return (
    <section id="vandaag" className="mx-auto w-full max-w-5xl px-4 py-8">
      <h2 className="mb-4 text-xl font-bold text-white">
        {title}
      </h2>
      <div className="flex flex-col gap-3">
        {displayMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TodayHighlight.tsx
git commit -m "feat: add TodayHighlight section"
```

---

### Task 7: MatchSchedule Component (Client Component)

**Files:**
- Create: `src/components/MatchSchedule.tsx`

- [ ] **Step 1: Create MatchSchedule client component**

This is the only client component — it needs `useState` for matchweek navigation. Shows matchweek number, previous/next arrows, and matches grouped by date.

```tsx
// src/components/MatchSchedule.tsx
'use client'

import { useState } from 'react'
import { matchweeks } from '@/data/matches'
import { formatDutchDate, groupMatchesByDate } from '@/lib/utils'
import { MatchCard } from './MatchCard'

export function MatchSchedule() {
  const [weekIndex, setWeekIndex] = useState(() => {
    // Default to the matchweek that has upcoming or live matches, else last one
    const idx = matchweeks.findIndex((mw) =>
      mw.matches.some((m) => m.status === 'scheduled' || m.status === 'live')
    )
    return idx >= 0 ? idx : matchweeks.length - 1
  })

  const week = matchweeks[weekIndex]
  const grouped = groupMatchesByDate(week.matches)

  return (
    <section id="programma" className="mx-auto w-full max-w-5xl px-4 py-8">
      {/* Matchweek header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setWeekIndex((i) => Math.max(0, i - 1))}
          disabled={weekIndex === 0}
          className="rounded-lg bg-[#141414] px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-[#1a1a1a] hover:text-white disabled:opacity-30"
        >
          ← Vorige
        </button>
        <h2 className="text-xl font-bold text-white">
          Speelronde {week.number}
        </h2>
        <button
          onClick={() => setWeekIndex((i) => Math.min(matchweeks.length - 1, i + 1))}
          disabled={weekIndex === matchweeks.length - 1}
          className="rounded-lg bg-[#141414] px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-[#1a1a1a] hover:text-white disabled:opacity-30"
        >
          Volgende →
        </button>
      </div>

      {/* Matches grouped by date */}
      <div className="flex flex-col gap-6">
        {Array.from(grouped.entries()).map(([dateKey, matches]) => (
          <div key={dateKey}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#e01e36]">
              {formatDutchDate(matches[0].date)}
            </h3>
            <div className="flex flex-col gap-2">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MatchSchedule.tsx
git commit -m "feat: add MatchSchedule with matchweek navigation"
```

---

### Task 8: Standings Component

**Files:**
- Create: `src/components/Standings.tsx`

- [ ] **Step 1: Create Standings component**

League table with position highlights: top 1 = Champions League (gold border), 2-3 = Europa League (blue), 4 = Conference League (green), bottom 2 = relegation (red).

```tsx
// src/components/Standings.tsx
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
      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500" /> Champions League</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Europa League</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Conference League</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Degradatie</span>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Standings.tsx
git commit -m "feat: add Standings league table"
```

---

### Task 9: Providers Component

**Files:**
- Create: `src/components/Providers.tsx`

- [ ] **Step 1: Create Providers component**

Cards for each provider showing name, description, price, channels, and link to subscribe.

```tsx
// src/components/Providers.tsx
import { providers } from '@/data/providers'

export function Providers() {
  return (
    <section id="providers" className="mx-auto w-full max-w-5xl px-4 py-8">
      <h2 className="mb-2 text-xl font-bold text-white">Waar kijk je de Eredivisie?</h2>
      <p className="mb-6 text-sm text-zinc-400">
        ESPN is de officiële uitzender van de Eredivisie. Je kunt ESPN ontvangen via verschillende providers.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <a
            key={provider.name}
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col justify-between rounded-xl bg-[#141414] p-5 transition-colors hover:bg-[#1a1a1a]"
          >
            <div>
              <h3 className="text-base font-semibold text-white">{provider.name}</h3>
              <p className="mt-1 text-sm text-zinc-400">{provider.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {provider.channels.map((ch) => (
                  <span key={ch} className="rounded bg-white/5 px-2 py-0.5 text-xs text-zinc-300">{ch}</span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-bold text-[#e01e36]">{provider.price}</span>
              <span className="text-xs text-zinc-500">Bekijk →</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Providers.tsx
git commit -m "feat: add Providers section with TV/streaming info"
```

---

### Task 10: Compose Page and Final Polish

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Compose all sections in page.tsx**

```tsx
// src/app/page.tsx
import { Header } from '@/components/Header'
import { TodayHighlight } from '@/components/TodayHighlight'
import { MatchSchedule } from '@/components/MatchSchedule'
import { Standings } from '@/components/Standings'
import { Providers } from '@/components/Providers'

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <TodayHighlight />
        <div className="mx-auto max-w-5xl px-4">
          <hr className="border-white/5" />
        </div>
        <MatchSchedule />
        <div className="mx-auto max-w-5xl px-4">
          <hr className="border-white/5" />
        </div>
        <Standings />
        <div className="mx-auto max-w-5xl px-4">
          <hr className="border-white/5" />
        </div>
        <Providers />
      </main>
      <footer className="border-t border-white/5 py-6 text-center text-xs text-zinc-500">
        eredivisie.tv — Niet officieel gelieerd aan de Eredivisie
      </footer>
    </>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: compose full page with all sections"
```

---

### Task 11: Deploy to Production

- [ ] **Step 1: Deploy**

```bash
vercel --prod
```

Expected: Deployment succeeds, live at https://eredivisie.tv

- [ ] **Step 2: Verify live site**

```bash
curl -s -o /dev/null -w "%{http_code}" https://eredivisie.tv
```

Expected: 200

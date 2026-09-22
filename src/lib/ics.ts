import { Match, Club } from '@/data/types'
import { SITE_URL, matchUrl } from './structured-data'

function icsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function fold(line: string): string {
  // RFC 5545: lines longer than 75 octets are folded with CRLF + space
  const out: string[] = []
  let rest = line
  while (rest.length > 73) {
    out.push(rest.slice(0, 73))
    rest = ' ' + rest.slice(73)
  }
  out.push(rest)
  return out.join('\r\n')
}

function matchEvent(match: Match): string[] {
  const start = new Date(match.date)
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  const tv = match.broadcasts.find((b) => b.type === 'tv')?.name ?? 'ESPN'
  const score = match.score ? ` (${match.score.home}-${match.score.away})` : ''
  const round = match.round ? `Speelronde ${match.round}` : 'Inhaalwedstrijd'
  const description = `${round} · Kijk op ${tv} en ESPN.nl\nMeer info: ${matchUrl(match)}`

  return [
    'BEGIN:VEVENT',
    `UID:match-${match.id}@eredivisie.tv`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    fold(`SUMMARY:${escape(`⚽ ${match.homeTeam.name} – ${match.awayTeam.name}${score}`)}`),
    fold(`DESCRIPTION:${escape(description)}`),
    fold(`LOCATION:${escape(match.venue ? `${match.venue}${match.city ? ', ' + match.city : ''}` : 'Eredivisie')}`),
    fold(`URL:${matchUrl(match)}`),
    'END:VEVENT',
  ]
}

function calendar(name: string, events: string[][]): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//eredivisie.tv//Eredivisie kalender//NL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    fold(`X-WR-CALNAME:${escape(name)}`),
    'X-WR-TIMEZONE:Europe/Amsterdam',
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    fold(`URL:${SITE_URL}`),
    ...events.flat(),
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}

export function matchCalendar(match: Match): string {
  return calendar(`${match.homeTeam.name} – ${match.awayTeam.name}`, [matchEvent(match)])
}

export function clubCalendar(club: Club, matches: Match[]): string {
  const clubMatches = matches
    .filter((m) => m.homeTeam.id === club.id || m.awayTeam.id === club.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  return calendar(`${club.name} · Eredivisie`, clubMatches.map(matchEvent))
}

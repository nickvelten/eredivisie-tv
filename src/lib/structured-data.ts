import { Match } from '@/data/types'

export const SITE_URL = 'https://eredivisie.tv'

export function matchUrl(match: Match): string {
  return `${SITE_URL}/wedstrijd/${match.id}`
}

/** schema.org SportsEvent plus a BroadcastEvent pointing at ESPN. */
export function matchStructuredData(match: Match) {
  const id = `${matchUrl(match)}#event`
  const tv = match.broadcasts.find((b) => b.type === 'tv')

  const event: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    '@id': id,
    name: `${match.homeTeam.name} – ${match.awayTeam.name}`,
    url: matchUrl(match),
    startDate: match.date,
    sport: 'Soccer',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    homeTeam: { '@type': 'SportsTeam', name: match.homeTeam.name, logo: match.homeTeam.logo },
    awayTeam: { '@type': 'SportsTeam', name: match.awayTeam.name, logo: match.awayTeam.logo },
    competitor: [
      { '@type': 'SportsTeam', name: match.homeTeam.name },
      { '@type': 'SportsTeam', name: match.awayTeam.name },
    ],
    organizer: { '@type': 'SportsOrganization', name: 'Eredivisie', url: 'https://eredivisie.nl' },
    location: {
      '@type': 'Place',
      name: match.venue ?? 'Eredivisie',
      address: match.city ? { '@type': 'PostalAddress', addressLocality: match.city, addressCountry: 'NL' } : undefined,
    },
    offers: {
      '@type': 'Offer',
      name: `Kijk live op ${tv?.name ?? 'ESPN'}`,
      url: 'https://www.espn.nl',
      availability: 'https://schema.org/InStock',
    },
  }

  const broadcast = {
    '@context': 'https://schema.org',
    '@type': 'BroadcastEvent',
    name: `${match.homeTeam.name} – ${match.awayTeam.name} op ${tv?.name ?? 'ESPN'}`,
    isLiveBroadcast: true,
    startDate: match.date,
    broadcastOfEvent: { '@id': id },
    videoFormat: 'HD',
    publishedOn: { '@type': 'BroadcastService', name: tv?.name ?? 'ESPN', broadcaster: { '@type': 'Organization', name: 'ESPN Nederland' } },
  }

  return [event, broadcast]
}

import { Match, Player } from '@/data/types'

export const SITE_URL = 'https://eredivisie.tv'

export function matchUrl(match: Match): string {
  return `${SITE_URL}/wedstrijd/${match.slug}`
}

export function websiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Eredivisie.tv',
    url: SITE_URL,
    description:
      'Welke Eredivisie-wedstrijd is vandaag op TV en op welke zender? Programma, uitslagen, stand, topscorers en spelers.',
    inLanguage: 'nl-NL',
    publisher: { '@type': 'Organization', name: 'Eredivisie.tv', url: SITE_URL, logo: `${SITE_URL}/icon.svg` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/zoeken?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

const EVENT_STATUS: Record<Match['status'], string> = {
  scheduled: 'https://schema.org/EventScheduled',
  live: 'https://schema.org/EventScheduled',
  finished: 'https://schema.org/EventCompleted',
}

/** schema.org SportsEvent plus a BroadcastEvent for the ESPN channel. */
export function matchStructuredData(match: Match) {
  const id = `${matchUrl(match)}#event`
  const tv = match.broadcasts.find((b) => b.type === 'tv')
  const name = `${match.homeTeam.name} – ${match.awayTeam.name}`
  // Matches last about two hours including half-time
  const endDate = new Date(new Date(match.date).getTime() + 115 * 60_000).toISOString()

  const event: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    '@id': id,
    name,
    description:
      match.status === 'finished' && match.score
        ? `Eredivisie: ${name} eindigde in ${match.score.home}-${match.score.away}.`
        : `Eredivisie: ${name}, live op ${tv?.name ?? 'ESPN'} en ESPN.nl.`,
    url: matchUrl(match),
    startDate: match.date,
    endDate,
    sport: 'Soccer',
    eventStatus: EVENT_STATUS[match.status],
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    homeTeam: { '@type': 'SportsTeam', name: match.homeTeam.name, logo: match.homeTeam.logo, url: `${SITE_URL}/club/${match.homeTeam.slug}` },
    awayTeam: { '@type': 'SportsTeam', name: match.awayTeam.name, logo: match.awayTeam.logo, url: `${SITE_URL}/club/${match.awayTeam.slug}` },
    competitor: [
      { '@type': 'SportsTeam', name: match.homeTeam.name },
      { '@type': 'SportsTeam', name: match.awayTeam.name },
    ],
    image: [match.homeTeam.logo, match.awayTeam.logo],
    organizer: { '@type': 'SportsOrganization', name: 'Eredivisie', url: 'https://eredivisie.nl' },
    location: {
      '@type': 'Place',
      name: match.venue ?? 'Eredivisie',
      address: { '@type': 'PostalAddress', addressLocality: match.city ?? match.homeTeam.name, addressCountry: 'NL' },
    },
  }

  if (match.status !== 'scheduled' && match.score) {
    event.homeTeam = { ...(event.homeTeam as object), result: match.score.home }
    event.awayTeam = { ...(event.awayTeam as object), result: match.score.away }
  }

  if (match.status === 'finished') return [event]

  const broadcast = {
    '@context': 'https://schema.org',
    '@type': 'BroadcastEvent',
    name: `${name} op ${tv?.name ?? 'ESPN'}`,
    isLiveBroadcast: true,
    startDate: match.date,
    endDate,
    broadcastOfEvent: { '@id': id },
    videoFormat: 'HD',
    inLanguage: 'nl',
    publishedOn: {
      '@type': 'BroadcastService',
      name: tv?.name ?? 'ESPN',
      broadcaster: { '@type': 'Organization', name: 'ESPN Nederland', url: 'https://www.espn.nl' },
    },
  }

  return [event, broadcast]
}

export type FaqItem = { question: string; answer: string }

export function faqStructuredData(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function playerStructuredData(player: Player) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: player.name,
    givenName: player.firstName,
    familyName: player.lastName,
    url: `${SITE_URL}/speler/${player.slug}`,
    birthDate: player.dateOfBirth?.slice(0, 10),
    nationality: player.nationality ? { '@type': 'Country', name: player.nationality } : undefined,
    height: player.heightCm ? { '@type': 'QuantitativeValue', value: player.heightCm, unitCode: 'CMT' } : undefined,
    jobTitle: 'Profvoetballer',
    affiliation: { '@type': 'SportsTeam', name: player.club.name, url: `${SITE_URL}/club/${player.club.slug}` },
  }
}

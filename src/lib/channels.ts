export const CHANNELS = [
  { slug: 'espn-1', name: 'ESPN 1', blurb: 'het hoofdkanaal van ESPN, met de grootste wedstrijd van elk tijdslot' },
  { slug: 'espn-2', name: 'ESPN 2', blurb: 'het tweede kanaal, voor de tweede wedstrijd van een tijdslot' },
  { slug: 'espn-3', name: 'ESPN 3', blurb: 'het derde kanaal, ingezet als er drie wedstrijden tegelijk zijn' },
  { slug: 'espn-4', name: 'ESPN 4', blurb: 'het vierde kanaal, voor de overige wedstrijden op drukke speeldagen' },
] as const

export type Channel = (typeof CHANNELS)[number]

export function findChannel(slug: string): Channel | undefined {
  return CHANNELS.find((c) => c.slug === slug)
}

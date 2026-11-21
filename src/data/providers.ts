import { Provider } from './types'

/**
 * ESPN per provider. Prices change: update PRICES_CHECKED whenever they are
 * checked against the providers' own pages.
 *
 * Season 2026/27: ESPN does not sell a standalone subscription in the
 * Netherlands; you always watch through a TV provider. Online viewing is via
 * the ESPN Watch app (or the provider's own app) with that subscription.
 */
export const PRICES_CHECKED = 'november 2026'

export const providers: Provider[] = [
  {
    name: 'Ziggo',
    logo: '/providers/ziggo.svg',
    brandColor: '#FF6600',
    price: 'In elk tv-pakket',
    description: 'ESPN 1 t/m 4 zitten sinds juli 2026 in elk digitaal tv-pakket. ESPN Premium (€9,95/mnd) voegt Ziggo GO, Ultra HD en ESPN Watch toe.',
    url: 'https://www.ziggo.nl/televisie/extra-zenders-streamingdiensten/espn-premium',
    channels: ['ESPN 1', 'ESPN 2', 'ESPN 3', 'ESPN 4'],
  },
  {
    name: 'KPN',
    logo: '/providers/kpn.svg',
    brandColor: '#009900',
    price: '€14,99/mnd',
    description: 'ESPN Compleet via KPN TV+. Gratis als je het kiest als Combivoordeel.',
    url: 'https://www.kpn.com/entertainment/espn',
    channels: ['ESPN 1', 'ESPN 2', 'ESPN 3', 'ESPN 4'],
  },
  {
    name: 'Odido',
    logo: '/providers/odido.svg',
    brandColor: '#5A00FF',
    price: '€12,50/mnd',
    description: 'ESPN Compleet, maandelijks opzegbaar, inclusief ESPN Watch. Ook een dagpas van €6.',
    url: 'https://www.odido.nl/tv',
    channels: ['ESPN 1', 'ESPN 2', 'ESPN 3', 'ESPN 4'],
  },
  {
    name: 'Canal Digitaal',
    logo: '/providers/canal-digitaal.svg',
    brandColor: '#003DA5',
    price: '€14,95/mnd',
    description: 'ESPN Compleet via de schotel; ESPN 3 alleen in de app. Onderweg via de CANAL+ app.',
    url: 'https://www.canaldigitaal.nl/zenders',
    channels: ['ESPN 1', 'ESPN 2', 'ESPN 3', 'ESPN 4'],
  },
]

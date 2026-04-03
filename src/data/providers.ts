import { Provider } from './types'

export const providers: Provider[] = [
  {
    name: 'Ziggo Sport',
    logo: '',
    price: '€14,95/mnd',
    description: 'ESPN-kanalen inbegrepen bij Ziggo Sport pakket',
    url: 'https://www.ziggo.nl/televisie/sport',
    channels: ['ESPN 1', 'ESPN 2', 'ESPN 3', 'ESPN 4'],
  },
  {
    name: 'KPN',
    logo: '',
    price: '€15,95/mnd',
    description: 'ESPN ontvangen via KPN iTV',
    url: 'https://www.kpn.com/televisie/espn.htm',
    channels: ['ESPN 1', 'ESPN 2', 'ESPN 3', 'ESPN 4'],
  },
  {
    name: 'Odido',
    logo: '',
    price: '€14,95/mnd',
    description: 'ESPN via Odido TV pakket',
    url: 'https://www.odido.nl/televisie/espn',
    channels: ['ESPN 1', 'ESPN 2', 'ESPN 3'],
  },
  {
    name: 'Canal Digitaal',
    logo: '',
    price: '€15,95/mnd',
    description: 'ESPN via Canal Digitaal',
    url: 'https://www.canaldigitaal.nl/televisie/espn',
    channels: ['ESPN 1', 'ESPN 2', 'ESPN 3'],
  },
  {
    name: 'ESPN.nl',
    logo: '',
    price: '€16,99/mnd',
    description: 'Alle wedstrijden live streamen via ESPN.nl',
    url: 'https://www.espn.nl',
    channels: ['ESPN 1', 'ESPN 2', 'ESPN 3', 'ESPN 4', 'ESPN Extra'],
  },
  {
    name: 'Ziggo GO',
    logo: '',
    price: 'Bij abonnement',
    description: 'Gratis voor Ziggo klanten met Sport pakket',
    url: 'https://www.ziggogo.tv',
    channels: ['ESPN 1', 'ESPN 2', 'ESPN 3', 'ESPN 4'],
  },
]

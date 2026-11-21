import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Eredivisie.tv: wedstrijden, zenders en stand',
    short_name: 'Eredivisie.tv',
    description: 'Welke Eredivisie-wedstrijd is vandaag op TV, op welke zender, plus uitslagen en de stand.',
    start_url: '/?bron=app',
    scope: '/',
    display: 'standalone',
    background_color: '#f8f9fa',
    theme_color: '#002F63',
    lang: 'nl',
    categories: ['sports', 'news'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Vandaag op TV', url: '/eredivisie-op-tv-vandaag', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
      { name: 'Stand', url: '/stand', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
      { name: 'Programma', url: '/programma', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
    ],
  }
}

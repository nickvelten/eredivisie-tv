import { ogCard, OG_SIZE } from '@/lib/og'

export const alt = 'Eredivisie.tv: welke Eredivisie-wedstrijd is vandaag op TV?'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return ogCard({ eyebrow: 'Eredivisie op TV', title: 'Welke wedstrijd, welke zender, hoe laat?', subtitle: 'Programma, uitslagen en stand van de Eredivisie' })
}

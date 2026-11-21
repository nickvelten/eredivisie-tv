import type { Metadata } from 'next'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import { StandVariantPage, STAND_VARIANTS } from '@/components/StandVariantPage'
import { SITE_URL } from '@/lib/structured-data'

export const revalidate = 300

const v = STAND_VARIANTS.thuis
const title = `${v.title} | Eredivisie.tv`
const url = `${SITE_URL}/stand/thuis`

export const metadata: Metadata = {
  title,
  description: v.description,
  alternates: { canonical: url },
  openGraph: { title, description: v.description, url, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
}

export default function Page() {
  return <StandVariantPage variant="thuis" />
}

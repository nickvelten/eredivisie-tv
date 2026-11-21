import type { Metadata } from 'next'
import { SITE_URL } from './structured-data'

/**
 * The English edition covers six page types. Each maps one-to-one to a Dutch
 * page, which drives hreflang, the language switch and the "View in English" hint.
 */
const PAIRS: Array<[RegExp, (m: RegExpMatchArray) => string, RegExp, (m: RegExpMatchArray) => string]> = [
  [/^\/$/, () => '/en', /^\/en\/?$/, () => '/'],
  [/^\/programma\/?$/, () => '/en/fixtures', /^\/en\/fixtures\/?$/, () => '/programma'],
  [/^\/stand\/?$/, () => '/en/table', /^\/en\/table\/?$/, () => '/stand'],
  [/^\/topscorers\/?$/, () => '/en/top-scorers', /^\/en\/top-scorers\/?$/, () => '/topscorers'],
  [/^\/club\/([^/]+)\/?$/, (m) => `/en/club/${m[1]}`, /^\/en\/club\/([^/]+)\/?$/, (m) => `/club/${m[1]}`],
  [/^\/wedstrijd\/([^/]+)\/?$/, (m) => `/en/match/${m[1]}`, /^\/en\/match\/([^/]+)\/?$/, (m) => `/wedstrijd/${m[1]}`],
]

export function enPathFor(nlPath: string): string | null {
  for (const [nl, toEn] of PAIRS) {
    const m = nlPath.match(nl)
    if (m) return toEn(m)
  }
  return null
}

export function nlPathFor(enPath: string): string | null {
  for (const [, , en, toNl] of PAIRS) {
    const m = enPath.match(en)
    if (m) return toNl(m)
  }
  return null
}

/** hreflang block for a page that exists in both languages. Dutch is the default. */
export function languageAlternates(nlPath: string, enPath: string): NonNullable<Metadata['alternates']>['languages'] {
  const nl = `${SITE_URL}${nlPath === '/' ? '' : nlPath}`
  return { nl, en: `${SITE_URL}${enPath}`, 'x-default': nl }
}

const TZ = 'Europe/Amsterdam'

/** "Saturday 22 November" in Amsterdam time */
export function formatEnglishDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(dateStr))
}

/** "20:00" in Amsterdam time */
export function formatAmsTime(dateStr: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr))
}

export const EN_NAV = [
  { label: 'Home', href: '/en' },
  { label: 'Fixtures', href: '/en/fixtures' },
  { label: 'Table', href: '/en/table' },
  { label: 'Top scorers', href: '/en/top-scorers' },
]

/** Metadata for an English page and its Dutch twin. */
export function enMetadata({ title, description, enPath, nlPath }: { title: string; description: string; enPath: string; nlPath: string }): Metadata {
  const url = `${SITE_URL}${enPath}`
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(nlPath, enPath) },
    openGraph: { title, description, url, type: 'website', locale: 'en_GB', alternateLocale: ['nl_NL'], siteName: 'Eredivisie.tv', images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Eredivisie.tv' }] },
    twitter: { card: 'summary_large_image', title, description },
  }
}

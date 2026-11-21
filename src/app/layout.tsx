import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { fetchEredivisieData } from '@/lib/espn'
import { FAVORITE_COOKIE } from '@/lib/favorite-cookie'
import { clubTheme } from '@/lib/color'
import { ScrollReset } from '@/components/ScrollReset'
import { AnalyticsListener } from '@/components/AnalyticsListener'
import { ConsentBanner, CONSENT_DEFAULT_SCRIPT } from '@/components/ConsentBanner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1b23' },
  ],
}

export const metadata: Metadata = {
  appleWebApp: { capable: true, title: 'Eredivisie.tv', statusBarStyle: 'default' },
  metadataBase: new URL('https://eredivisie.tv'),
  title: 'Eredivisie op TV vandaag: wedstrijden, zenders & tijden | Eredivisie.tv',
  description:
    'Welke Eredivisie-wedstrijd is vandaag op TV en op welke zender? Alle aftraptijden, ESPN-zenders, uitslagen, de actuele stand en topscorers op één plek.',
  openGraph: {
    title: 'Eredivisie op TV vandaag: wedstrijden, zenders & tijden',
    description:
      'Welke Eredivisie-wedstrijd is vandaag op TV en op welke zender? Aftraptijden, uitslagen, stand en topscorers op één plek.',
    type: 'website',
    locale: 'nl_NL',
    siteName: 'Eredivisie.tv',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eredivisie op TV vandaag: wedstrijden, zenders & tijden',
    description: 'Welke Eredivisie-wedstrijd is vandaag op TV en op welke zender? Aftraptijden, uitslagen, stand en topscorers.',
  },
  // No canonical here: every indexable page sets its own, and an inherited
  // one would point 404s and other pages at the homepage.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  // Google Search Console: HTML-tag verification, set GOOGLE_SITE_VERIFICATION on Vercel
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
}

// Favourite-club colours are applied in the browser before first paint, so
// the server never reads cookies and every page can be cached (ISR). The map
// below comes from the cached ESPN data: club id -> slug + CSS variables.
function clubThemeScript(themes: Record<string, [string, string, string, string, string]>) {
  return `(function(){try{var d=document.documentElement,t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches))d.classList.add('dark');var m=document.cookie.match(/(?:^|; )${FAVORITE_COOKIE}=([^;]+)/),id=(m&&m[1])||localStorage.getItem('${FAVORITE_COOKIE}'),c=id&&${JSON.stringify(themes)}[id];if(c){d.dataset.club=c[0];d.style.setProperty('--club-color',c[1]);d.style.setProperty('--club-on',c[2]);d.style.setProperty('--club-accent',c[3]);d.style.setProperty('--club-accent-dark',c[4])}}catch(e){}})()`
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { clubs } = await fetchEredivisieData()
  const themes = Object.fromEntries(
    clubs.map((club) => {
      const t = clubTheme(club.color)
      return [club.id, [club.slug, t.base, t.onHero, t.accent, t.accentDark] as [string, string, string, string, string]]
    })
  )

  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: clubThemeScript(themes) }} />
        {process.env.NEXT_PUBLIC_GA_ID && <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }} />}
      </head>
      <body className="min-h-full flex flex-col bg-background">
        <ScrollReset />
        <AnalyticsListener />
        {children}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            <ConsentBanner />
          </>
        )}
      </body>
    </html>
  )
}

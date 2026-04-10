import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Eredivisie.tv — Wedstrijden & TV Gids | Eredivisie op TV',
  description:
    'Bekijk alle Eredivisie wedstrijden en ontdek waar je ze live kunt zien op TV en online. Compleet programma, uitslagen, stand en TV gids voor de Nederlandse Eredivisie.',
  keywords:
    'eredivisie, eredivisie tv, eredivisie op tv, voetbal op tv, eredivisie programma, eredivisie stand, eredivisie uitslagen, espn eredivisie, eredivisie live, eredivisie kijken',
  openGraph: {
    title: 'Eredivisie.tv — Wedstrijden & TV Gids',
    description:
      'Alle Eredivisie wedstrijden, uitslagen, stand en waar je ze kunt kijken op TV en online.',
    type: 'website',
    locale: 'nl_NL',
    url: 'https://eredivisie.tv',
    siteName: 'Eredivisie.tv',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eredivisie.tv — Wedstrijden & TV Gids',
    description: 'Alle Eredivisie wedstrijden en waar je ze kunt kijken op TV en online.',
  },
  alternates: {
    canonical: 'https://eredivisie.tv',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background">{children}</body>
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </html>
  )
}

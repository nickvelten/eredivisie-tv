import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { fetchEredivisieData } from '@/lib/espn'
import { fetchAllPlayers } from '@/lib/players'
import { SITE_URL } from '@/lib/structured-data'
import { OG_DEFAULT_IMAGES } from '@/lib/og'
import { Player, PlayerStats } from '@/data/types'

export const revalidate = 3600

const title = 'Eredivisie statistieken: goals, assists, kaarten en reddingen | Eredivisie.tv'
const description =
  'Alle spelersstatistieken van de Eredivisie dit seizoen: meeste doelpunten, assists, schoten op doel, gele en rode kaarten, invalbeurten en reddingen.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/statistieken` },
  openGraph: { title, description, url: `${SITE_URL}/statistieken`, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv', images: OG_DEFAULT_IMAGES },
}

const CATEGORIES: Array<{ id: string; title: string; stat: keyof PlayerStats; unit: string; keepersOnly?: boolean }> = [
  { id: 'doelpunten', title: 'Doelpunten', stat: 'goals', unit: 'goals' },
  { id: 'assists', title: 'Assists', stat: 'assists', unit: 'assists' },
  { id: 'schoten-op-doel', title: 'Schoten op doel', stat: 'shotsOnTarget', unit: 'op doel' },
  { id: 'reddingen', title: 'Reddingen (keepers)', stat: 'saves', unit: 'reddingen', keepersOnly: true },
  { id: 'gele-kaarten', title: 'Gele kaarten', stat: 'yellowCards', unit: 'geel' },
  { id: 'rode-kaarten', title: 'Rode kaarten', stat: 'redCards', unit: 'rood' },
  { id: 'invalbeurten', title: 'Invalbeurten', stat: 'subIns', unit: 'keer' },
  { id: 'wedstrijden', title: 'Meeste wedstrijden', stat: 'appearances', unit: 'wed.' },
]

function ranked(players: Player[], stat: keyof PlayerStats, keepersOnly = false, limit = 10) {
  return players
    .filter((p) => (!keepersOnly || p.position === 'Keeper') && p.stats[stat] > 0)
    .sort((a, b) => b.stats[stat] - a.stats[stat] || a.stats.appearances - b.stats.appearances)
    .slice(0, limit)
}

export default async function StatistiekenPage() {
  const [data, players] = await Promise.all([fetchEredivisieData(), fetchAllPlayers()])
  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Statistieken', href: '/statistieken' }]} sidebarOptions={{ hideScorers: true }}>
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie statistieken</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Ranglijsten op basis van de spelersstatistieken van dit seizoen. Bekijk ook de{' '}
        <Link href="/topscorers" className="font-semibold text-accent hover:underline">topscorers</Link> of{' '}
        <Link href="/vergelijk" className="font-semibold text-accent hover:underline">vergelijk twee spelers</Link>.
      </p>
      <nav aria-label="Categorieën" className="no-scrollbar mt-5 flex gap-1 overflow-x-auto">
        {CATEGORIES.map((c) => (
          <a key={c.id} href={`#${c.id}`} className="shrink-0 rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted ring-1 ring-border hover:text-accent">
            {c.title}
          </a>
        ))}
      </nav>
      <div className="grid gap-5 py-8 md:grid-cols-2">
        {CATEGORIES.map((c) => {
          const list = ranked(players, c.stat, c.keepersOnly)
          if (list.length === 0) return null
          return (
            <section key={c.id} id={c.id} className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border">
              <h2 className="border-b border-border px-4 py-3 text-sm font-extrabold text-foreground">{c.title}</h2>
              <ol>
                {list.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3 border-t border-border px-4 py-2 text-sm first:border-t-0">
                    <span className="w-5 font-bold tabular-nums text-muted">{i + 1}</span>
                    <Image src={p.club.logo} alt="" width={18} height={18} className="h-[18px] w-[18px] shrink-0" />
                    <Link href={`/speler/${p.slug}`} className="min-w-0 flex-1 truncate font-semibold text-foreground hover:text-accent">
                      {p.name}
                    </Link>
                    <span className="text-xs text-muted">{p.club.shortName}</span>
                    <span className="w-8 text-right font-extrabold tabular-nums text-foreground">{p.stats[c.stat]}</span>
                  </li>
                ))}
              </ol>
            </section>
          )
        })}
      </div>
    </PageShell>
  )
}

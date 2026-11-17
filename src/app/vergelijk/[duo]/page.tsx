import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { PageShell } from '@/components/PageShell'
import { PlayerAvatar } from '@/components/PlayerAvatar'
import { ComparePicker } from '@/components/ComparePicker'
import { fetchEredivisieData } from '@/lib/espn'
import { fetchAllPlayers } from '@/lib/players'
import { SITE_URL } from '@/lib/structured-data'
import { Player, PlayerStats } from '@/data/types'

type Params = { params: Promise<{ duo: string }> }

export const revalidate = 3600

export async function generateStaticParams() {
  return []
}

async function resolve(duo: string): Promise<[Player, Player] | null> {
  const [sa, sb] = duo.split('-vs-')
  if (!sa || !sb) return null
  const players = await fetchAllPlayers()
  const a = players.find((p) => p.slug === sa)
  const b = players.find((p) => p.slug === sb)
  return a && b && a.id !== b.id ? [a, b] : null
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { duo } = await params
  const pair = await resolve(duo)
  if (!pair) return { title: 'Vergelijking niet gevonden | Eredivisie.tv' }
  const [a, b] = pair
  const title = `${a.name} vs ${b.name}: statistieken vergeleken | Eredivisie.tv`
  const description = `${a.name} (${a.club.shortName}) en ${b.name} (${b.club.shortName}) naast elkaar: ${a.stats.goals} tegen ${b.stats.goals} doelpunten en ${a.stats.assists} tegen ${b.stats.assists} assists in de Eredivisie dit seizoen.`
  const url = `${SITE_URL}/vergelijk/${duo}`
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: 'website', locale: 'nl_NL', siteName: 'Eredivisie.tv' } }
}

const ROWS: Array<{ key: keyof PlayerStats; label: string; lowerIsBetter?: boolean }> = [
  { key: 'appearances', label: 'Wedstrijden' },
  { key: 'goals', label: 'Doelpunten' },
  { key: 'assists', label: 'Assists' },
  { key: 'shots', label: 'Schoten' },
  { key: 'shotsOnTarget', label: 'Schoten op doel' },
  { key: 'saves', label: 'Reddingen' },
  { key: 'subIns', label: 'Invalbeurten' },
  { key: 'yellowCards', label: 'Gele kaarten', lowerIsBetter: true },
  { key: 'redCards', label: 'Rode kaarten', lowerIsBetter: true },
]

export default async function CompareDuoPage({ params }: Params) {
  const { duo } = await params
  const pair = await resolve(duo)
  if (!pair) notFound()
  const canonical = [pair[0].slug, pair[1].slug].sort().join('-vs-')
  if (duo !== canonical) permanentRedirect(`/vergelijk/${canonical}`)
  const [a, b] = pair
  const data = await fetchEredivisieData()
  const perGame = (p: Player) => (p.stats.appearances ? ((p.stats.goals + p.stats.assists) / p.stats.appearances).toFixed(2) : '0.00')

  return (
    <PageShell
      data={data}
      breadcrumbs={[{ label: 'Vergelijken', href: '/vergelijk' }, { label: `${a.name} vs ${b.name}`, href: `/vergelijk/${duo}` }]}
      sidebarOptions={{ highlightClubIds: [a.club.id, b.club.id] }}
    >
      <h1 className="pt-6 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        {a.name} vs {b.name}
      </h1>
      <div className="mt-6 overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-border p-5">
          {[a, b].map((p, i) => (
            <Link key={p.id} href={`/speler/${p.slug}`} className={`flex flex-col items-center gap-2 text-center hover:text-accent ${i === 1 ? 'col-start-3' : ''}`}>
              <PlayerAvatar player={p} size={72} eager />
              <span className="text-sm font-extrabold text-foreground">{p.name}</span>
              <span className="text-xs text-muted">{p.position} · {p.club.shortName}</span>
            </Link>
          )).reduce<React.ReactNode[]>((acc, el, i) => (i === 1 ? [...acc, <span key="vs" className="text-xs font-bold uppercase text-muted-light">vs</span>, el] : [...acc, el]), [])}
        </div>
        {[...ROWS, { key: 'goals' as const, label: 'Goals + assists per wedstrijd', perGame: true }].map((r) => {
          const isPerGame = 'perGame' in r
          const va = isPerGame ? perGame(a) : a.stats[r.key]
          const vb = isPerGame ? perGame(b) : b.stats[r.key]
          const na = Number(va)
          const nb = Number(vb)
          const lower = 'lowerIsBetter' in r && r.lowerIsBetter
          const aWins = lower ? na < nb : na > nb
          const bWins = lower ? nb < na : nb > na
          return (
            <div key={r.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-border px-5 py-2.5 text-sm last:border-b-0">
              <span className={`text-center tabular-nums ${aWins ? 'font-extrabold text-accent' : 'text-foreground'}`}>{va}</span>
              <span className="text-center text-[11px] font-bold uppercase tracking-wider text-muted-light">{r.label}</span>
              <span className={`text-center tabular-nums ${bWins ? 'font-extrabold text-accent' : 'text-foreground'}`}>{vb}</span>
            </div>
          )
        })}
      </div>
      <section className="py-8">
        <h2 className="mb-3 text-lg font-extrabold text-foreground">Andere spelers vergelijken</h2>
        <ComparePicker initialA={a.name} />
      </section>
    </PageShell>
  )
}

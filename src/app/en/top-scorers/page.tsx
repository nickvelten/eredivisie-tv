import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { EnShell } from '@/components/en/EnShell'
import { fetchEredivisieData } from '@/lib/espn'
import { enMetadata } from '@/lib/i18n'
import { TopAssister, TopScorer } from '@/data/types'

export const revalidate = 300

export const metadata: Metadata = enMetadata({
  title: 'Eredivisie top scorers and assists | Eredivisie.tv',
  description: 'Who leads the Eredivisie scoring charts? Goals and assists per player this season, with their club.',
  enPath: '/en/top-scorers',
  nlPath: '/topscorers',
})

function Leaders({ title, rows, value, label }: { title: string; rows: Array<TopScorer | TopAssister>; value: (r: TopScorer | TopAssister) => number; label: string }) {
  if (rows.length === 0) return null
  return (
    <section className="pt-8">
      <h2 className="mb-4 text-2xl font-extrabold text-foreground">{title}</h2>
      <ol className="divide-y divide-border rounded-xl bg-card shadow-sm ring-1 ring-border">
        {rows.slice(0, 15).map((r) => (
          <li key={`${r.name}-${r.position}`} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <span className="w-6 tabular-nums text-muted">{r.position}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-foreground">{r.name}</span>
              {r.club && (
                <Link href={`/en/club/${r.club.slug}`} className="flex items-center gap-1.5 text-xs text-muted hover:text-accent">
                  <Image src={r.club.logo} alt="" width={14} height={14} className="h-3.5 w-3.5 object-contain" />
                  {r.club.shortName}
                </Link>
              )}
            </span>
            <span className="text-xs text-muted">{r.matches} apps</span>
            <span className="w-14 text-right font-extrabold tabular-nums text-foreground">
              {value(r)} <span className="text-xs font-semibold text-muted">{label}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default async function EnTopScorers() {
  const data = await fetchEredivisieData()
  const top = data.topScorers[0]
  return (
    <EnShell nlHref="/topscorers" active="/en/top-scorers">
      <h1 className="pt-6 text-3xl font-extrabold tracking-tight text-foreground">Eredivisie top scorers {data.leadersSeason?.label ?? ''}</h1>
      {top && (
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {top.name}{top.club ? ` (${top.club.name})` : ''} leads the scoring chart with {top.goals} goal{top.goals === 1 ? '' : 's'} in {top.matches} matches.
        </p>
      )}
      <Leaders title="Goals" rows={data.topScorers} value={(r) => (r as TopScorer).goals} label="goals" />
      <Leaders title="Assists" rows={data.topAssisters} value={(r) => (r as TopAssister).assists} label="ast" />
    </EnShell>
  )
}

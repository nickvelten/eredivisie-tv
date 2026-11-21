import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { EnShell } from '@/components/en/EnShell'
import { EnMatchList } from '@/components/en/EnMatchList'
import { EnTable } from '@/components/en/EnTable'
import { fetchEredivisieData, findClubBySlug } from '@/lib/espn'
import { enMetadata } from '@/lib/i18n'
import { FormResult } from '@/data/types'

type Params = { params: Promise<{ slug: string }> }

export const revalidate = 300

export async function generateStaticParams() {
  const { clubs } = await fetchEredivisieData()
  return clubs.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const result = await findClubBySlug(slug)
  if (!result) return { title: 'Club not found | Eredivisie.tv' }
  const { club } = result
  return enMetadata({
    title: `${club.name}: fixtures, results and TV channel | Eredivisie.tv`,
    description: `${club.name} in the Eredivisie: upcoming matches with kickoff times and ESPN channel, latest results, form and league position.`,
    enPath: `/en/club/${club.slug}`,
    nlPath: `/club/${club.slug}`,
  })
}

const FORM: Record<FormResult, { label: string; cls: string }> = {
  W: { label: 'W', cls: 'bg-emerald-500' },
  D: { label: 'D', cls: 'bg-amber-400' },
  L: { label: 'L', cls: 'bg-red-500' },
}

export default async function EnClub({ params }: Params) {
  const { slug } = await params
  const result = await findClubBySlug(slug)
  if (!result) notFound()
  const { club, data } = result
  if (club.slug !== slug) permanentRedirect(`/en/club/${club.slug}`)

  const own = data.allMatches.filter((m) => m.homeTeam.id === club.id || m.awayTeam.id === club.id)
  const upcoming = own.filter((m) => m.status !== 'finished').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)
  const results = own.filter((m) => m.status === 'finished').sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const entry = data.standings.find((s) => s.club.id === club.id)
  const idx = entry ? data.standings.indexOf(entry) : -1
  const around = idx >= 0 ? data.standings.slice(Math.max(0, Math.min(idx - 2, data.standings.length - 5)), Math.max(0, Math.min(idx - 2, data.standings.length - 5)) + 5) : []

  return (
    <EnShell nlHref={`/club/${club.slug}`}>
      <div className="flex items-center gap-4 pt-6">
        <Image src={club.logo} alt="" width={64} height={64} className="h-16 w-16 object-contain" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{club.name}</h1>
          {entry && (
            <p className="text-sm text-muted">
              {entry.position}
              {['th', 'st', 'nd', 'rd'][entry.position % 100 > 10 && entry.position % 100 < 14 ? 0 : entry.position % 10 < 4 ? entry.position % 10 : 0]} in the Eredivisie · {entry.points} points from {entry.played} matches
            </p>
          )}
        </div>
      </div>
      {entry?.form && entry.form.length > 0 && (
        <div className="flex items-center gap-1.5 pt-4" aria-label="Recent form">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted">Form</span>
          {entry.form.map((f, i) => (
            <span key={i} className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white ${FORM[f].cls}`}>{FORM[f].label}</span>
          ))}
        </div>
      )}
      {upcoming.length > 0 && (
        <section className="pt-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Upcoming matches</h2>
          <EnMatchList matches={upcoming} />
        </section>
      )}
      {results.length > 0 && (
        <section className="pt-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Latest results</h2>
          <EnMatchList matches={results} />
        </section>
      )}
      {around.length > 0 && (
        <section className="pt-8">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">League position</h2>
          <EnTable standings={data.standings} rows={around} highlight={club.id} />
          <p className="mt-3 text-sm">
            <Link href="/en/table" className="font-semibold text-accent hover:underline">Full table →</Link>
          </p>
        </section>
      )}
    </EnShell>
  )
}

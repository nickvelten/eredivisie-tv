import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { EnShell } from '@/components/en/EnShell'
import { KickoffTime } from '@/components/en/KickoffTime'
import { findMatch } from '@/lib/espn'
import { enMetadata, formatAmsTime, formatEnglishDate } from '@/lib/i18n'
import { MatchEvent } from '@/data/types'

type Params = { params: Promise<{ slug: string }> }

export const revalidate = 300

// Rendered on first request, then cached: no need to prebuild every match twice
export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const result = await findMatch(slug)
  if (!result) return { title: 'Match not found | Eredivisie.tv' }
  const { match } = result
  const name = `${match.homeTeam.name} vs ${match.awayTeam.name}`
  const tv = match.broadcasts.find((b) => b.type === 'tv')?.name ?? 'ESPN'
  const finished = match.status === 'finished' && match.score
  return enMetadata({
    title: finished
      ? `${name} ${match.score!.home}-${match.score!.away}: result and goalscorers | Eredivisie.tv`
      : `${name}: kickoff time and TV channel (${formatEnglishDate(match.date)}) | Eredivisie.tv`,
    description: finished
      ? `${name} finished ${match.score!.home}-${match.score!.away} on ${formatEnglishDate(match.date)}. Goalscorers and cards from the Eredivisie match.`
      : `Where to watch ${name}: ${formatEnglishDate(match.date)} at ${formatAmsTime(match.date)} Amsterdam time, live on ${tv} in the Netherlands.`,
    enPath: `/en/match/${match.slug}`,
    nlPath: `/wedstrijd/${match.slug}`,
  })
}

const EVENT_LABEL: Record<MatchEvent['type'], string> = { goal: '⚽', 'own-goal': '⚽ (o.g.)', penalty: '⚽ (pen.)', yellow: '🟨', red: '🟥' }

export default async function EnMatch({ params }: Params) {
  const { slug } = await params
  const result = await findMatch(slug)
  if (!result) notFound()
  const { match } = result
  if (slug !== match.slug) permanentRedirect(`/en/match/${match.slug}`)
  const tv = match.broadcasts.find((b) => b.type === 'tv')?.name ?? 'ESPN'
  const showScore = match.status !== 'scheduled' && match.score
  const events = (match.events ?? []).filter((e) => e.type !== 'yellow')

  return (
    <EnShell nlHref={`/wedstrijd/${match.slug}`}>
      <p className="pt-6 text-center text-xs font-semibold uppercase tracking-wide text-muted">
        {match.round ? `Matchday ${match.round}` : 'Eredivisie'} · {formatEnglishDate(match.date)}
      </p>
      <h1 className="mt-1 text-center text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
        {match.homeTeam.name} vs {match.awayTeam.name}
        {match.status === 'finished' && <span className="text-muted">: result</span>}
      </h1>
      <div className="mt-4 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border sm:p-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {[match.homeTeam, null, match.awayTeam].map((team, i) =>
            team ? (
              <Link key={team.id} href={`/en/club/${team.slug}`} className="flex flex-col items-center gap-2 text-center hover:text-accent">
                <Image src={team.logo} alt="" width={72} height={72} className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
                <span className="text-sm font-bold text-foreground sm:text-base">{team.shortName}</span>
              </Link>
            ) : (
              <div key={i} className="text-center">
                {showScore ? (
                  <span className="text-4xl font-extrabold tabular-nums text-foreground">{match.score!.home} – {match.score!.away}</span>
                ) : (
                  <span className="text-2xl font-extrabold tabular-nums text-foreground"><KickoffTime date={match.date} /></span>
                )}
                {match.status === 'live' && <span className="mt-1 block text-xs font-bold text-red-600">LIVE {match.clock}</span>}
                {match.status === 'finished' && <span className="mt-1 block text-xs font-semibold uppercase text-muted">Full time</span>}
              </div>
            )
          )}
        </div>
        <dl className="mt-6 grid gap-3 border-t border-border pt-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Kickoff</dt>
            <dd className="font-semibold text-foreground"><KickoffTime date={match.date} withZone /></dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">TV (Netherlands)</dt>
            <dd className="font-semibold text-foreground">{tv} · ESPN Watch app</dd>
          </div>
          {match.venue && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Stadium</dt>
              <dd className="font-semibold text-foreground">{match.venue}{match.city ? `, ${match.city}` : ''}</dd>
            </div>
          )}
        </dl>
      </div>
      {events.length > 0 && (
        <section className="pt-8">
          <h2 className="mb-4 text-xl font-extrabold text-foreground">Goals and red cards</h2>
          <ul className="divide-y divide-border rounded-xl bg-card shadow-sm ring-1 ring-border">
            {events.map((e, i) => (
              <li key={i} className={`flex gap-3 px-4 py-2.5 text-sm ${e.teamId === match.awayTeam.id ? 'flex-row-reverse text-right' : ''}`}>
                <span className="w-12 shrink-0 tabular-nums text-muted">{e.minute}</span>
                <span className="font-semibold text-foreground">{e.player}</span>
                <span>{EVENT_LABEL[e.type]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {match.status === 'scheduled' && (
        <p className="pt-6 text-xs text-muted">
          The channel is our expectation based on the table and time slot; ESPN confirms the line-up shortly before each round. Outside the Netherlands, check your local broadcaster.
        </p>
      )}
      <p className="pt-6 text-sm">
        <Link href={`/wedstrijd/${match.slug}`} hrefLang="nl" className="font-semibold text-accent hover:underline">Line-ups, stats and head-to-head (Dutch) →</Link>
      </p>
    </EnShell>
  )
}

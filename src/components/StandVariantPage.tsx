import Link from 'next/link'
import { PageShell } from './PageShell'
import { Standings } from './Standings'
import { StandTabs } from './StandTabs'
import { fetchEredivisieData } from '@/lib/espn'
import { computeTable, TableScope } from '@/lib/table'

export type StandVariant = 'thuis' | 'uit' | 'vorm'

export const STAND_VARIANTS: Record<StandVariant, { title: string; h1: string; intro: string; description: string; scope: TableScope; lastN?: number }> = {
  thuis: {
    title: 'Eredivisie thuisstand: wie is het sterkst in eigen huis?',
    h1: 'Eredivisie thuisstand',
    intro: 'De stand op basis van alleen thuiswedstrijden. Wie maakt van het eigen stadion een vesting?',
    description: 'De Eredivisie-stand op basis van alleen thuiswedstrijden: punten, doelsaldo en vorm van alle clubs in eigen huis.',
    scope: 'home',
  },
  uit: {
    title: 'Eredivisie uitstand: welke club haalt de meeste punten uit?',
    h1: 'Eredivisie uitstand',
    intro: 'De stand op basis van alleen uitwedstrijden. Welke clubs halen ook buiten de deur punten?',
    description: 'De Eredivisie-stand op basis van alleen uitwedstrijden: punten, doelsaldo en vorm van alle clubs.',
    scope: 'away',
  },
  vorm: {
    title: 'Eredivisie vormtabel: stand over de laatste 5 wedstrijden',
    h1: 'Eredivisie vormtabel',
    intro: 'De stand over de laatste vijf wedstrijden van elke club. Wie is in vorm, en wie zit in een dip?',
    description: 'De vormtabel van de Eredivisie: de stand over de laatste vijf wedstrijden per club.',
    scope: 'all',
    lastN: 5,
  },
}

export async function StandVariantPage({ variant }: { variant: StandVariant }) {
  const data = await fetchEredivisieData()
  const v = STAND_VARIANTS[variant]
  const table = computeTable(data.allMatches, data.clubs, { scope: v.scope, lastN: v.lastN })
  const top = table[0]
  const href = `/stand/${variant}`
  return (
    <PageShell data={data} breadcrumbs={[{ label: 'Stand', href: '/stand' }, { label: v.h1.replace('Eredivisie ', ''), href }]}>
      <StandTabs active={href} />
      <Standings standings={table} season={data.standingsSeason} title={v.h1} as="h1" zones={false} />
      <p className="-mt-4 pb-8 text-sm text-muted">
        {v.intro}
        {top && top.played > 0 && (
          <>
            {' '}
            <Link href={`/club/${top.club.slug}`} className="font-semibold text-accent hover:underline">{top.club.name}</Link> staat hier bovenaan met {top.points} punten uit {top.played} wedstrijden.
          </>
        )}{' '}
        Bekijk ook de <Link href="/stand" className="font-semibold text-accent hover:underline">officiële stand</Link>.
      </p>
    </PageShell>
  )
}

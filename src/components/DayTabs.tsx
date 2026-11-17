import Link from 'next/link'

const DAYS = [
  { label: 'Vandaag', href: '/eredivisie-op-tv-vandaag' },
  { label: 'Morgen', href: '/eredivisie-op-tv-morgen' },
  { label: 'Programma', href: '/programma' },
]

export function DayTabs({ active }: { active: string }) {
  return (
    <nav aria-label="Dag" className="flex gap-1 pt-5">
      {DAYS.map((d) => (
        <Link
          key={d.href}
          href={d.href}
          aria-current={d.href === active ? 'page' : undefined}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${d.href === active ? 'bg-accent text-white' : 'bg-card text-muted ring-1 ring-border hover:text-accent'}`}
        >
          {d.label}
        </Link>
      ))}
    </nav>
  )
}

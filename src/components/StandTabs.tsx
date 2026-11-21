import Link from 'next/link'

const TABS = [
  { label: 'Totaal', href: '/stand' },
  { label: 'Thuis', href: '/stand/thuis' },
  { label: 'Uit', href: '/stand/uit' },
  { label: 'Vorm', href: '/stand/vorm' },
  { label: 'Restprogramma', href: '/restprogramma' },
  { label: 'Calculator', href: '/standcalculator' },
]

export function StandTabs({ active }: { active: string }) {
  return (
    <nav aria-label="Standen" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pt-4">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={t.href === active ? 'page' : undefined}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${t.href === active ? 'bg-accent text-white' : 'bg-card text-muted ring-1 ring-border hover:text-accent'}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  )
}

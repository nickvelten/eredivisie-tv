import Link from 'next/link'
import type { SeasonOption } from '@/lib/espn'

/** Season tabs: the current season lives at `basePath`, earlier ones at `basePath/2025-26`. */
export function SeasonSwitch({ options, active, basePath }: { options: SeasonOption[]; active: number; basePath: string }) {
  return (
    <nav aria-label="Seizoen" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pt-5">
      {options.map((o) => {
        const isActive = o.year === active
        return (
          <Link
            key={o.year}
            href={o.isCurrent ? basePath : `${basePath}/${o.slug}`}
            aria-current={isActive ? 'page' : undefined}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              isActive ? 'bg-accent text-white' : 'bg-card text-muted ring-1 ring-border hover:text-accent'
            }`}
          >
            {o.label}
          </Link>
        )
      })}
    </nav>
  )
}

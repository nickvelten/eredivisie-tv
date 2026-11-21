'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFavoriteClub } from '@/lib/favorite-club'
import { TvIcon } from './Icons'

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

function TableIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
    </svg>
  )
}

/**
 * App-style tab bar on phones: the four things people come for, plus their
 * own club. Hidden from the sm breakpoint, where the header nav fits.
 */
export function BottomNav() {
  const pathname = usePathname()
  const { favorite } = useFavoriteClub()
  const clubHref = favorite ? `/club/${favorite.slug}` : '/clubs'

  const items = [
    { href: '/', label: 'Overzicht', icon: <HomeIcon /> },
    { href: '/eredivisie-op-tv-vandaag', label: 'Vandaag', icon: <TvIcon className="h-5 w-5" /> },
    { href: '/programma', label: 'Programma', icon: <CalendarIcon /> },
    { href: '/stand', label: 'Stand', icon: <TableIcon /> },
    {
      href: clubHref,
      label: favorite ? favorite.shortName : 'Mijn club',
      icon: favorite ? (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white p-px">
          <Image src={favorite.logo} alt="" width={18} height={18} className="h-full w-full object-contain" />
        </span>
      ) : (
        <HeartIcon />
      ),
    },
  ]

  return (
    <nav
      aria-label="Snelmenu"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${active ? 'text-accent' : 'text-muted'}`}
              >
                {item.icon}
                <span className="max-w-full truncate px-1">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

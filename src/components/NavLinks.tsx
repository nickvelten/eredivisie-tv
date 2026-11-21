'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export type NavItem = { label: string; href: string }

/** Page navigation with the active page highlighted; scrolls horizontally on small screens. */
export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const activeRef = useRef<HTMLAnchorElement>(null)

  // Keep the active item in view on narrow screens
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [pathname])

  return (
    <nav aria-label="Hoofdmenu" className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto py-1.5 [mask-image:linear-gradient(to_right,black_85%,transparent)] lg:[mask-image:none]">
      {items.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            ref={active ? activeRef : undefined}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active ? 'bg-accent-light font-semibold text-accent' : 'text-muted hover:bg-accent-light hover:text-accent'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

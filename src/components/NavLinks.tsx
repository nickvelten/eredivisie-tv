'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export type NavItem = { label: string; href: string }

const HEADER_OFFSET = 140 // sticky header height plus a little breathing room

function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    let raf = 0

    function update() {
      raf = 0
      let current: string | null = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top - HEADER_OFFSET <= 0) current = id
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (atBottom) current = ids[ids.length - 1] ?? current
      setActive(current)
    }

    function schedule() {
      if (!raf) raf = requestAnimationFrame(update)
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [ids])

  return active
}

export function NavLinks({ items, variant }: { items: NavItem[]; variant: 'desktop' | 'mobile' }) {
  const ids = useMemo(() => items.map((i) => i.href.replace('#', '')), [items])
  const active = useActiveSection(ids)
  const navRef = useRef<HTMLElement>(null)

  // Keep the active pill visible in the horizontally scrolling mobile nav
  useEffect(() => {
    if (variant !== 'mobile' || !active) return
    const link = navRef.current?.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`)
    link?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' })
  }, [active, variant])

  const base =
    variant === 'desktop'
      ? 'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors'
      : 'shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors'
  const navClass = variant === 'desktop' ? 'flex gap-1' : 'flex flex-1 gap-1 overflow-x-auto px-2 py-1.5'

  return (
    <nav ref={navRef} className={navClass} aria-label="Secties">
      {items.map((item) => {
        const isActive = item.href === `#${active}`
        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'true' : undefined}
            className={`${base} ${
              isActive
                ? 'bg-accent-light font-semibold text-accent'
                : 'text-muted hover:bg-accent-light hover:text-accent'
            }`}
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}

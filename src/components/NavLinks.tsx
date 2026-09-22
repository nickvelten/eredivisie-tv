'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { headerOffset } from './HeaderOffset'

export type NavItem = { label: string; href: string }

function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    let raf = 0

    function update() {
      raf = 0
      const offset = headerOffset() + 16
      let current: string | null = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top - offset <= 0) current = id
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

export function NavLinks({ items }: { items: NavItem[] }) {
  const ids = useMemo(() => items.map((i) => i.href.replace('#', '')), [items])
  const active = useActiveSection(ids)
  const navRef = useRef<HTMLElement>(null)

  // Keep the active pill visible when the nav scrolls horizontally (mobile).
  // Scroll the nav container itself; scrollIntoView would interrupt an
  // in-progress smooth scroll of the page after an anchor click.
  useEffect(() => {
    const nav = navRef.current
    if (!active || !nav) return
    const link = nav.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`)
    if (!link) return
    const left = link.offsetLeft - nav.offsetLeft
    const right = left + link.offsetWidth
    if (left < nav.scrollLeft) nav.scrollTo({ left: left - 8, behavior: 'smooth' })
    else if (right > nav.scrollLeft + nav.clientWidth) nav.scrollTo({ left: right - nav.clientWidth + 8, behavior: 'smooth' })
  }, [active])

  return (
    <nav ref={navRef} className="flex flex-1 gap-1 overflow-x-auto py-1.5" aria-label="Secties">
      {items.map((item) => {
        const isActive = item.href === `#${active}`
        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'true' : undefined}
            className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 ${
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

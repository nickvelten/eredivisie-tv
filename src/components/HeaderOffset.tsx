'use client'

import { useEffect } from 'react'

/**
 * Measures the sticky header and stores its height as `--header-h` on <html>. Used for scroll-padding so anchor links land just
 * below the header, and by the scroll-spy for the active nav item.
 */
export function HeaderOffset() {
  useEffect(() => {
    const header = document.querySelector('header')
    if (!header) return
    const root = document.documentElement

    function apply() {
      root.style.setProperty('--header-h', `${header!.offsetHeight}px`)
    }

    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  return null
}

export function headerOffset(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-h')
  const n = parseFloat(raw)
  return Number.isFinite(n) ? n : 128
}

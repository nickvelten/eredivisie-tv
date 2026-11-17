'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Starts every newly opened page at the top. Next.js only scrolls when the
 * first element of the new page is off-screen, which fails when a page starts
 * with an invisible element. Back/forward keeps the browser's restored
 * position, and links to an anchor (#...) are left alone.
 */
export function ScrollReset() {
  const pathname = usePathname()
  const isPop = useRef(false)
  const first = useRef(true)

  useEffect(() => {
    const onPop = () => {
      isPop.current = true
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (isPop.current) {
      isPop.current = false
      return
    }
    if (window.location.hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

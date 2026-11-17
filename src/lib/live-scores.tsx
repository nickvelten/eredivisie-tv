'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import type { Match } from '@/data/types'
import type { LiveUpdate } from '@/lib/espn'

const LiveContext = createContext<Record<string, LiveUpdate>>({})

const POLL_MS = 30_000
const WINDOW_BEFORE = 15 * 60_000 // start polling 15 minutes before kickoff
const WINDOW_AFTER = 135 * 60_000 // and stop about 2h15 after it

/**
 * Polls /api/live while a match is (about to be) in play, so scores, clock and
 * goals update without a reload. Pages themselves are cached for minutes.
 */
export function LiveScoresProvider({ kickoffs, children }: { kickoffs: string[]; children: ReactNode }) {
  const [updates, setUpdates] = useState<Record<string, LiveUpdate>>({})

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let stopped = false

    const inWindow = () => {
      const now = Date.now()
      return kickoffs.some((k) => {
        const t = new Date(k).getTime()
        return now >= t - WINDOW_BEFORE && now <= t + WINDOW_AFTER
      })
    }

    async function poll() {
      if (stopped) return
      if (inWindow() && document.visibilityState === 'visible') {
        try {
          const res = await fetch('/api/live', { cache: 'no-store' })
          if (res.ok) {
            const list: LiveUpdate[] = await res.json()
            setUpdates(Object.fromEntries(list.map((u) => [u.id, u])))
          }
        } catch {}
      }
      timer = setTimeout(poll, POLL_MS)
    }

    poll()
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        if (timer) clearTimeout(timer)
        poll()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      stopped = true
      if (timer) clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [kickoffs])

  return <LiveContext.Provider value={updates}>{children}</LiveContext.Provider>
}

/** The match with the latest live data applied, if any. */
export function useLiveMatch(match: Match): Match {
  const update = useContext(LiveContext)[match.id]
  if (!update) return match
  return { ...match, status: update.status, clock: update.clock, score: update.score ?? match.score, events: update.events ?? match.events }
}

export function useLiveUpdates(): Record<string, LiveUpdate> {
  return useContext(LiveContext)
}

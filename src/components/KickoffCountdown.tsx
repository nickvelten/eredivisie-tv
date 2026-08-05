'use client'

import { useEffect, useState } from 'react'

function countdownLabel(msLeft: number): string {
  const totalSec = Math.floor(msLeft / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  if (days > 0) return `${days}d ${hours}u ${minutes}m`
  if (hours > 0) return `${hours}u ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}

export function KickoffCountdown({ date }: { date: string }) {
  // Render nothing until mounted: the remaining time depends on the client's
  // clock, so rendering it on the server would cause a hydration mismatch.
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const initial = setTimeout(() => setNow(Date.now()), 0)
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => {
      clearTimeout(initial)
      clearInterval(id)
    }
  }, [])

  if (now === null) return null

  const msLeft = new Date(date).getTime() - now
  if (msLeft <= 0) return null

  return (
    <span className="mb-0.5 inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.06] px-3 py-0.5 text-xs font-semibold tabular-nums text-foreground">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      Aftrap over {countdownLabel(msLeft)}
    </span>
  )
}

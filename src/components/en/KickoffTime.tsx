'use client'

import { useEffect, useState } from 'react'

const AMS = 'Europe/Amsterdam'
const fmt = (date: string, timeZone: string) => new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' }).format(new Date(date))

/** Kickoff in Amsterdam time, plus the visitor's own time once known (only when it differs). */
export function KickoffTime({ date, withZone = false }: { date: string; withZone?: boolean }) {
  const [local, setLocal] = useState<string | null>(null)

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const own = fmt(date, tz)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the visitor's time zone is only known in the browser
      if (tz && own !== fmt(date, AMS)) setLocal(own)
    } catch {
      // Intl unavailable: Amsterdam time only
    }
  }, [date])

  return (
    <span>
      {fmt(date, AMS)}
      {withZone && <span className="text-muted"> CET</span>}
      {local && <span className="text-muted"> · {local} your time</span>}
    </span>
  )
}

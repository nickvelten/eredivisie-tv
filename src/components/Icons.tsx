import type { MatchEvent } from '@/data/types'

type IconProps = { className?: string }

/** One small icon set (24px grid, currentColor) instead of emoji, so icons look the same everywhere and in dark mode. */

export function TvIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="13" rx="2" />
      <path d="M8 2.5l4 3.5 4-3.5" />
    </svg>
  )
}

export function StadiumIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <ellipse cx="12" cy="9" rx="9" ry="4" />
      <path d="M3 9v6c0 2.2 4 4 9 4s9-1.8 9-4V9" />
      <path d="M12 13v6M7 12.5v5.8M17 12.5v5.8" />
    </svg>
  )
}

export function BallIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.5l4.3 3.1-1.6 5h-5.4l-1.6-5z" fill="currentColor" />
      <path d="M12 7.5V2.5M16.3 10.6l4.8-1.5M14.7 15.6l2.9 4.1M9.3 15.6l-2.9 4.1M7.7 10.6L2.9 9.1" />
    </svg>
  )
}

export function CardIcon({ color, className = 'h-3.5 w-2.5' }: IconProps & { color: 'yellow' | 'red' }) {
  return (
    <svg viewBox="0 0 10 14" className={className} aria-hidden="true">
      <rect x="0.5" y="0.5" width="9" height="13" rx="1.5" className={color === 'yellow' ? 'fill-amber-400' : 'fill-red-600'} />
    </svg>
  )
}

export function TrophyIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7 4h10v5a5 5 0 01-10 0V4z" />
      <path d="M7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3M12 14v4M8 21h8M9.5 18h5" />
    </svg>
  )
}

const EVENT_LABEL: Record<MatchEvent['type'], string> = {
  goal: 'Doelpunt',
  penalty: 'Doelpunt (penalty)',
  'own-goal': 'Eigen doelpunt',
  yellow: 'Gele kaart',
  red: 'Rode kaart',
}

/** Icon for a match event, with a text label for screen readers and a visible note for penalties and own goals. */
export function EventIcon({ type }: { type: MatchEvent['type'] }) {
  const icon =
    type === 'yellow' ? <CardIcon color="yellow" /> : type === 'red' ? <CardIcon color="red" /> : <BallIcon className={`h-3.5 w-3.5 ${type === 'own-goal' ? 'text-red-500' : 'text-foreground'}`} />
  return (
    <span className="inline-flex items-center gap-1 align-middle" title={EVENT_LABEL[type]}>
      {icon}
      <span className="sr-only">{EVENT_LABEL[type]}</span>
      {type === 'penalty' && <span className="text-xs text-muted">(pen.)</span>}
      {type === 'own-goal' && <span className="text-xs text-muted">(e.d.)</span>}
    </span>
  )
}

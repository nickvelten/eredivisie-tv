import { Odds } from '@/data/types'
import { BETTING_REL, BETTING_SLOGAN, BETTING_URL, SHOW_ODDS } from '@/lib/betting'

function UnibetMark({ size }: { size: 'sm' | 'md' }) {
  return (
    <span
      className={`rounded bg-[#FFE71F] font-extrabold text-[#00531D] ${
        size === 'sm' ? 'px-1 py-px text-[9px]' : 'px-1.5 py-0.5 text-[10px]'
      }`}
    >
      Unibet
    </span>
  )
}

function Price({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-[#FFE71F]">{label}</span>
      <span>{value.toFixed(2)}</span>
    </span>
  )
}

/**
 * Neutral 1-X-2 odds linking to the bookmaker, always with the 18+ notice.
 *
 * - `pill`: small, fits next to the channel badge in a match card
 * - `strip`: full-width band with the Unibet wordmark, used on some cards
 * - `large`: the match page version
 */
export function OddsBar({
  odds,
  variant = 'pill',
  className = '',
}: {
  odds: Odds
  variant?: 'pill' | 'strip' | 'large'
  className?: string
}) {
  if (!SHOW_ODDS) return null
  const common = {
    href: BETTING_URL,
    target: '_blank',
    rel: BETTING_REL,
    title: `Odds via Unibet · ${BETTING_SLOGAN}`,
    'data-event': 'odds_click',
    'data-event-label': variant,
  }

  if (variant === 'strip') {
    return (
      <a
        {...common}
        className={`flex items-center gap-2 bg-[#147B45] px-4 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#00531D] ${className}`}
      >
        <UnibetMark size="md" />
        <span className="hidden text-white min-[380px]:inline">Odds</span>
        <span className="ml-auto flex items-center gap-2.5">
          <Price label="1" value={odds.home} />
          <Price label="X" value={odds.draw} />
          <Price label="2" value={odds.away} />
        </span>
        <span className="text-[9px] font-semibold text-white">18+</span>
      </a>
    )
  }

  const large = variant === 'large'
  return (
    <a
      {...common}
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-[#147B45] font-bold text-white shadow-sm transition-all hover:bg-[#00531D] hover:shadow-md ${
        large ? 'gap-3 px-4 py-2 text-sm' : 'gap-1.5 px-2 py-1 text-[10px]'
      } ${className}`}
    >
      {large && <UnibetMark size="md" />}
      <Price label="1" value={odds.home} />
      <Price label="X" value={odds.draw} />
      <Price label="2" value={odds.away} />
      <span className={`font-semibold text-white ${large ? 'text-[10px]' : 'text-[8px]'}`}>18+</span>
    </a>
  )
}

/** Full mandatory slogan, shown once below odds on detail pages. */
export function BettingNotice({ className = '' }: { className?: string }) {
  if (!SHOW_ODDS) return null
  return (
    <p className={`text-[11px] text-muted-light ${className}`}>
      {BETTING_SLOGAN}{' '}
      <a href="https://www.loketkansspel.nl" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
        loketkansspel.nl
      </a>
    </p>
  )
}

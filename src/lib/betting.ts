/**
 * Everything betting-related lives here, so the link can be swapped for an
 * affiliate link and all odds can be switched off in one place.
 *
 * Dutch rules (Wet Koa, Werving- en reclamebesluit, Reclamecode voor
 * Kansspelen): odds are shown neutrally, never framed as a way to earn money
 * or win a sum, links are marked as sponsored, and the mandatory slogan sits
 * next to every betting element.
 *
 * - NEXT_PUBLIC_UNIBET_URL: affiliate link (defaults to the plain Unibet page)
 * - NEXT_PUBLIC_SHOW_ODDS=false: hides all odds and betting links
 */
export const BETTING_URL =
  process.env.NEXT_PUBLIC_UNIBET_URL || 'https://www.unibet.nl/betting/sports/filter/football/netherlands/eredivisie'

export const SHOW_ODDS = process.env.NEXT_PUBLIC_SHOW_ODDS !== 'false'

export const BETTING_REL = 'sponsored nofollow noopener noreferrer'

export const BETTING_SLOGAN = '18+ | Wat kost gokken jou? Stop op tijd.'

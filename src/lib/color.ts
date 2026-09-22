/** Small colour helpers for club theming (no dependencies). */

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(clean)) return null
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)]
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
}

/** Relative luminance (WCAG), 0 = black, 1 = white. */
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function mix(hex: string, target: [number, number, number], amount: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return rgbToHex([
    rgb[0] + (target[0] - rgb[0]) * amount,
    rgb[1] + (target[1] - rgb[1]) * amount,
    rgb[2] + (target[2] - rgb[2]) * amount,
  ])
}

export function darken(hex: string, amount: number): string {
  return mix(hex, [0, 0, 0], amount)
}

export function lighten(hex: string, amount: number): string {
  return mix(hex, [255, 255, 255], amount)
}

/**
 * Theme derived from a club colour: a hero gradient, readable text on it,
 * and an accent that is dark enough to use as text on a light background.
 */
export function clubTheme(color?: string) {
  const base = color && hexToRgb(color) ? `#${color.replace('#', '')}` : '#e01e36'
  const lum = luminance(base)
  // Accent used for text/labels on the page: darken very light colours
  let accent = base
  while (luminance(accent) > 0.35) accent = darken(accent, 0.15)
  // Some clubs are near-white (e.g. white shirts): fall back to a neutral dark
  if (lum > 0.85) accent = '#1a1a2e'
  return {
    base,
    accent,
    accentLight: `color-mix(in srgb, ${accent} 12%, transparent)`,
    heroFrom: base,
    heroTo: darken(base, 0.35),
    onHero: lum > 0.55 ? '#111827' : '#ffffff',
    onHeroMuted: lum > 0.55 ? 'rgba(17,24,39,0.7)' : 'rgba(255,255,255,0.75)',
  }
}

/** Search types and matching, safe to import from client components. */

export type SearchItem = {
  type: 'club' | 'speler' | 'wedstrijd' | 'pagina'
  title: string
  subtitle: string
  href: string
  image?: string
  /** Lowercased, accent-free text to match against. */
  terms: string
}

export function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const TYPE_WEIGHT: Record<SearchItem['type'], number> = { pagina: 0, club: 1, wedstrijd: 2, speler: 3 }

/** Every word of the query must match; prefix matches on a word rank higher. */
export function searchItems(items: SearchItem[], query: string, limit = 12): SearchItem[] {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  return items
    .filter((item) => words.every((w) => item.terms.includes(w)))
    .map((item) => {
      const prefix = words.every((w) => item.terms.split(/\s+/).some((t) => t.startsWith(w)))
      return { item, score: (prefix ? 0 : 10) + TYPE_WEIGHT[item.type] }
    })
    .sort((a, b) => a.score - b.score || a.item.title.localeCompare(b.item.title, 'nl'))
    .slice(0, limit)
    .map((r) => r.item)
}

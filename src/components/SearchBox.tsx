'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { searchItems, type SearchItem } from '@/lib/search-shared'
import { track } from '@/lib/analytics'

const TYPE_LABEL: Record<SearchItem['type'], string> = {
  pagina: 'Pagina',
  club: 'Club',
  wedstrijd: 'Wedstrijd',
  speler: 'Speler',
}

let indexPromise: Promise<SearchItem[]> | null = null
function loadIndex(): Promise<SearchItem[]> {
  indexPromise ??= fetch('/api/zoek-index')
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => {
      indexPromise = null
      return []
    })
  return indexPromise
}

function SearchIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
    </svg>
  )
}

/**
 * Header search over clubs, players, matches and pages. The index is loaded
 * once, on first open. On small screens it opens as a full-width panel.
 */
export function SearchBox() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<SearchItem[] | null>(null)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const results = index ? searchItems(index, query, 8) : []

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    loadIndex().then(setIndex)
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // "/" opens search, like most sites
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (e.key === '/' && !open && !['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function close() {
    setOpen(false)
    setQuery('')
    setActive(0)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') close()
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const hit = results[active]
      track('search', { search_term: query.trim(), results: results.length })
      if (hit) {
        track('search_select', { type: hit.type, item: hit.title })
        router.push(hit.href)
      } else if (query.trim()) router.push(`/zoeken?q=${encodeURIComponent(query.trim())}`)
      close()
    }
  }

  return (
    <div ref={rootRef} className="sm:relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Zoek club of speler"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-accent-light hover:text-accent lg:w-56 lg:bg-background lg:ring-1 lg:ring-border"
      >
        <SearchIcon />
        <span className="hidden lg:inline">Zoek club of speler</span>
        <kbd aria-hidden="true" className="ml-auto hidden rounded border border-border px-1.5 text-[10px] font-semibold text-muted-light lg:inline">/</kbd>
      </button>

      {open && (
        <div className="absolute inset-x-3 top-full z-50 mt-2 overflow-hidden rounded-xl bg-card shadow-lg ring-1 ring-border sm:inset-x-auto sm:right-0 sm:w-[26rem]">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <SearchIcon className="h-4 w-4 shrink-0 text-muted" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              onKeyDown={onKeyDown}
              placeholder="Zoek een club, speler of wedstrijd"
              aria-label="Zoeken"
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
              role="combobox"
              aria-expanded={results.length > 0}
              className="h-12 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-light"
            />
          </div>
          {query.trim() && (
            <ul id={listId} role="listbox" className="max-h-[60vh] overflow-y-auto p-1.5">
              {!index && <li className="px-3 py-3 text-sm text-muted">Laden…</li>}
              {index && results.length === 0 && (
                <li className="px-3 py-3 text-sm text-muted">Niets gevonden voor &ldquo;{query}&rdquo;</li>
              )}
              {results.map((r, i) => (
                <li key={r.href} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={r.href}
                    onClick={() => {
                      track('search_select', { type: r.type, item: r.title, search_term: query.trim() })
                      close()
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${i === active ? 'bg-accent-light' : ''}`}
                  >
                    {r.image ? (
                      <Image src={r.image} alt="" width={24} height={24} className="h-6 w-6 shrink-0 object-contain" />
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background text-muted">
                        <SearchIcon className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-foreground">{r.title}</span>
                      <span className="block truncate text-xs text-muted">{r.subtitle}</span>
                    </span>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-light">{TYPE_LABEL[r.type]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

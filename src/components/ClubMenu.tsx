'use client'

import Image from 'next/image'
import { useEffect, useId, useRef, useState } from 'react'
import { Club } from '@/data/types'
import { useFavoriteClub } from '@/lib/favorite-club'

export function ClubMenu({ clubs }: { clubs: Club[] }) {
  const { favoriteId, setFavorite } = useFavoriteClub()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  const favorite = clubs.find((c) => c.id === favoriteId)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (clubs.length === 0) return null

  function choose(id: string | null) {
    setFavorite(id)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="sm:relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex items-center gap-2 rounded-lg py-2 pl-2.5 pr-3 text-sm font-medium transition-colors ${
          favorite
            ? 'bg-accent-light text-accent'
            : 'text-muted hover:bg-accent-light hover:text-accent'
        }`}
      >
        {favorite ? (
          <Image src={favorite.logo} alt="" width={20} height={20} className="h-5 w-5" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
          </svg>
        )}
        <span className={`max-w-[9rem] truncate ${favorite ? 'hidden sm:inline' : ''}`}>
          {favorite ? favorite.name : 'Mijn club'}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          role="listbox"
          aria-label="Kies je club"
          className="absolute inset-x-3 top-full z-50 mt-2 overflow-hidden rounded-xl bg-card shadow-lg ring-1 ring-border sm:inset-x-auto sm:right-0 sm:w-[22rem]"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-bold text-foreground">Kies je club</p>
            <p className="text-xs text-muted">Wedstrijden van je club worden overal uitgelicht.</p>
          </div>
          <div className="grid max-h-[60vh] grid-cols-2 gap-1 overflow-y-auto p-2">
            {clubs.map((club) => {
              const selected = club.id === favoriteId
              return (
                <button
                  key={club.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => choose(selected ? null : club.id)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-semibold transition-colors ${
                    selected
                      ? 'bg-accent text-white'
                      : 'text-foreground hover:bg-accent-light hover:text-accent'
                  }`}
                >
                  <Image src={club.logo} alt="" width={20} height={20} className="h-5 w-5 shrink-0" />
                  <span className="truncate">{club.name}</span>
                </button>
              )
            })}
          </div>
          {favorite && (
            <div className="border-t border-border p-2">
              <button
                type="button"
                onClick={() => choose(null)}
                className="w-full rounded-lg px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-accent-light hover:text-accent"
              >
                Keuze wissen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import Image from 'next/image'
import { Club } from '@/data/types'
import { clubTheme } from '@/lib/color'

export const FAVORITE_COOKIE = 'favoriteClub'
const STORAGE_KEY = 'favoriteClub'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365
const TOAST_MS = 4500

const FavoriteClubContext = createContext<{
  favoriteId: string | null
  favorite: Club | null
  setFavorite: (id: string | null) => void
}>({ favoriteId: null, favorite: null, setFavorite: () => {} })

/**
 * The favourite club is stored in a cookie so the server can render the
 * right state on the first paint (no layout shift). localStorage is kept as a
 * fallback for browsers that drop the cookie.
 */
export function FavoriteClubProvider({
  children,
  clubs,
  initialFavoriteId = null,
}: {
  children: ReactNode
  clubs: Club[]
  initialFavoriteId?: string | null
}) {
  const [favoriteId, setFavoriteId] = useState<string | null>(initialFavoriteId)
  const [toast, setToast] = useState<Club | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (initialFavoriteId) return
    const t = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          setFavoriteId(stored)
          document.cookie = `${FAVORITE_COOKIE}=${stored}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
        }
      } catch {}
    }, 0)
    return () => clearTimeout(t)
  }, [initialFavoriteId])

  const favorite = clubs.find((c) => c.id === favoriteId) ?? null

  // Expose the club colour as CSS variables for accents (rings, buttons, tints)
  useEffect(() => {
    const root = document.documentElement
    if (favorite) {
      const theme = clubTheme(favorite.color)
      root.style.setProperty('--club-color', theme.base)
      root.style.setProperty('--club-on', theme.onHero)
    } else {
      root.style.removeProperty('--club-color')
      root.style.removeProperty('--club-on')
    }
  }, [favorite])

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  function setFavorite(id: string | null) {
    setFavoriteId(id)
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEY, id)
        document.cookie = `${FAVORITE_COOKIE}=${id}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
      } else {
        localStorage.removeItem(STORAGE_KEY)
        document.cookie = `${FAVORITE_COOKIE}=; path=/; max-age=0; SameSite=Lax`
      }
    } catch {}

    const club = id ? clubs.find((c) => c.id === id) ?? null : null
    setToast(club)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    if (club) toastTimer.current = setTimeout(() => setToast(null), TOAST_MS)
  }

  return (
    <FavoriteClubContext.Provider value={{ favoriteId, favorite, setFavorite }}>
      {children}
      {toast && <FavoriteToast club={toast} onClose={() => setToast(null)} />}
    </FavoriteClubContext.Provider>
  )
}

function FavoriteToast({ club, onClose }: { club: Club; onClose: () => void }) {
  const theme = clubTheme(club.color)
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl p-3 pr-2 shadow-2xl ring-1 ring-black/10 motion-safe:animate-[toast-in_0.35s_cubic-bezier(0.2,0.8,0.2,1)]"
      style={{ background: `linear-gradient(135deg, ${theme.heroFrom}, ${theme.heroTo})`, color: theme.onHero }}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white p-1.5 shadow">
        <Image src={club.logo} alt="" width={40} height={40} className="h-full w-full object-contain" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold leading-tight">{club.name} is nu jouw club</p>
        <p className="text-xs leading-snug" style={{ color: theme.onHeroMuted }}>
          De site kleurt mee en wedstrijden van {club.shortName} worden overal uitgelicht.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Melding sluiten"
        className="shrink-0 rounded-full p-2 transition-colors hover:bg-white/15"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  )
}

export function useFavoriteClub() {
  return useContext(FavoriteClubContext)
}

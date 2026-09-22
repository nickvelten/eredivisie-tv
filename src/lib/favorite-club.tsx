'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Club } from '@/data/types'

export const FAVORITE_COOKIE = 'favoriteClub'
const STORAGE_KEY = 'favoriteClub'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

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

  // Expose the club colour as a CSS variable for subtle accents (rings, tints)
  useEffect(() => {
    const root = document.documentElement
    if (favorite?.color) root.style.setProperty('--club-color', `#${favorite.color}`)
    else root.style.removeProperty('--club-color')
  }, [favorite])

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
  }

  return (
    <FavoriteClubContext.Provider value={{ favoriteId, favorite, setFavorite }}>
      {children}
    </FavoriteClubContext.Provider>
  )
}

export function useFavoriteClub() {
  return useContext(FavoriteClubContext)
}

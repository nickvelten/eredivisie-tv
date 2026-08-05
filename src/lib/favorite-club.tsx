'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

const STORAGE_KEY = 'favoriteClub'

const FavoriteClubContext = createContext<{
  favoriteId: string | null
  setFavorite: (id: string | null) => void
}>({ favoriteId: null, setFavorite: () => {} })

export function FavoriteClubProvider({ children }: { children: ReactNode }) {
  // Starts as null on server and first client render; the stored value is
  // applied after mount so server and client markup stay identical.
  const [favoriteId, setFavoriteId] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setFavoriteId(localStorage.getItem(STORAGE_KEY))
      } catch {}
    }, 0)
    return () => clearTimeout(t)
  }, [])

  function setFavorite(id: string | null) {
    setFavoriteId(id)
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id)
      else localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  return (
    <FavoriteClubContext.Provider value={{ favoriteId, setFavorite }}>
      {children}
    </FavoriteClubContext.Provider>
  )
}

export function useFavoriteClub() {
  return useContext(FavoriteClubContext)
}

'use client'

import { useFavoriteClub } from '@/lib/favorite-club'

export function SetFavoriteButton({ clubId }: { clubId: string }) {
  const { favoriteId, setFavorite } = useFavoriteClub()
  const selected = favoriteId === clubId
  return (
    <button
      type="button"
      onClick={() => setFavorite(selected ? null : clubId)}
      aria-pressed={selected}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all ${
        selected
          ? 'bg-white text-accent ring-2 ring-white/60 hover:bg-white/90'
          : 'bg-white/15 text-inherit ring-1 ring-white/40 backdrop-blur-sm hover:bg-white/25'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
      </svg>
      {selected ? 'Mijn club' : 'Maak mijn club'}
    </button>
  )
}

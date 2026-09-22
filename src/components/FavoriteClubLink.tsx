'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFavoriteClub } from '@/lib/favorite-club'

/** Prominent shortcut to the favourite club's page, shown in the nav row. */
export function FavoriteClubLink() {
  const { favorite } = useFavoriteClub()
  const pathname = usePathname()
  if (!favorite) return null
  const href = `/club/${favorite.slug}`
  const active = pathname === href

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      title={`Naar de clubpagina van ${favorite.name}`}
      className={`mr-1 inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-(--club-color) py-1.5 pl-2 pr-3 text-sm font-bold text-(--club-on) shadow-sm transition-all hover:shadow-md hover:brightness-110 ${
        active ? 'ring-2 ring-(--club-color)/30' : ''
      }`}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white p-0.5">
        <Image src={favorite.logo} alt="" width={20} height={20} className="h-full w-full object-contain" />
      </span>
      <span>
        <span className="hidden sm:inline">{favorite.shortName} </span>clubpagina
      </span>
      <span aria-hidden="true">→</span>
    </Link>
  )
}

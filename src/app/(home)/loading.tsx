function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-foreground/[0.06] ${className}`} />
}

/** Skeleton shown while the ESPN data streams in. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10" aria-busy="true" aria-label="Laden">
      <Block className="mb-5 h-8 w-56" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Block key={i} className="h-36" />
        ))}
      </div>
      <Block className="mb-5 mt-14 h-8 w-40" />
      <Block className="h-[28rem]" />
    </div>
  )
}

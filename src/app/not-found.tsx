import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-accent">404</p>
      <h1 className="mt-2 text-3xl font-extrabold text-foreground">Buitenspel</h1>
      <p className="mt-2 max-w-md text-sm text-muted">Deze pagina bestaat niet of de wedstrijd staat niet meer in het programma.</p>
      <Link href="/" className="mt-6 rounded-full bg-accent px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-accent/90 hover:shadow-md">
        Naar het overzicht
      </Link>
    </main>
  )
}

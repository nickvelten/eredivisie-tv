export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-black font-sans">
      <main className="flex flex-col items-center gap-8 text-center px-6">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
            eredivisie<span className="text-red-600">.tv</span>
          </h1>
          <div className="h-1 w-24 bg-red-600 rounded-full" />
        </div>
        <p className="text-xl text-zinc-400 max-w-md">
          Binnenkort beschikbaar
        </p>
      </main>
    </div>
  );
}

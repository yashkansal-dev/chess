import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-12">
      <section className="w-full rounded-3xl border border-slate-200/70 bg-white/85 p-8 text-center shadow-xl shadow-slate-300/30 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20 md:p-14">
        <p className="mb-4 inline-flex rounded-full border border-indigo-300/70 bg-indigo-50 px-4 py-1 text-xs font-semibold tracking-wide text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300">
          Next.js + TypeScript + chess.js
        </p>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-6xl">
          Chess Arena
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-slate-600 dark:text-slate-300 md:text-lg">
          Play local PvP, challenge a basic AI, review PGN move history, flip the board,
          and control timers in a clean responsive interface.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/game"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white transition hover:scale-[1.02] hover:opacity-95"
          >
            Start Game
          </Link>
          <Link
            href="/game"
            className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Open Chess Board
          </Link>
        </div>

        <div className="mt-10 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            ✅ Legal move validation
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            🤖 PvP + basic AI
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            ⏱ Timers + persistence
          </div>
        </div>
      </section>
    </main>
  );
}

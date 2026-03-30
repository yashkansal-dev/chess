"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGameStore } from "@/store/useGameStore";

export default function Home() {
  const router = useRouter();
  const { mode, setMode, startGame, newGame } = useGameStore();
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState(mode);

  const openModeModal = () => {
    setPendingMode(mode);
    setIsModeModalOpen(true);
  };

  const onStartMatch = () => {
    newGame();
    setMode(pendingMode);
    startGame();
    setIsModeModalOpen(false);
    router.push("/game");
  };

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.22),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.18),transparent_36%)]" />

      <section className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col items-center justify-center px-6 py-16 md:py-24">
        <div className="glass-card animate-fade-up w-full rounded-3xl px-6 py-10 text-center md:px-12 md:py-16">
          <h1 className="text-balance text-5xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-7xl">
            Chess Arena
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base font-medium text-slate-500 dark:text-slate-300 md:text-lg">
            A modern chess experience with polished controls, AI mode, responsive gameplay,
            and a premium interface crafted for portfolio-grade presentation.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={openModeModal}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-7 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition duration-200 hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-500/40"
            >
              Start Game
            </button>
          </div>

          <div className="mt-12 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
            <article className="group rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/70 dark:bg-slate-900/55">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                ♟️
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Legal Move Validation</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-300">
                Powered by chess.js to enforce legal moves, checks, and checkmate states.
              </p>
            </article>

            <article className="group rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/70 dark:bg-slate-900/55">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                🤖
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">PvP + Smart AI</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-300">
                Play locally with friends or challenge a built-in AI opponent.
              </p>
            </article>

            <article className="group rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/70 dark:bg-slate-900/55">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                ⏱
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Timers + Persistence</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-300">
                Seamless game continuity with saved state and configurable clocks.
              </p>
            </article>
          </div>
        </div>
      </section>

      {isModeModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="animate-fade-up w-full max-w-[400px] rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Select Game Mode</h2>

            <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                onClick={() => setPendingMode("pvp")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 ${
                  pendingMode === "pvp"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                PvP Local
              </button>
              <button
                onClick={() => setPendingMode("ai")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 ${
                  pendingMode === "ai"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                vs Computer
              </button>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsModeModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={onStartMatch}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition duration-200 hover:scale-[1.02]"
              >
                Start Match
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

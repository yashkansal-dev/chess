"use client";

import { formatClock } from "@/lib/chessEngine";
import { useGameStore } from "@/store/useGameStore";

export function GameControls() {
  const {
    mode,
    turn,
    statusLabel,
    isGameOver,
    winner,
    aiThinking,
    timerPreset,
    clock,
    soundEnabled,
    mockElo,
    setMode,
    restart,
    undoMove,
    flipBoard,
    setTimerPreset,
    toggleSound,
  } = useGameStore();

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</p>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{statusLabel}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Turn: <span className="font-semibold">{turn === "w" ? "White" : "Black"}</span>
          {isGameOver && winner ? (
            <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              Winner: {winner}
            </span>
          ) : null}
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Game Mode</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("pvp")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "pvp"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            PvP Local
          </button>
          <button
            onClick={() => setMode("ai")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "ai"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            vs Computer
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Clock</p>
        <div className="grid grid-cols-2 gap-2 text-center text-sm font-semibold">
          <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">White: {formatClock(clock.white)}</div>
          <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">Black: {formatClock(clock.black)}</div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => setTimerPreset("blitz")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              timerPreset === "blitz"
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            Blitz 5+0
          </button>
          <button
            onClick={() => setTimerPreset("rapid")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              timerPreset === "rapid"
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            Rapid 10+0
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={restart}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          Restart
        </button>
        <button
          onClick={undoMove}
          className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-400"
        >
          Undo
        </button>
        <button
          onClick={flipBoard}
          className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Flip Board
        </button>
        <button
          onClick={toggleSound}
          className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Sound: {soundEnabled ? "On" : "Off"}
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <p>Mock Elo — You: {mockElo.player}</p>
        <p>Mock Elo — Bot: {mockElo.bot}</p>
        {aiThinking ? <p className="mt-1 animate-pulse font-semibold text-indigo-500">Computer is thinking...</p> : null}
      </div>
    </section>
  );
}

"use client";

import { formatClock } from "@/lib/chessEngine";
import { useGameStore } from "@/store/useGameStore";

export function GameControls() {
  const {
    gameStarted,
    mode,
    turn,
    aiThinking,
    timerPreset,
    clock,
    soundEnabled,
    mockElo,
    setMode,
    startGame,
    newGame,
    restart,
    undoMove,
    flipBoard,
    setTimerPreset,
    toggleSound,
  } = useGameStore();

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200/90 bg-white/75 p-5 shadow-sm backdrop-blur-lg transition duration-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/55">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Turn Indicator</p>
        <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          Current Turn: {turn === "w" ? "White ♔" : "Black ♚"}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Mode</p>

        {gameStarted ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            Mode: {mode === "pvp" ? "PvP Local" : "vs Computer"}
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Game mode locked. Start a new game to change mode.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode("pvp")}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition duration-200 ${
                mode === "pvp"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              PvP Local
            </button>
            <button
              onClick={() => setMode("ai")}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition duration-200 ${
                mode === "ai"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              vs Computer
            </button>
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Clock</p>
        <div className="grid grid-cols-2 gap-2 text-center text-sm font-semibold">
          <div className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">White: {formatClock(clock.white)}</div>
          <div className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">Black: {formatClock(clock.black)}</div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => setTimerPreset("blitz")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition duration-200 ${
              timerPreset === "blitz"
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            Blitz 5+0
          </button>
          <button
            onClick={() => setTimerPreset("rapid")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition duration-200 ${
              timerPreset === "rapid"
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            Rapid 10+0
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Actions</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={newGame}
          className="col-span-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
        >
          New Game
        </button>

        {!gameStarted ? (
          <button
            onClick={startGame}
            className="col-span-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Start Game
          </button>
        ) : null}

        <button
          onClick={restart}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Restart
        </button>
        <button
          onClick={undoMove}
          className="rounded-xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Undo
        </button>
        <button
          onClick={flipBoard}
          className="rounded-xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Flip Board
        </button>
        <button
          onClick={toggleSound}
          className="rounded-xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Sound: {soundEnabled ? "On" : "Off"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <p>Mock Elo — You: {mockElo.player}</p>
        <p>Mock Elo — Bot: {mockElo.bot}</p>
        {aiThinking ? <p className="mt-1 animate-pulse font-semibold text-indigo-500">Computer is thinking...</p> : null}
      </div>
    </section>
  );
}

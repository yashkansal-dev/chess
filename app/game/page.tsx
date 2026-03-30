"use client";

import { useEffect } from "react";
import { ChessBoard } from "@/components/ChessBoard";
import { GameControls } from "@/components/GameControls";
import { MoveHistory } from "@/components/MoveHistory";
import { useGameStore } from "@/store/useGameStore";

export default function GamePage() {
  const { historySan, pgn, mode, aiThinking, theme, setTheme, tickClock, makeAIMove } = useGameStore();

  useEffect(() => {
    const interval = setInterval(() => {
      tickClock();
    }, 1000);

    return () => clearInterval(interval);
  }, [tickClock]);

  useEffect(() => {
    if (mode === "ai" && aiThinking) {
      void makeAIMove();
    }
  }, [mode, aiThinking, makeAIMove]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("chess-arena-theme", theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem("chess-arena-theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, [setTheme]);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Chess Arena</h1>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Theme: {theme === "dark" ? "Dark" : "Light"}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,600px)_minmax(280px,1fr)] lg:items-start">
        <ChessBoard />
        <div className="space-y-5">
          <GameControls />
          <MoveHistory moves={historySan} pgn={pgn} />
        </div>
      </div>
    </main>
  );
}

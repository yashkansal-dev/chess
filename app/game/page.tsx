"use client";

import { useEffect } from "react";
import { ChessBoard } from "@/components/ChessBoard";
import { GameControls } from "@/components/GameControls";
import { GameStatusDisplay } from "@/components/GameStatusDisplay";
import { CheckmateModal } from "@/components/CheckmateModal";
import { useGameStore } from "@/store/useGameStore";

export default function GamePage() {
  const { aiThinking, tickClock, makeAIMove } = useGameStore();

  useEffect(() => {
    const interval = setInterval(() => {
      tickClock();
    }, 1000);

    return () => clearInterval(interval);
  }, [tickClock]);

  useEffect(() => {
    if (aiThinking) {
      void makeAIMove();
    }
  }, [aiThinking, makeAIMove]);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-8">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Chess Arena</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,600px)_minmax(280px,1fr)] lg:items-start">
        <ChessBoard />
        <div className="space-y-5">
          <GameStatusDisplay />
          <GameControls />
        </div>
      </div>

      {/* Checkmate modal with confetti */}
      <CheckmateModal />
    </main>
  );
}

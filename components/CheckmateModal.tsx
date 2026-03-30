"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/useGameStore";
import confetti from "canvas-confetti";

export function CheckmateModal() {
  const { isGameOver, statusLabel, winner, newGame } = useGameStore();
  const confettiRef = useRef(false);

  useEffect(() => {
    if (isGameOver && winner && !confettiRef.current) {
      confettiRef.current = true;
      
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const confettiPulse = () => {
        const timeLeft = animationEnd - Date.now();

        confetti({
          particleCount: Math.max(50, (timeLeft / duration) * 100),
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: [
            "#fbbf24", // amber
            "#60a5fa", // blue
            "#34d399", // emerald
            "#f472b6", // pink
            "#a78bfa", // violet
          ],
        });

        if (timeLeft > 0) {
          requestAnimationFrame(confettiPulse);
        }
      };

      confettiPulse();
    }
  }, [isGameOver, winner]);

  // Don't show if game not over
  if (!isGameOver || !winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="animate-scale-in rounded-3xl border border-white/20 bg-gradient-to-br from-white/95 via-white/90 to-white/85 p-8 shadow-2xl dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-900/85 dark:border-slate-700/30 sm:p-12">
        {/* Trophy Icon */}
        <div className="mb-6 text-center text-6xl animate-bounce">🏆</div>

        {/* Title */}
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-3">
          Game Over!
        </h2>

        {/* Status Message */}
        <p className="text-center text-lg text-slate-700 dark:text-slate-200 mb-8">
          {statusLabel}
        </p>

        {/* Winner Badge */}
        <div className="mb-8 flex justify-center">
          <div
            className={`rounded-full px-6 py-3 text-lg font-bold text-white ${
              winner === "white"
                ? "bg-gradient-to-r from-gray-400 to-gray-600"
                : "bg-gradient-to-r from-gray-700 to-slate-900"
            }`}
          >
            {winner === "white" ? "♔ White" : "♚ Black"} Wins!
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            confettiRef.current = false;
            newGame();
          }}
          className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-center font-semibold text-white transition duration-200 hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg shadow-lg shadow-indigo-500/30"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

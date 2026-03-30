"use client";

import { useGameStore } from "@/store/useGameStore";

export function GameStatusDisplay() {
  const { statusLabel, isGameOver, winner } = useGameStore();

  // Determine status badge color based on game state
  let bgColor = "bg-green-100/80 dark:bg-green-900/30";
  let textColor = "text-green-700 dark:text-green-300";
  let dotColor = "bg-green-500";
  let label = "Game in Progress";

  if (isGameOver && winner) {
    // Checkmate - Red
    bgColor = "bg-red-100/80 dark:bg-red-900/30";
    textColor = "text-red-700 dark:text-red-300";
    dotColor = "bg-red-500";
    label = "Checkmate";
  } else if (statusLabel.includes("Check")) {
    // Check - Yellow/Amber
    bgColor = "bg-amber-100/80 dark:bg-amber-900/30";
    textColor = "text-amber-700 dark:text-amber-300";
    dotColor = "bg-amber-500";
    label = "Check";
  } else if (statusLabel.includes("Draw")) {
    // Draw - Gray/Slate
    bgColor = "bg-slate-100 dark:bg-slate-800";
    textColor = "text-slate-700 dark:text-slate-200";
    dotColor = "bg-slate-500";
    label = "Draw";
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-sm transition duration-200 ${bgColor} ${textColor}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
      {label}
    </div>
  );
}

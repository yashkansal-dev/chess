"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";

export function GlobalThemeToggle() {
  const { theme, setTheme } = useGameStore();

  useEffect(() => {
    const saved = localStorage.getItem("chess-arena-theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, [setTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("chess-arena-theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed right-4 top-4 z-[60] rounded-xl border border-slate-300 bg-white/85 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition duration-200 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800 md:right-6 md:top-6"
      aria-label="Toggle color theme"
    >
      Theme: {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}

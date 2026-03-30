"use client";

import { useEffect, useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, type Square } from "chess.js";
import { getLegalTargetsFromSquare, type PromotionPiece } from "@/lib/chessEngine";
import { useGameStore } from "@/store/useGameStore";

const PROMOTION_OPTIONS: PromotionPiece[] = ["q", "r", "b", "n"];

function promotionLabel(piece: PromotionPiece): string {
  if (piece === "q") return "Queen";
  if (piece === "r") return "Rook";
  if (piece === "b") return "Bishop";
  return "Knight";
}

export function ChessBoard() {
  const {
    gameStarted,
    fen,
    orientation,
    turn,
    lastMove,
    pendingPromotion,
    isGameOver,
    aiThinking,
    soundEnabled,
    attemptMove,
    choosePromotion,
    cancelPromotion,
  } = useGameStore();

  const [selected, setSelected] = useState<Square | null>(null);
  const [targets, setTargets] = useState<Square[]>([]);
  const [boardWidth, setBoardWidth] = useState(560);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 420) {
        setBoardWidth(width - 24);
        return;
      }
      if (width < 768) {
        setBoardWidth(Math.min(width - 32, 520));
        return;
      }
      setBoardWidth(560);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!soundEnabled || !lastMove) return;

    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = 520;
      gain.gain.value = 0.02;

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.08);

      return () => {
        oscillator.disconnect();
        gain.disconnect();
        void context.close();
      };
    } catch {
      return;
    }
  }, [lastMove, soundEnabled]);

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    if (lastMove) {
      styles[lastMove.from] = {
        background:
          "radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.5) 100%)",
      };
      styles[lastMove.to] = {
        background:
          "radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(16,185,129,0.5) 100%)",
      };
    }

    if (selected) {
      styles[selected] = {
        background:
          "radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0.55) 100%)",
      };
    }

    for (const square of targets) {
      styles[square] = {
        boxShadow: "inset 0 0 0 3px rgba(99,102,241,0.7)",
      };
    }

    return styles;
  }, [lastMove, selected, targets]);

  const tryMove = (from: Square, to: Square): boolean => {
    const result = attemptMove(from, to);

    if (result.ok) {
      setSelected(null);
      setTargets([]);
      return true;
    }

    if (result.requiresPromotion) {
      setSelected(null);
      setTargets([]);
      return false;
    }

    return false;
  };

  const onSquareClick = (squareName: Square) => {
    if (!gameStarted || isGameOver || aiThinking || pendingPromotion) return;

    const chess = new Chess(fen);

    if (selected && targets.includes(squareName)) {
      void tryMove(selected, squareName);
      return;
    }

    const piece = chess.get(squareName);

    if (!piece || piece.color !== turn) {
      setSelected(null);
      setTargets([]);
      return;
    }

    setSelected(squareName);
    setTargets(getLegalTargetsFromSquare(fen, squareName));
  };

  return (
    <section className="relative rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:p-4">
      <Chessboard
        options={{
          id: "chess-arena",
          position: fen,
          boardOrientation: orientation,
          boardStyle: { width: `${boardWidth}px`, maxWidth: "100%" },
          allowDragging: gameStarted && !isGameOver && !aiThinking && !pendingPromotion,
          onPieceDrop: ({ sourceSquare, targetSquare }) => {
            if (!targetSquare) return false;
            return tryMove(sourceSquare as Square, targetSquare as Square);
          },
          onSquareClick: ({ square }) => onSquareClick(square as Square),
          squareStyles: customSquareStyles,
          animationDurationInMs: 220,
          showAnimations: true,
        }}
      />

      {!gameStarted ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-950/35 p-4 text-center backdrop-blur-[2px]">
          <div className="rounded-xl bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow-md dark:bg-slate-900/90 dark:text-slate-200">
            Select a mode and press Start Game to begin.
          </div>
        </div>
      ) : null}

      {pendingPromotion ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/45 p-4">
          <div className="w-full max-w-xs rounded-xl bg-white p-4 shadow-lg dark:bg-slate-900">
            <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-100">
              Choose a promotion piece
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PROMOTION_OPTIONS.map((piece) => (
                <button
                  key={piece}
                  onClick={() => choosePromotion(piece)}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  {promotionLabel(piece)}
                </button>
              ))}
            </div>

            <button
              onClick={cancelPromotion}
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
             </button>
           </div>
         </div>
       ) : null}
     </section>
   );
}

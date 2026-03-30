"use client";

import { Chess, type Color, type Square } from "chess.js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  type GameMode,
  type PromotionPiece,
  type TimerPreset,
  getGameStatus,
  getInitialSeconds,
  isPromotionMove,
  pickBestMove,
  pickRandomMove,
} from "@/lib/chessEngine";

export interface MoveAttemptResult {
  ok: boolean;
  requiresPromotion?: boolean;
}

type Theme = "light" | "dark";

type PendingPromotion = {
  from: Square;
  to: Square;
};

interface ClockState {
  white: number;
  black: number;
}

interface GameState {
  mode: GameMode;
  aiColor: Color;
  aiDepth: number;
  fen: string;
  pgn: string;
  historySan: string[];
  turn: Color;
  statusLabel: string;
  isGameOver: boolean;
  winner: "white" | "black" | null;
  lastMove: { from: Square; to: Square } | null;
  orientation: "white" | "black";
  pendingPromotion: PendingPromotion | null;
  aiThinking: boolean;
  timerPreset: TimerPreset;
  clock: ClockState;
  soundEnabled: boolean;
  mockElo: { player: number; bot: number };
  theme: Theme;
}

interface GameActions {
  setMode: (mode: GameMode) => void;
  restart: () => void;
  undoMove: () => void;
  flipBoard: () => void;
  attemptMove: (from: Square, to: Square, promotion?: PromotionPiece) => MoveAttemptResult;
  choosePromotion: (piece: PromotionPiece) => void;
  cancelPromotion: () => void;
  makeAIMove: () => Promise<void>;
  tickClock: () => void;
  setTimerPreset: (preset: TimerPreset) => void;
  toggleSound: () => void;
  setTheme: (theme: Theme) => void;
}

export type GameStore = GameState & GameActions;

const createFreshChess = () => new Chess();

function getClockByPreset(preset: TimerPreset): ClockState {
  const seconds = getInitialSeconds(preset);
  return { white: seconds, black: seconds };
}

function toSnapshot(chess: Chess): Pick<
  GameStore,
  "fen" | "pgn" | "historySan" | "turn" | "statusLabel" | "isGameOver" | "winner"
> {
  const status = getGameStatus(chess);
  return {
    fen: chess.fen(),
    pgn: chess.pgn(),
    historySan: chess.history(),
    turn: chess.turn(),
    statusLabel: status.label,
    isGameOver: status.isGameOver,
    winner: status.winner,
  };
}

function defaultState(): Omit<GameStore, keyof GameActions> {
  const chess = createFreshChess();
  const timerPreset: TimerPreset = "blitz";

  return {
    mode: "pvp",
    aiColor: "b",
    aiDepth: 2,
    ...toSnapshot(chess),
    lastMove: null,
    orientation: "white",
    pendingPromotion: null,
    aiThinking: false,
    timerPreset,
    clock: getClockByPreset(timerPreset),
    soundEnabled: true,
    mockElo: { player: 1200, bot: 1180 },
    theme: "dark",
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...defaultState(),

      setMode: (mode) => {
        set({ mode });
        get().restart();
      },

      restart: () => {
        const state = get();
        const chess = createFreshChess();

        set({
          ...toSnapshot(chess),
          pendingPromotion: null,
          aiThinking: false,
          lastMove: null,
          clock: getClockByPreset(state.timerPreset),
        });
      },

      undoMove: () => {
        const state = get();
        const chess = new Chess(state.fen);
        const undone = chess.undo();

        if (!undone) return;

        set({
          ...toSnapshot(chess),
          pendingPromotion: null,
          aiThinking: false,
          lastMove: null,
        });
      },

      flipBoard: () => {
        set((state) => ({
          orientation: state.orientation === "white" ? "black" : "white",
        }));
      },

      attemptMove: (from, to, promotion) => {
        const state = get();
        const chess = new Chess(state.fen);

        if (state.isGameOver) return { ok: false };

        if (!promotion && isPromotionMove(chess, from, to)) {
          set({ pendingPromotion: { from, to } });
          return { ok: false, requiresPromotion: true };
        }

        const move = chess.move({ from, to, promotion: promotion ?? "q" });
        if (!move) return { ok: false };

        const needsAiReply = state.mode === "ai" && chess.turn() === state.aiColor && !chess.isGameOver();

        set({
          ...toSnapshot(chess),
          pendingPromotion: null,
          lastMove: { from, to },
          aiThinking: needsAiReply,
        });

        return { ok: true };
      },

      choosePromotion: (piece) => {
        const pending = get().pendingPromotion;
        if (!pending) return;

        get().attemptMove(pending.from, pending.to, piece);
      },

      cancelPromotion: () => {
        set({ pendingPromotion: null });
      },

      makeAIMove: async () => {
        const pre = get();
        if (pre.mode !== "ai" || !pre.aiThinking || pre.isGameOver) return;

        await new Promise((resolve) => setTimeout(resolve, 450));

        const state = get();
        const chess = new Chess(state.fen);

        if (chess.isGameOver() || chess.turn() !== state.aiColor) {
          set({ aiThinking: false });
          return;
        }

        const best = pickBestMove(chess, state.aiDepth, state.aiColor);
        const chosen = best ?? pickRandomMove(chess);

        if (!chosen) {
          set({ aiThinking: false });
          return;
        }

        const move = chess.move(chosen);

        set({
          ...toSnapshot(chess),
          lastMove: move ? { from: move.from as Square, to: move.to as Square } : null,
          aiThinking: false,
        });
      },

      tickClock: () => {
        const state = get();

        if (state.isGameOver || state.historySan.length === 0) return;

        const key = state.turn === "w" ? "white" : "black";
        const next = state.clock[key] - 1;

        if (next > 0) {
          set({
            clock: {
              ...state.clock,
              [key]: next,
            },
          });
          return;
        }

        const winner = key === "white" ? "black" : "white";

        set({
          clock: {
            ...state.clock,
            [key]: 0,
          },
          isGameOver: true,
          winner,
          statusLabel: `Time out! ${winner[0].toUpperCase()}${winner.slice(1)} wins.`,
          aiThinking: false,
        });
      },

      setTimerPreset: (preset) => {
        const chess = new Chess(get().fen);
        set({
          timerPreset: preset,
          clock: getClockByPreset(preset),
          ...toSnapshot(chess),
        });
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      setTheme: (theme) => {
        set({ theme });
      },
    }),
    {
      name: "chess-arena-store-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mode: state.mode,
        aiColor: state.aiColor,
        aiDepth: state.aiDepth,
        fen: state.fen,
        pgn: state.pgn,
        historySan: state.historySan,
        turn: state.turn,
        statusLabel: state.statusLabel,
        isGameOver: state.isGameOver,
        winner: state.winner,
        lastMove: state.lastMove,
        orientation: state.orientation,
        timerPreset: state.timerPreset,
        clock: state.clock,
        soundEnabled: state.soundEnabled,
        mockElo: state.mockElo,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const chess = new Chess(state.fen);
        const snapshot = toSnapshot(chess);

        state.fen = snapshot.fen;
        state.pgn = snapshot.pgn;
        state.historySan = snapshot.historySan;
        state.turn = snapshot.turn;
        state.statusLabel = snapshot.statusLabel;
        state.isGameOver = snapshot.isGameOver;
        state.winner = snapshot.winner;
        state.pendingPromotion = null;
        state.aiThinking = false;
      },
    },
  ),
);

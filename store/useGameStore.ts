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
  gameStarted: boolean;
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
  startGame: () => void;
  newGame: () => void;
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
    gameStarted: false,
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
        const state = get();
        if (state.gameStarted) return;

        const chess = createFreshChess();
        set({
          mode,
          ...toSnapshot(chess),
          pendingPromotion: null,
          aiThinking: false,
          lastMove: null,
          clock: getClockByPreset(state.timerPreset),
          gameStarted: false,
          statusLabel: "Ready to start",
        });
      },

      startGame: () => {
        const state = get();
        const chess = createFreshChess();
        set({
          ...toSnapshot(chess),
          pendingPromotion: null,
          aiThinking: false,
          lastMove: null,
          clock: getClockByPreset(state.timerPreset),
          gameStarted: true,
          statusLabel: "Game started",
        });
      },

      newGame: () => {
        const state = get();
        const chess = createFreshChess();
        set({
          ...toSnapshot(chess),
          pendingPromotion: null,
          aiThinking: false,
          lastMove: null,
          clock: getClockByPreset(state.timerPreset),
          gameStarted: false,
          statusLabel: "Select a mode and press Start Game",
        });
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
          gameStarted: true,
          statusLabel: "Game restarted",
        });
      },

      undoMove: () => {
        const state = get();
        const chess = new Chess(state.fen);

        // In AI mode, undo both AI move and player move (2 undos)
        // In PvP mode, undo only 1 move
        const undosNeeded = state.mode === "ai" ? 2 : 1;

        for (let i = 0; i < undosNeeded; i++) {
          const undone = chess.undo();
          if (!undone) break;
        }

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

        if (!state.gameStarted) return { ok: false };
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
        if (!pre.gameStarted || pre.mode !== "ai" || !pre.aiThinking || pre.isGameOver) return;

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

        if (!state.gameStarted || state.isGameOver || state.historySan.length === 0) return;

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
        gameStarted: state.gameStarted,
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

        // Validate that stored moves can be replayed from the starting position
        try {
          const validationChess = new Chess();
          for (const san of state.historySan || []) {
            const move = validationChess.move(san);
            if (!move) {
              // Invalid move found - reset history to empty
              state.historySan = [];
              break;
            }
          }
        } catch {
          // Error during move replay - reset history to be safe
          state.historySan = [];
        }

        const chess = new Chess(state.fen);
        const snapshot = toSnapshot(chess);

        state.fen = snapshot.fen;
        state.pgn = snapshot.pgn;
        // If history was cleared due to validation, use snapshot history
        if (!state.historySan.length) {
          state.historySan = snapshot.historySan;
        }
        state.turn = snapshot.turn;
        state.statusLabel = snapshot.statusLabel;
        state.isGameOver = snapshot.isGameOver;
        state.winner = snapshot.winner;
        state.pendingPromotion = null;
        state.aiThinking = false;
        if (!state.gameStarted && state.historySan.length === 0) {
          state.statusLabel = "Select a mode and press Start Game";
        }
      },
    },
  ),
);

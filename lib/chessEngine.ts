import { Chess, type Color, type Move, type PieceSymbol, type Square } from "chess.js";

export type GameMode = "pvp" | "ai";
export type PromotionPiece = "q" | "r" | "b" | "n";
export type TimerPreset = "blitz" | "rapid";

export interface StatusSnapshot {
  label: string;
  isGameOver: boolean;
  winner: "white" | "black" | null;
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

export function getInitialSeconds(preset: TimerPreset): number {
  return preset === "blitz" ? 5 * 60 : 10 * 60;
}

export function formatClock(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const secs = (clamped % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export function getGameStatus(chess: Chess): StatusSnapshot {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === "w" ? "black" : "white";
    return {
      label: `Checkmate! ${winner[0].toUpperCase()}${winner.slice(1)} wins.`,
      isGameOver: true,
      winner,
    };
  }

  if (chess.isStalemate()) {
    return { label: "Draw by stalemate.", isGameOver: true, winner: null };
  }

  if (chess.isThreefoldRepetition()) {
    return { label: "Draw by threefold repetition.", isGameOver: true, winner: null };
  }

  if (chess.isInsufficientMaterial()) {
    return { label: "Draw by insufficient material.", isGameOver: true, winner: null };
  }

  if (chess.isDraw()) {
    return { label: "Draw.", isGameOver: true, winner: null };
  }

  if (chess.inCheck()) {
    return { label: "Check!", isGameOver: false, winner: null };
  }

  return { label: "In progress", isGameOver: false, winner: null };
}

export function isPromotionMove(chess: Chess, from: Square, to: Square): boolean {
  const piece = chess.get(from);
  if (!piece || piece.type !== "p") return false;

  const targetRank = Number(to[1]);
  return (piece.color === "w" && targetRank === 8) || (piece.color === "b" && targetRank === 1);
}

export function getLegalTargetsFromSquare(fen: string, square: Square): Square[] {
  const chess = new Chess(fen);
  return chess
    .moves({ square, verbose: true })
    .map((move) => move.to as Square);
}

function evaluateBoard(chess: Chess): number {
  const board = chess.board();
  let score = 0;

  for (const row of board) {
    for (const piece of row) {
      if (!piece) continue;
      const base = PIECE_VALUES[piece.type];
      score += piece.color === "w" ? base : -base;
    }
  }

  return score;
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiColor: Color,
): number {
  if (depth === 0 || chess.isGameOver()) {
    const evaluation = evaluateBoard(chess);
    return aiColor === "w" ? evaluation : -evaluation;
  }

  const moves = chess.moves({ verbose: true });

  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const score = minimax(chess, depth - 1, alpha, beta, false, aiColor);
      chess.undo();
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const move of moves) {
    chess.move(move);
    const score = minimax(chess, depth - 1, alpha, beta, true, aiColor);
    chess.undo();
    best = Math.min(best, score);
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

export function pickBestMove(chess: Chess, depth: number, aiColor: Color): Move | null {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  let bestMove: Move | null = null;
  let bestScore = -Infinity;

  for (const move of moves) {
    chess.move(move);
    const score = minimax(chess, depth - 1, -Infinity, Infinity, false, aiColor);
    chess.undo();

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export function pickRandomMove(chess: Chess): Move | null {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;
  const index = Math.floor(Math.random() * moves.length);
  return moves[index] ?? null;
}

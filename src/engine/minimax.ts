import type { Move, GameState, EvaluationResult, Color } from './types';
import { evaluate } from './evaluation';
import { generateLegalMoves, applyMove, isInCheck } from './rules';
import { CHECKMATE_SCORE } from './constants';

export class ChessEngine {
  private nodesSearched = 0;
  private principalVariation: Move[] = [];
  private startTime = 0;
  private maxTimeMs = 5000;
  private shouldStop = false;

  public search(
    state: GameState,
    depth: number,
    maxTimeMs: number = 5000
  ): EvaluationResult {
    this.nodesSearched = 0;
    this.principalVariation = [];
    this.startTime = Date.now();
    this.maxTimeMs = maxTimeMs;
    this.shouldStop = false;

    const legalMoves = generateLegalMoves(state);

    if (legalMoves.length === 0) {
      return {
        score: 0,
        bestMove: null,
        depth: 0,
        nodesSearched: 0,
        principalVariation: [],
        timeMs: 0,
      };
    }

    let bestMove = legalMoves[0];
    let bestScore = -Infinity;
    const pv: Move[] = [];

    for (const move of legalMoves) {
      const newState = applyMove(state, move);
      const score = -this.alphaBeta(newState, depth - 1, -Infinity, Infinity, false);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }

      if (this.shouldStop) {
        break;
      }
    }

    const timeMs = Date.now() - this.startTime;

    return {
      score: bestScore,
      bestMove,
      depth,
      nodesSearched: this.nodesSearched,
      principalVariation: [bestMove, ...pv],
      timeMs,
    };
  }

  private alphaBeta(
    state: GameState,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    if (Date.now() - this.startTime > this.maxTimeMs) {
      this.shouldStop = true;
      return 0;
    }

    this.nodesSearched++;

    if (depth === 0) {
      return this.quiescence(state, alpha, beta);
    }

    const legalMoves = generateLegalMoves(state);

    if (legalMoves.length === 0) {
      if (isInCheck(state, state.turn)) {
        return -CHECKMATE_SCORE + (10 - depth);
      }
      return 0;
    }

    if (isMaximizing) {
      let maxScore = -Infinity;

      for (const move of legalMoves) {
        const newState = applyMove(state, move);
        const score = this.alphaBeta(newState, depth - 1, alpha, beta, false);

        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);

        if (beta <= alpha) {
          break;
        }

        if (this.shouldStop) {
          break;
        }
      }

      return maxScore;
    } else {
      let minScore = Infinity;

      for (const move of legalMoves) {
        const newState = applyMove(state, move);
        const score = this.alphaBeta(newState, depth - 1, alpha, beta, true);

        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);

        if (beta <= alpha) {
          break;
        }

        if (this.shouldStop) {
          break;
        }
      }

      return minScore;
    }
  }

  private quiescence(state: GameState, alpha: number, beta: number): number {
    this.nodesSearched++;

    const standPat = evaluate(state);

    if (standPat >= beta) {
      return beta;
    }

    if (alpha < standPat) {
      alpha = standPat;
    }

    const legalMoves = generateLegalMoves(state);
    const captureMoves = legalMoves.filter(move => move.captured);

    for (const move of captureMoves) {
      const newState = applyMove(state, move);
      const score = -this.quiescence(newState, -beta, -alpha);

      if (score >= beta) {
        return beta;
      }

      if (score > alpha) {
        alpha = score;
      }

      if (this.shouldStop) {
        break;
      }
    }

    return alpha;
  }

  public stop(): void {
    this.shouldStop = true;
  }
}

export function getBestMove(
  state: GameState,
  depth: number,
  maxTimeMs: number = 5000
): EvaluationResult {
  const engine = new ChessEngine();
  return engine.search(state, depth, maxTimeMs);
}

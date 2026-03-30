import type { GameState, EvaluationResult, Move } from './types';
import { ChessEngine } from './minimax';
import { generateLegalMoves } from './rules';

export class IterativeDeepeningEngine {
  private engine: ChessEngine;

  constructor() {
    this.engine = new ChessEngine();
  }

  public search(
    state: GameState,
    maxDepth: number,
    maxTimeMs: number = 5000
  ): EvaluationResult {
    const startTime = Date.now();
    let bestResult: EvaluationResult | null = null;

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

    if (legalMoves.length === 1) {
      return {
        score: 0,
        bestMove: legalMoves[0],
        depth: 1,
        nodesSearched: 1,
        principalVariation: [legalMoves[0]],
        timeMs: Date.now() - startTime,
      };
    }

    for (let depth = 1; depth <= maxDepth; depth++) {
      const remainingTime = maxTimeMs - (Date.now() - startTime);

      if (remainingTime <= 100) {
        break;
      }

      const result = this.engine.search(state, depth, remainingTime);

      if (result.bestMove) {
        bestResult = result;
      }

      if (Date.now() - startTime >= maxTimeMs * 0.9) {
        break;
      }
    }

    if (!bestResult) {
      bestResult = {
        score: 0,
        bestMove: legalMoves[0],
        depth: 1,
        nodesSearched: 1,
        principalVariation: [legalMoves[0]],
        timeMs: Date.now() - startTime,
      };
    }

    return bestResult;
  }
}

export function searchWithIterativeDeepening(
  state: GameState,
  maxDepth: number,
  maxTimeMs: number = 5000
): EvaluationResult {
  const engine = new IterativeDeepeningEngine();
  return engine.search(state, maxDepth, maxTimeMs);
}

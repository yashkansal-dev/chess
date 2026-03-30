import type { Move, GameState } from './types';
import { PIECE_VALUES } from './constants';

export function orderMoves(state: GameState, moves: Move[]): Move[] {
  const scoredMoves = moves.map(move => ({
    move,
    score: scoreMoveForOrdering(state, move),
  }));

  scoredMoves.sort((a, b) => b.score - a.score);

  return scoredMoves.map(sm => sm.move);
}

function scoreMoveForOrdering(state: GameState, move: Move): number {
  let score = 0;

  if (move.captured) {
    const victimValue = PIECE_VALUES[move.captured];
    const attackerValue = PIECE_VALUES[move.piece];
    score += 10 * victimValue - attackerValue;
  }

  if (move.promotion) {
    score += PIECE_VALUES[move.promotion];
  }

  if (move.check) {
    score += 50;
  }

  if (move.piece === 'p') {
    const targetRank = Math.floor(move.to / 8);
    const promotionRank = move.color === 'w' ? 7 : 0;
    const distanceToPromotion = Math.abs(targetRank - promotionRank);
    score += (7 - distanceToPromotion) * 5;
  }

  if (move.piece === 'k' || move.piece === 'q') {
    score -= 10;
  }

  const centerSquares = [27, 28, 35, 36];
  if (centerSquares.includes(move.to)) {
    score += 20;
  }

  const extendedCenterSquares = [18, 19, 20, 21, 26, 29, 34, 37, 42, 43, 44, 45];
  if (extendedCenterSquares.includes(move.to)) {
    score += 10;
  }

  return score;
}

export class KillerMoves {
  private killers: (Move | null)[][] = [];
  private maxDepth = 20;

  constructor() {
    for (let i = 0; i < this.maxDepth; i++) {
      this.killers[i] = [null, null];
    }
  }

  public add(move: Move, depth: number): void {
    if (depth >= this.maxDepth) return;

    if (this.killers[depth][0]?.from === move.from && this.killers[depth][0]?.to === move.to) {
      return;
    }

    this.killers[depth][1] = this.killers[depth][0];
    this.killers[depth][0] = move;
  }

  public isKiller(move: Move, depth: number): boolean {
    if (depth >= this.maxDepth) return false;

    return (
      (this.killers[depth][0]?.from === move.from && this.killers[depth][0]?.to === move.to) ||
      (this.killers[depth][1]?.from === move.from && this.killers[depth][1]?.to === move.to)
    );
  }

  public clear(): void {
    for (let i = 0; i < this.maxDepth; i++) {
      this.killers[i] = [null, null];
    }
  }
}

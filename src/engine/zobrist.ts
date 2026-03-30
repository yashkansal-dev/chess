import type { GameState, Piece } from './types';

const ZOBRIST_PIECES: bigint[][][] = [];
const ZOBRIST_CASTLING: bigint[] = [];
const ZOBRIST_EN_PASSANT: bigint[] = [];
let ZOBRIST_SIDE_TO_MOVE: bigint;

function randomBigInt(): bigint {
  const high = BigInt(Math.floor(Math.random() * 0x100000000));
  const low = BigInt(Math.floor(Math.random() * 0x100000000));
  return (high << 32n) | low;
}

export function initZobrist(): void {
  for (let piece = 0; piece < 12; piece++) {
    ZOBRIST_PIECES[piece] = [];
    for (let square = 0; square < 64; square++) {
      ZOBRIST_PIECES[piece][square] = [];
      ZOBRIST_PIECES[piece][square].push(randomBigInt());
    }
  }

  for (let i = 0; i < 4; i++) {
    ZOBRIST_CASTLING[i] = randomBigInt();
  }

  for (let i = 0; i < 8; i++) {
    ZOBRIST_EN_PASSANT[i] = randomBigInt();
  }

  ZOBRIST_SIDE_TO_MOVE = randomBigInt();
}

function pieceToIndex(piece: Piece): number {
  if (!piece) return -1;

  const baseIndex = piece.color === 'w' ? 0 : 6;

  switch (piece.type) {
    case 'p': return baseIndex + 0;
    case 'n': return baseIndex + 1;
    case 'b': return baseIndex + 2;
    case 'r': return baseIndex + 3;
    case 'q': return baseIndex + 4;
    case 'k': return baseIndex + 5;
    default: return -1;
  }
}

export function computeZobristHash(state: GameState): bigint {
  let hash = 0n;

  for (let square = 0; square < 64; square++) {
    const piece = state.board[square];
    if (piece) {
      const pieceIndex = pieceToIndex(piece);
      if (pieceIndex >= 0) {
        hash ^= ZOBRIST_PIECES[pieceIndex][square][0];
      }
    }
  }

  if (state.castlingRights.K) hash ^= ZOBRIST_CASTLING[0];
  if (state.castlingRights.Q) hash ^= ZOBRIST_CASTLING[1];
  if (state.castlingRights.k) hash ^= ZOBRIST_CASTLING[2];
  if (state.castlingRights.q) hash ^= ZOBRIST_CASTLING[3];

  if (state.enPassantSquare !== null) {
    const file = state.enPassantSquare % 8;
    hash ^= ZOBRIST_EN_PASSANT[file];
  }

  if (state.turn === 'b') {
    hash ^= ZOBRIST_SIDE_TO_MOVE;
  }

  return hash;
}

initZobrist();

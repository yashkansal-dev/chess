import type { Piece, GameState, Color, Square, CastlingRights } from './types';
import { STARTING_FEN, SQUARES } from './constants';

export function createEmptyBoard(): Piece[] {
  return Array(SQUARES).fill(null);
}

export function squareToAlgebraic(square: Square): string {
  const file = String.fromCharCode(97 + (square % 8));
  const rank = Math.floor(square / 8) + 1;
  return `${file}${rank}`;
}

export function algebraicToSquare(algebraic: string): Square {
  const file = algebraic.charCodeAt(0) - 97;
  const rank = parseInt(algebraic[1]) - 1;
  return rank * 8 + file;
}

export function squareToCoords(square: Square): [number, number] {
  return [Math.floor(square / 8), square % 8];
}

export function coordsToSquare(rank: number, file: number): Square {
  return rank * 8 + file;
}

export function isValidSquare(square: Square): boolean {
  return square >= 0 && square < SQUARES;
}

export function getFile(square: Square): number {
  return square % 8;
}

export function getRank(square: Square): number {
  return Math.floor(square / 8);
}

export function isSameFile(sq1: Square, sq2: Square): boolean {
  return getFile(sq1) === getFile(sq2);
}

export function isSameRank(sq1: Square, sq2: Square): boolean {
  return getRank(sq1) === getRank(sq2);
}

export function createInitialGameState(): GameState {
  return parseFEN(STARTING_FEN);
}

export function parseFEN(fen: string): GameState {
  const parts = fen.split(' ');
  const board = createEmptyBoard();

  const rows = parts[0].split('/');
  for (let rank = 7; rank >= 0; rank--) {
    let file = 0;
    for (const char of rows[7 - rank]) {
      if (char >= '1' && char <= '8') {
        file += parseInt(char);
      } else {
        const color: Color = char === char.toUpperCase() ? 'w' : 'b';
        const type = char.toLowerCase() as Piece extends { type: infer T } ? T : never;
        board[rank * 8 + file] = { type, color };
        file++;
      }
    }
  }

  const turn = parts[1] === 'w' ? 'w' : 'b';

  const castlingRights: CastlingRights = {
    K: parts[2].includes('K'),
    Q: parts[2].includes('Q'),
    k: parts[2].includes('k'),
    q: parts[2].includes('q'),
  };

  const enPassantSquare = parts[3] === '-' ? null : algebraicToSquare(parts[3]);
  const halfMoveClock = parseInt(parts[4] || '0');
  const fullMoveNumber = parseInt(parts[5] || '1');

  return {
    board,
    turn,
    castlingRights,
    enPassantSquare,
    halfMoveClock,
    fullMoveNumber,
    moveHistory: [],
    positionHistory: [fen],
  };
}

export function boardToFEN(state: GameState): string {
  let fen = '';

  for (let rank = 7; rank >= 0; rank--) {
    let empty = 0;
    for (let file = 0; file < 8; file++) {
      const square = rank * 8 + file;
      const piece = state.board[square];

      if (piece === null) {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        const char = piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
        fen += char;
      }
    }
    if (empty > 0) {
      fen += empty;
    }
    if (rank > 0) {
      fen += '/';
    }
  }

  fen += ` ${state.turn}`;

  let castling = '';
  if (state.castlingRights.K) castling += 'K';
  if (state.castlingRights.Q) castling += 'Q';
  if (state.castlingRights.k) castling += 'k';
  if (state.castlingRights.q) castling += 'q';
  fen += ` ${castling || '-'}`;

  fen += ` ${state.enPassantSquare !== null ? squareToAlgebraic(state.enPassantSquare) : '-'}`;
  fen += ` ${state.halfMoveClock}`;
  fen += ` ${state.fullMoveNumber}`;

  return fen;
}

export function copyGameState(state: GameState): GameState {
  return {
    board: [...state.board],
    turn: state.turn,
    castlingRights: { ...state.castlingRights },
    enPassantSquare: state.enPassantSquare,
    halfMoveClock: state.halfMoveClock,
    fullMoveNumber: state.fullMoveNumber,
    moveHistory: [...state.moveHistory],
    positionHistory: [...state.positionHistory],
  };
}

export function getOpponentColor(color: Color): Color {
  return color === 'w' ? 'b' : 'w';
}

export function getPieceAt(board: Piece[], square: Square): Piece {
  return board[square];
}

export function setPieceAt(board: Piece[], square: Square, piece: Piece): void {
  board[square] = piece;
}

export function findKing(board: Piece[], color: Color): Square | null {
  for (let i = 0; i < SQUARES; i++) {
    const piece = board[i];
    if (piece && piece.type === 'k' && piece.color === color) {
      return i;
    }
  }
  return null;
}

export function getAllPieces(board: Piece[], color: Color): Square[] {
  const pieces: Square[] = [];
  for (let i = 0; i < SQUARES; i++) {
    const piece = board[i];
    if (piece && piece.color === color) {
      pieces.push(i);
    }
  }
  return pieces;
}

export function countMaterial(board: Piece[], color: Color): number {
  let material = 0;
  for (let i = 0; i < SQUARES; i++) {
    const piece = board[i];
    if (piece && piece.color === color) {
      if (piece.type === 'q') material += 9;
      else if (piece.type === 'r') material += 5;
      else if (piece.type === 'b' || piece.type === 'n') material += 3;
      else if (piece.type === 'p') material += 1;
    }
  }
  return material;
}

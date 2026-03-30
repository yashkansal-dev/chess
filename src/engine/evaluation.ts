import type { GameState, Color, Piece } from './types';
import {
  PIECE_VALUES,
  PAWN_PIECE_SQUARE_TABLE,
  KNIGHT_PIECE_SQUARE_TABLE,
  BISHOP_PIECE_SQUARE_TABLE,
  ROOK_PIECE_SQUARE_TABLE,
  QUEEN_PIECE_SQUARE_TABLE,
  KING_MIDDLE_GAME_TABLE,
  KING_END_GAME_TABLE,
  CHECKMATE_SCORE,
  STALEMATE_SCORE,
} from './constants';
import { getOpponentColor, countMaterial } from './board';
import { generateLegalMoves, isInCheck } from './rules';

function getPieceSquareValue(
  pieceType: string,
  square: number,
  color: Color,
  isEndgame: boolean
): number {
  const adjustedSquare = color === 'w' ? square : 63 - square;

  switch (pieceType) {
    case 'p':
      return PAWN_PIECE_SQUARE_TABLE[adjustedSquare];
    case 'n':
      return KNIGHT_PIECE_SQUARE_TABLE[adjustedSquare];
    case 'b':
      return BISHOP_PIECE_SQUARE_TABLE[adjustedSquare];
    case 'r':
      return ROOK_PIECE_SQUARE_TABLE[adjustedSquare];
    case 'q':
      return QUEEN_PIECE_SQUARE_TABLE[adjustedSquare];
    case 'k':
      return isEndgame
        ? KING_END_GAME_TABLE[adjustedSquare]
        : KING_MIDDLE_GAME_TABLE[adjustedSquare];
    default:
      return 0;
  }
}

function evaluateMaterial(board: Piece[], color: Color): number {
  let material = 0;

  for (let i = 0; i < 64; i++) {
    const piece = board[i];
    if (!piece || piece.color !== color) continue;

    material += PIECE_VALUES[piece.type];
  }

  return material;
}

function evaluatePositional(state: GameState, color: Color, isEndgame: boolean): number {
  let positional = 0;

  for (let i = 0; i < 64; i++) {
    const piece = state.board[i];
    if (!piece || piece.color !== color) continue;

    positional += getPieceSquareValue(piece.type, i, color, isEndgame);
  }

  return positional;
}

function evaluateMobility(state: GameState, color: Color): number {
  const tempState = { ...state, turn: color };
  const legalMoves = generateLegalMoves(tempState);
  return legalMoves.length * 10;
}

function evaluateKingSafety(state: GameState, color: Color): number {
  let safety = 0;

  if (isInCheck(state, color)) {
    safety -= 50;
  }

  return safety;
}

function evaluatePawnStructure(state: GameState, color: Color): number {
  let structure = 0;
  const pawns: number[] = [];

  for (let i = 0; i < 64; i++) {
    const piece = state.board[i];
    if (piece && piece.type === 'p' && piece.color === color) {
      pawns.push(i);
    }
  }

  const fileCount = new Array(8).fill(0);
  for (const pawnSquare of pawns) {
    const file = pawnSquare % 8;
    fileCount[file]++;
  }

  for (const count of fileCount) {
    if (count > 1) {
      structure -= 10 * (count - 1);
    }
  }

  for (let i = 0; i < pawns.length; i++) {
    const file = pawns[i] % 8;
    let isolated = true;

    for (let j = 0; j < pawns.length; j++) {
      if (i === j) continue;
      const otherFile = pawns[j] % 8;
      if (Math.abs(file - otherFile) === 1) {
        isolated = false;
        break;
      }
    }

    if (isolated) {
      structure -= 15;
    }
  }

  return structure;
}

export function evaluate(state: GameState): number {
  const legalMoves = generateLegalMoves(state);

  if (legalMoves.length === 0) {
    if (isInCheck(state, state.turn)) {
      return state.turn === 'w' ? -CHECKMATE_SCORE : CHECKMATE_SCORE;
    } else {
      return STALEMATE_SCORE;
    }
  }

  const whiteMaterial = countMaterial(state.board, 'w');
  const blackMaterial = countMaterial(state.board, 'b');
  const totalMaterial = whiteMaterial + blackMaterial;
  const isEndgame = totalMaterial < 20;

  const whiteMaterialScore = evaluateMaterial(state.board, 'w');
  const blackMaterialScore = evaluateMaterial(state.board, 'b');

  const whitePositional = evaluatePositional(state, 'w', isEndgame);
  const blackPositional = evaluatePositional(state, 'b', isEndgame);

  const whiteMobility = evaluateMobility(state, 'w');
  const blackMobility = evaluateMobility(state, 'b');

  const whiteKingSafety = evaluateKingSafety(state, 'w');
  const blackKingSafety = evaluateKingSafety(state, 'b');

  const whitePawnStructure = evaluatePawnStructure(state, 'w');
  const blackPawnStructure = evaluatePawnStructure(state, 'b');

  const whiteScore =
    whiteMaterialScore * 0.6 +
    whitePositional * 0.2 +
    whiteMobility * 0.1 +
    whiteKingSafety * 0.05 +
    whitePawnStructure * 0.05;

  const blackScore =
    blackMaterialScore * 0.6 +
    blackPositional * 0.2 +
    blackMobility * 0.1 +
    blackKingSafety * 0.05 +
    blackPawnStructure * 0.05;

  return whiteScore - blackScore;
}

export function evaluateForColor(state: GameState, color: Color): number {
  const score = evaluate(state);
  return color === 'w' ? score : -score;
}

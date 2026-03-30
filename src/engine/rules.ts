import type { Move, GameState, Color, Square } from './types';
import {
  copyGameState,
  findKing,
  getOpponentColor,
  getPieceAt,
  boardToFEN,
} from './board';
import { generatePseudoLegalMoves, getSquaresAttackedBy } from './moveGenerator';

export function isInCheck(state: GameState, color: Color): boolean {
  const kingSquare = findKing(state.board, color);
  if (kingSquare === null) return false;

  const opponentColor = getOpponentColor(color);
  const attackedSquares = getSquaresAttackedBy(state.board, opponentColor);

  return attackedSquares.has(kingSquare);
}

export function isLegalMove(state: GameState, move: Move): boolean {
  const newState = applyMove(state, move);

  if (move.castling) {
    const kingSquare = move.from;
    const isKingSide = move.castling === 'K' || move.castling === 'k';
    const passThroughSquare = isKingSide ? kingSquare + 1 : kingSquare - 1;

    if (isInCheck(state, state.turn)) {
      return false;
    }

    const testState1 = copyGameState(state);
    testState1.board[passThroughSquare] = testState1.board[kingSquare];
    testState1.board[kingSquare] = null;

    if (isInCheck(testState1, state.turn)) {
      return false;
    }
  }

  return !isInCheck(newState, state.turn);
}

export function generateLegalMoves(state: GameState): Move[] {
  const pseudoLegalMoves = generatePseudoLegalMoves(state);
  return pseudoLegalMoves.filter(move => isLegalMove(state, move));
}

export function applyMove(state: GameState, move: Move): GameState {
  const newState = copyGameState(state);
  const { board } = newState;

  board[move.to] = board[move.from];
  board[move.from] = null;

  if (move.promotion && board[move.to]) {
    board[move.to]!.type = move.promotion;
  }

  if (move.enPassant) {
    const capturedPawnSquare = move.color === 'w' ? move.to - 8 : move.to + 8;
    board[capturedPawnSquare] = null;
  }

  if (move.castling) {
    if (move.castling === 'K') {
      board[5] = board[7];
      board[7] = null;
    } else if (move.castling === 'Q') {
      board[3] = board[0];
      board[0] = null;
    } else if (move.castling === 'k') {
      board[61] = board[63];
      board[63] = null;
    } else if (move.castling === 'q') {
      board[59] = board[56];
      board[56] = null;
    }
  }

  if (move.piece === 'p' && Math.abs(move.to - move.from) === 16) {
    newState.enPassantSquare = move.color === 'w' ? move.from + 8 : move.from - 8;
  } else {
    newState.enPassantSquare = null;
  }

  if (move.piece === 'k') {
    if (move.color === 'w') {
      newState.castlingRights.K = false;
      newState.castlingRights.Q = false;
    } else {
      newState.castlingRights.k = false;
      newState.castlingRights.q = false;
    }
  }

  if (move.piece === 'r') {
    if (move.from === 0) newState.castlingRights.Q = false;
    else if (move.from === 7) newState.castlingRights.K = false;
    else if (move.from === 56) newState.castlingRights.q = false;
    else if (move.from === 63) newState.castlingRights.k = false;
  }

  if (move.to === 0) newState.castlingRights.Q = false;
  else if (move.to === 7) newState.castlingRights.K = false;
  else if (move.to === 56) newState.castlingRights.q = false;
  else if (move.to === 63) newState.castlingRights.k = false;

  if (move.captured || move.piece === 'p') {
    newState.halfMoveClock = 0;
  } else {
    newState.halfMoveClock++;
  }

  if (move.color === 'b') {
    newState.fullMoveNumber++;
  }

  newState.turn = getOpponentColor(move.color);

  const inCheck = isInCheck(newState, newState.turn);
  if (inCheck) {
    move.check = true;
    const legalMoves = generateLegalMoves(newState);
    if (legalMoves.length === 0) {
      move.checkmate = true;
    }
  }

  newState.moveHistory.push(move);
  newState.positionHistory.push(boardToFEN(newState));

  return newState;
}

export function isCheckmate(state: GameState): boolean {
  if (!isInCheck(state, state.turn)) {
    return false;
  }
  return generateLegalMoves(state).length === 0;
}

export function isStalemate(state: GameState): boolean {
  if (isInCheck(state, state.turn)) {
    return false;
  }
  return generateLegalMoves(state).length === 0;
}

export function isThreefoldRepetition(state: GameState): boolean {
  const currentPosition = boardToFEN(state).split(' ')[0];
  let count = 0;

  for (const fen of state.positionHistory) {
    if (fen.split(' ')[0] === currentPosition) {
      count++;
      if (count >= 3) {
        return true;
      }
    }
  }

  return false;
}

export function isFiftyMoveRule(state: GameState): boolean {
  return state.halfMoveClock >= 100;
}

export function isInsufficientMaterial(state: GameState): boolean {
  const pieces = state.board.filter(p => p !== null);

  if (pieces.length === 2) {
    return true;
  }

  if (pieces.length === 3) {
    const hasKnight = pieces.some(p => p!.type === 'n');
    const hasBishop = pieces.some(p => p!.type === 'b');
    if (hasKnight || hasBishop) {
      return true;
    }
  }

  if (pieces.length === 4) {
    const bishops = pieces.filter(p => p!.type === 'b');
    if (bishops.length === 2) {
      const bishopSquares = state.board
        .map((p, i) => (p && p.type === 'b' ? i : -1))
        .filter(i => i !== -1);

      if (bishopSquares.length === 2) {
        const [sq1, sq2] = bishopSquares;
        const sq1Color = (Math.floor(sq1 / 8) + (sq1 % 8)) % 2;
        const sq2Color = (Math.floor(sq2 / 8) + (sq2 % 8)) % 2;

        if (sq1Color === sq2Color) {
          return true;
        }
      }
    }
  }

  return false;
}

export function isDraw(state: GameState): boolean {
  return (
    isStalemate(state) ||
    isThreefoldRepetition(state) ||
    isFiftyMoveRule(state) ||
    isInsufficientMaterial(state)
  );
}

export function getGameResult(state: GameState): 'ongoing' | 'checkmate' | 'stalemate' | 'draw' {
  if (isCheckmate(state)) return 'checkmate';
  if (isDraw(state)) return state.halfMoveClock >= 100 ? 'draw' : isStalemate(state) ? 'stalemate' : 'draw';
  return 'ongoing';
}

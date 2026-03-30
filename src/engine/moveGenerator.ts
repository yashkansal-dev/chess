import type { Move, Piece, Square, Color, GameState, PieceType } from './types';
import {
  KNIGHT_OFFSETS,
  BISHOP_DIRECTIONS,
  ROOK_DIRECTIONS,
  QUEEN_KING_DIRECTIONS,
} from './constants';
import {
  isValidSquare,
  getFile,
  getRank,
  getPieceAt,
  getOpponentColor,
} from './board';

export function generatePseudoLegalMoves(state: GameState): Move[] {
  const moves: Move[] = [];
  const { board, turn } = state;

  for (let from = 0; from < 64; from++) {
    const piece = board[from];
    if (!piece || piece.color !== turn) continue;

    switch (piece.type) {
      case 'p':
        generatePawnMoves(state, from, moves);
        break;
      case 'n':
        generateKnightMoves(state, from, moves);
        break;
      case 'b':
        generateBishopMoves(state, from, moves);
        break;
      case 'r':
        generateRookMoves(state, from, moves);
        break;
      case 'q':
        generateQueenMoves(state, from, moves);
        break;
      case 'k':
        generateKingMoves(state, from, moves);
        break;
    }
  }

  generateCastlingMoves(state, moves);

  return moves;
}

function generatePawnMoves(state: GameState, from: Square, moves: Move[]): void {
  const { board, turn, enPassantSquare } = state;
  const piece = board[from];
  if (!piece || piece.type !== 'p') return;

  const direction = turn === 'w' ? 8 : -8;
  const startRank = turn === 'w' ? 1 : 6;
  const promotionRank = turn === 'w' ? 7 : 0;

  const oneStep = from + direction;
  if (isValidSquare(oneStep) && !board[oneStep]) {
    if (getRank(oneStep) === promotionRank) {
      addPromotionMoves(from, oneStep, piece.color, moves);
    } else {
      moves.push({
        from,
        to: oneStep,
        piece: 'p',
        color: piece.color,
      });

      if (getRank(from) === startRank) {
        const twoStep = from + direction * 2;
        if (isValidSquare(twoStep) && !board[twoStep]) {
          moves.push({
            from,
            to: twoStep,
            piece: 'p',
            color: piece.color,
          });
        }
      }
    }
  }

  const captureOffsets = turn === 'w' ? [7, 9] : [-9, -7];
  for (const offset of captureOffsets) {
    const to = from + offset;
    if (!isValidSquare(to)) continue;

    const fileDiff = Math.abs(getFile(to) - getFile(from));
    if (fileDiff !== 1) continue;

    const target = board[to];
    if (target && target.color !== turn) {
      if (getRank(to) === promotionRank) {
        addPromotionMoves(from, to, piece.color, moves, target.type);
      } else {
        moves.push({
          from,
          to,
          piece: 'p',
          color: piece.color,
          captured: target.type,
        });
      }
    } else if (to === enPassantSquare) {
      moves.push({
        from,
        to,
        piece: 'p',
        color: piece.color,
        captured: 'p',
        enPassant: true,
      });
    }
  }
}

function addPromotionMoves(
  from: Square,
  to: Square,
  color: Color,
  moves: Move[],
  captured?: PieceType
): void {
  const promotions: PieceType[] = ['q', 'r', 'b', 'n'];
  for (const promotion of promotions) {
    moves.push({
      from,
      to,
      piece: 'p',
      color,
      captured,
      promotion,
    });
  }
}

function generateKnightMoves(state: GameState, from: Square, moves: Move[]): void {
  const { board, turn } = state;
  const piece = board[from];
  if (!piece || piece.type !== 'n') return;

  const fromFile = getFile(from);
  const fromRank = getRank(from);

  for (const offset of KNIGHT_OFFSETS) {
    const to = from + offset;
    if (!isValidSquare(to)) continue;

    const toFile = getFile(to);
    const toRank = getRank(to);

    const fileDiff = Math.abs(toFile - fromFile);
    const rankDiff = Math.abs(toRank - fromRank);

    if ((fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2)) {
      const target = board[to];
      if (!target || target.color !== turn) {
        moves.push({
          from,
          to,
          piece: 'n',
          color: piece.color,
          captured: target?.type,
        });
      }
    }
  }
}

function generateBishopMoves(state: GameState, from: Square, moves: Move[]): void {
  const piece = state.board[from];
  if (!piece || piece.type !== 'b') return;
  generateSlidingMoves(state, from, BISHOP_DIRECTIONS, 'b', moves);
}

function generateRookMoves(state: GameState, from: Square, moves: Move[]): void {
  const piece = state.board[from];
  if (!piece || piece.type !== 'r') return;
  generateSlidingMoves(state, from, ROOK_DIRECTIONS, 'r', moves);
}

function generateQueenMoves(state: GameState, from: Square, moves: Move[]): void {
  const piece = state.board[from];
  if (!piece || piece.type !== 'q') return;
  generateSlidingMoves(state, from, QUEEN_KING_DIRECTIONS, 'q', moves);
}

function generateKingMoves(state: GameState, from: Square, moves: Move[]): void {
  const { board, turn } = state;
  const piece = board[from];
  if (!piece || piece.type !== 'k') return;

  for (const direction of QUEEN_KING_DIRECTIONS) {
    const to = from + direction;
    if (!isValidSquare(to)) continue;

    const fileDiff = Math.abs(getFile(to) - getFile(from));
    if (fileDiff > 1) continue;

    const target = board[to];
    if (!target || target.color !== turn) {
      moves.push({
        from,
        to,
        piece: 'k',
        color: piece.color,
        captured: target?.type,
      });
    }
  }
}

function generateSlidingMoves(
  state: GameState,
  from: Square,
  directions: number[],
  pieceType: PieceType,
  moves: Move[]
): void {
  const { board, turn } = state;
  const piece = board[from];
  if (!piece) return;

  for (const direction of directions) {
    let to = from + direction;
    let prevFile = getFile(from);

    while (isValidSquare(to)) {
      const currFile = getFile(to);

      if (Math.abs(direction) === 1 && Math.abs(currFile - prevFile) !== 1) {
        break;
      }
      if ((direction === 7 || direction === -7) && Math.abs(currFile - prevFile) !== 1) {
        break;
      }
      if ((direction === 9 || direction === -9) && Math.abs(currFile - prevFile) !== 1) {
        break;
      }

      const target = board[to];

      if (target) {
        if (target.color !== turn) {
          moves.push({
            from,
            to,
            piece: pieceType,
            color: piece.color,
            captured: target.type,
          });
        }
        break;
      }

      moves.push({
        from,
        to,
        piece: pieceType,
        color: piece.color,
      });

      prevFile = currFile;
      to += direction;
    }
  }
}

function generateCastlingMoves(state: GameState, moves: Move[]): void {
  const { board, turn, castlingRights } = state;

  if (turn === 'w') {
    if (castlingRights.K) {
      if (!board[5] && !board[6]) {
        moves.push({
          from: 4,
          to: 6,
          piece: 'k',
          color: 'w',
          castling: 'K',
        });
      }
    }

    if (castlingRights.Q) {
      if (!board[1] && !board[2] && !board[3]) {
        moves.push({
          from: 4,
          to: 2,
          piece: 'k',
          color: 'w',
          castling: 'Q',
        });
      }
    }
  } else {
    if (castlingRights.k) {
      if (!board[61] && !board[62]) {
        moves.push({
          from: 60,
          to: 62,
          piece: 'k',
          color: 'b',
          castling: 'k',
        });
      }
    }

    if (castlingRights.q) {
      if (!board[57] && !board[58] && !board[59]) {
        moves.push({
          from: 60,
          to: 58,
          piece: 'k',
          color: 'b',
          castling: 'q',
        });
      }
    }
  }
}

export function getSquaresAttackedBy(board: Piece[], color: Color): Set<Square> {
  const attacked = new Set<Square>();

  for (let from = 0; from < 64; from++) {
    const piece = board[from];
    if (!piece || piece.color !== color) continue;

    switch (piece.type) {
      case 'p': {
        const direction = color === 'w' ? 8 : -8;
        const captureOffsets = color === 'w' ? [7, 9] : [-9, -7];
        for (const offset of captureOffsets) {
          const to = from + offset;
          if (isValidSquare(to)) {
            const fileDiff = Math.abs(getFile(to) - getFile(from));
            if (fileDiff === 1) {
              attacked.add(to);
            }
          }
        }
        break;
      }
      case 'n': {
        const fromFile = getFile(from);
        const fromRank = getRank(from);
        for (const offset of KNIGHT_OFFSETS) {
          const to = from + offset;
          if (isValidSquare(to)) {
            const toFile = getFile(to);
            const toRank = getRank(to);
            const fileDiff = Math.abs(toFile - fromFile);
            const rankDiff = Math.abs(toRank - fromRank);
            if ((fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2)) {
              attacked.add(to);
            }
          }
        }
        break;
      }
      case 'b': {
        for (const direction of BISHOP_DIRECTIONS) {
          let to = from + direction;
          let prevFile = getFile(from);
          while (isValidSquare(to)) {
            const currFile = getFile(to);
            if (Math.abs(currFile - prevFile) !== 1) break;
            attacked.add(to);
            if (board[to]) break;
            prevFile = currFile;
            to += direction;
          }
        }
        break;
      }
      case 'r': {
        for (const direction of ROOK_DIRECTIONS) {
          let to = from + direction;
          let prevFile = getFile(from);
          while (isValidSquare(to)) {
            const currFile = getFile(to);
            if (Math.abs(direction) === 1 && Math.abs(currFile - prevFile) !== 1) break;
            attacked.add(to);
            if (board[to]) break;
            prevFile = currFile;
            to += direction;
          }
        }
        break;
      }
      case 'q': {
        for (const direction of QUEEN_KING_DIRECTIONS) {
          let to = from + direction;
          let prevFile = getFile(from);
          while (isValidSquare(to)) {
            const currFile = getFile(to);
            if (Math.abs(direction) === 1 && Math.abs(currFile - prevFile) !== 1) break;
            if ((direction === 7 || direction === -7) && Math.abs(currFile - prevFile) !== 1) break;
            if ((direction === 9 || direction === -9) && Math.abs(currFile - prevFile) !== 1) break;
            attacked.add(to);
            if (board[to]) break;
            prevFile = currFile;
            to += direction;
          }
        }
        break;
      }
      case 'k': {
        for (const direction of QUEEN_KING_DIRECTIONS) {
          const to = from + direction;
          if (isValidSquare(to)) {
            const fileDiff = Math.abs(getFile(to) - getFile(from));
            if (fileDiff <= 1) {
              attacked.add(to);
            }
          }
        }
        break;
      }
    }
  }

  return attacked;
}

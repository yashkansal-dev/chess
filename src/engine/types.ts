export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';
export type Piece = {
  type: PieceType;
  color: Color;
} | null;

export type Square = number;

export type Move = {
  from: Square;
  to: Square;
  piece: PieceType;
  color: Color;
  captured?: PieceType;
  promotion?: PieceType;
  castling?: 'K' | 'Q' | 'k' | 'q';
  enPassant?: boolean;
  check?: boolean;
  checkmate?: boolean;
};

export type CastlingRights = {
  K: boolean;
  Q: boolean;
  k: boolean;
  q: boolean;
};

export type GameState = {
  board: Piece[];
  turn: Color;
  castlingRights: CastlingRights;
  enPassantSquare: Square | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  moveHistory: Move[];
  positionHistory: string[];
};

export type EvaluationResult = {
  score: number;
  bestMove: Move | null;
  depth: number;
  nodesSearched: number;
  principalVariation: Move[];
  timeMs: number;
};

export type Difficulty = 'easy' | 'medium' | 'hard';

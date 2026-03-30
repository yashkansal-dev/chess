import type { Piece as PieceType } from '../engine/types';
import { PIECE_SYMBOLS } from '../engine/constants';

interface PieceProps {
  piece: PieceType;
  isDragging?: boolean;
}

export function Piece({ piece, isDragging }: PieceProps) {
  if (!piece) return null;

  const symbol = piece.color === 'w'
    ? PIECE_SYMBOLS[piece.type.toUpperCase()]
    : PIECE_SYMBOLS[piece.type];

  return (
    <div
      className={`text-5xl select-none pointer-events-none ${isDragging ? 'opacity-50' : ''}`}
      style={{
        fontSize: 'clamp(2rem, 8vw, 4rem)',
        lineHeight: 1,
      }}
    >
      {symbol}
    </div>
  );
}

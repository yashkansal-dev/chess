import type { ReactNode } from 'react';

interface SquareProps {
  square: number;
  isLight: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMoveSquare: boolean;
  isInCheck: boolean;
  onClick: () => void;
  children?: ReactNode;
}

export function Square({
  square,
  isLight,
  isSelected,
  isLegalMove,
  isLastMoveSquare,
  isInCheck,
  onClick,
  children,
}: SquareProps) {
  const file = String.fromCharCode(97 + (square % 8));
  const rank = Math.floor(square / 8) + 1;

  let backgroundColor = isLight ? '#f0d9b5' : '#b58863';

  if (isSelected) {
    backgroundColor = isLight ? '#baca44' : '#a4b044';
  } else if (isLastMoveSquare) {
    backgroundColor = isLight ? '#cdd26a' : '#aaa23a';
  } else if (isInCheck) {
    backgroundColor = '#ff6b6b';
  }

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer transition-colors"
      style={{
        backgroundColor,
        width: '100%',
        height: '100%',
      }}
    >
      {children}

      {isLegalMove && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '30%',
            height: '30%',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }}
        />
      )}

      {square % 8 === 0 && (
        <div
          className="absolute left-1 bottom-1 text-xs font-semibold pointer-events-none"
          style={{ color: isLight ? '#b58863' : '#f0d9b5' }}
        >
          {rank}
        </div>
      )}

      {Math.floor(square / 8) === 0 && (
        <div
          className="absolute right-1 bottom-1 text-xs font-semibold pointer-events-none"
          style={{ color: isLight ? '#b58863' : '#f0d9b5' }}
        >
          {file}
        </div>
      )}
    </div>
  );
}

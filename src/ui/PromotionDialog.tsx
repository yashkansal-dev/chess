import type { Color, PieceType } from '../engine/types';
import { PIECE_SYMBOLS } from '../engine/constants';

interface PromotionDialogProps {
  color: Color;
  onSelect: (piece: PieceType) => void;
}

export function PromotionDialog({ color, onSelect }: PromotionDialogProps) {
  const pieces: PieceType[] = ['q', 'r', 'b', 'n'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-center text-gray-800">Choose Promotion</h3>
        <div className="flex gap-4">
          {pieces.map(piece => {
            const symbol = color === 'w'
              ? PIECE_SYMBOLS[piece.toUpperCase()]
              : PIECE_SYMBOLS[piece];

            return (
              <button
                key={piece}
                onClick={() => onSelect(piece)}
                className="w-20 h-20 flex items-center justify-center text-6xl hover:bg-gray-100 rounded-lg transition-colors border-2 border-gray-200 hover:border-blue-500"
              >
                {symbol}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

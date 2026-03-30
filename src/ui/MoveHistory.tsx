import type { Move } from '../engine/types';
import { squareToAlgebraic } from '../engine/board';

interface MoveHistoryProps {
  moves: Move[];
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  const formatMove = (move: Move): string => {
    let notation = '';

    if (move.castling) {
      return move.castling === 'K' || move.castling === 'k' ? 'O-O' : 'O-O-O';
    }

    if (move.piece !== 'p') {
      notation += move.piece.toUpperCase();
    }

    if (move.captured) {
      if (move.piece === 'p') {
        notation += squareToAlgebraic(move.from)[0];
      }
      notation += 'x';
    }

    notation += squareToAlgebraic(move.to);

    if (move.promotion) {
      notation += '=' + move.promotion.toUpperCase();
    }

    if (move.checkmate) {
      notation += '#';
    } else if (move.check) {
      notation += '+';
    }

    return notation;
  };

  const movePairs: Array<[Move, Move?]> = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push([moves[i], moves[i + 1]]);
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
      <h3 className="text-sm font-bold mb-3 text-gray-700">Move History</h3>
      <div className="max-h-64 overflow-y-auto">
        {movePairs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No moves yet</p>
        ) : (
          <div className="space-y-1">
            {movePairs.map(([whiteMove, blackMove], index) => (
              <div key={index} className="flex gap-2 text-sm">
                <span className="w-8 text-gray-500 font-medium">{index + 1}.</span>
                <span className="w-16 font-mono">{formatMove(whiteMove)}</span>
                {blackMove && (
                  <span className="w-16 font-mono">{formatMove(blackMove)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

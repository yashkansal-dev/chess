import { Trophy, Handshake, AlertCircle } from 'lucide-react';
import type { GameState } from '../engine/types';
import { getGameResult, isInCheck } from '../engine/rules';

interface GameStatusProps {
  gameState: GameState;
}

export function GameStatus({ gameState }: GameStatusProps) {
  const result = getGameResult(gameState);
  const inCheck = isInCheck(gameState, gameState.turn);

  const getStatusMessage = () => {
    if (result === 'checkmate') {
      const winner = gameState.turn === 'w' ? 'Black' : 'White';
      return {
        message: `Checkmate! ${winner} wins!`,
        icon: <Trophy size={20} className="text-yellow-500" />,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200',
      };
    }

    if (result === 'stalemate') {
      return {
        message: 'Stalemate! Game is a draw.',
        icon: <Handshake size={20} className="text-blue-500" />,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200',
      };
    }

    if (result === 'draw') {
      return {
        message: 'Draw! Game ended.',
        icon: <Handshake size={20} className="text-blue-500" />,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200',
      };
    }

    if (inCheck) {
      return {
        message: `${gameState.turn === 'w' ? 'White' : 'Black'} is in check!`,
        icon: <AlertCircle size={20} className="text-red-500" />,
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
      };
    }

    return {
      message: `${gameState.turn === 'w' ? 'White' : 'Black'} to move`,
      icon: null,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200',
    };
  };

  const status = getStatusMessage();

  return (
    <div
      className={`${status.bgColor} ${status.textColor} rounded-lg p-4 border-2 ${status.borderColor} w-full max-w-md`}
    >
      <div className="flex items-center justify-center gap-3">
        {status.icon}
        <span className="font-bold text-lg">{status.message}</span>
      </div>
    </div>
  );
}

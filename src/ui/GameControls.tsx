import { RotateCcw, SkipBack, SkipForward, Download, Upload } from 'lucide-react';
import type { Difficulty } from '../engine/types';

interface GameControlsProps {
  onRestart: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onFlip: () => void;
  onLoadFEN: (fen: string) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  difficulty: Difficulty;
  canUndo: boolean;
  canRedo: boolean;
  flipped: boolean;
}

export function GameControls({
  onRestart,
  onUndo,
  onRedo,
  onFlip,
  onLoadFEN,
  onDifficultyChange,
  difficulty,
  canUndo,
  canRedo,
  flipped,
}: GameControlsProps) {
  const handleLoadFEN = () => {
    const fen = prompt('Enter FEN string:');
    if (fen) {
      onLoadFEN(fen);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-sm font-bold mb-3 text-gray-700">Game Controls</h3>
        <div className="flex gap-2">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RotateCcw size={18} />
            <span className="text-sm font-medium">Restart</span>
          </button>

          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward size={18} />
          </button>

          <button
            onClick={onFlip}
            className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <RotateCcw size={18} className="rotate-90" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-sm font-bold mb-3 text-gray-700">AI Difficulty</h3>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(level => (
            <button
              key={level}
              onClick={() => onDifficultyChange(level)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                difficulty === level
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-sm font-bold mb-3 text-gray-700">Advanced</h3>
        <button
          onClick={handleLoadFEN}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <Upload size={18} />
          <span className="text-sm font-medium">Load FEN</span>
        </button>
      </div>
    </div>
  );
}

import { Activity, Zap, TrendingUp } from 'lucide-react';
import type { EvaluationResult } from '../engine/types';
import { squareToAlgebraic } from '../engine/board';

interface EngineAnalysisProps {
  evaluation: EvaluationResult | null;
  isThinking: boolean;
}

export function EngineAnalysis({ evaluation, isThinking }: EngineAnalysisProps) {
  const formatScore = (score: number): string => {
    if (Math.abs(score) > 10000) {
      return score > 0 ? '+M' : '-M';
    }
    return (score / 100).toFixed(2);
  };

  const getEvaluationBar = (score: number): number => {
    const clampedScore = Math.max(-1000, Math.min(1000, score));
    return ((clampedScore + 1000) / 2000) * 100;
  };

  const formatMove = (move: typeof evaluation extends null ? never : EvaluationResult['bestMove']) => {
    if (!move) return 'None';

    return `${squareToAlgebraic(move.from)}-${squareToAlgebraic(move.to)}${
      move.promotion ? `=${move.promotion.toUpperCase()}` : ''
    }`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
      <h3 className="text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
        <Activity size={16} />
        Engine Analysis
      </h3>

      {isThinking ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : evaluation ? (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600">Evaluation</span>
              <span className="text-lg font-bold text-gray-800">
                {formatScore(evaluation.score)}
              </span>
            </div>
            <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gray-200 to-white transition-all duration-500"
                style={{ width: `${getEvaluationBar(evaluation.score)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Black</span>
              <span>White</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-blue-600" />
                <span className="text-xs text-gray-600">Best Move</span>
              </div>
              <span className="text-sm font-mono font-bold text-gray-800">
                {formatMove(evaluation.bestMove)}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-green-600" />
                <span className="text-xs text-gray-600">Depth</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{evaluation.depth}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-600 block mb-1">Nodes</span>
              <span className="text-sm font-bold text-gray-800">
                {evaluation.nodesSearched.toLocaleString()}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-600 block mb-1">Time</span>
              <span className="text-sm font-bold text-gray-800">{evaluation.timeMs}ms</span>
            </div>
          </div>

          {evaluation.nodesSearched > 0 && evaluation.timeMs > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <span className="text-xs text-blue-700 block mb-1">Nodes/Second</span>
              <span className="text-sm font-bold text-blue-900">
                {Math.round((evaluation.nodesSearched / evaluation.timeMs) * 1000).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-sm text-gray-500">
          No analysis available
        </div>
      )}
    </div>
  );
}

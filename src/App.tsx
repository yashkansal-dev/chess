import { useState, useEffect } from 'react';
import type { GameState, Move, EvaluationResult, Difficulty } from './engine/types';
import { createInitialGameState, parseFEN, copyGameState } from './engine/board';
import { applyMove, getGameResult } from './engine/rules';
import { searchWithIterativeDeepening } from './engine/iterativeDeepening';
import { DIFFICULTY_DEPTHS } from './engine/constants';
import { Board } from './ui/Board';
import { GameControls } from './ui/GameControls';
import { GameStatus } from './ui/GameStatus';
import { MoveHistory } from './ui/MoveHistory';
import { EngineAnalysis } from './ui/EngineAnalysis';

function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [stateHistory, setStateHistory] = useState<GameState[]>([createInitialGameState()]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [playerColor] = useState<'w' | 'b'>('w');

  const gameResult = getGameResult(gameState);

  useEffect(() => {
    document.title = 'ChessX - Browser Chess Engine';
  }, []);

  useEffect(() => {
    if (gameState.turn !== playerColor && gameResult === 'ongoing' && !isAiThinking) {
      makeAiMove();
    }
  }, [gameState.turn, gameResult]);

  const makeAiMove = async () => {
    setIsAiThinking(true);

    setTimeout(() => {
      const depth = DIFFICULTY_DEPTHS[difficulty];
      const timeLimit = difficulty === 'easy' ? 500 : difficulty === 'medium' ? 2000 : 5000;

      const result = searchWithIterativeDeepening(gameState, depth, timeLimit);
      setEvaluation(result);

      if (result.bestMove) {
        handleMove(result.bestMove);
      }

      setIsAiThinking(false);
    }, 300);
  };

  const handleMove = (move: Move) => {
    const newState = applyMove(gameState, move);

    const newHistory = stateHistory.slice(0, historyIndex + 1);
    newHistory.push(newState);

    setGameState(newState);
    setStateHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    if (newState.turn === playerColor) {
      setTimeout(() => {
        const depth = DIFFICULTY_DEPTHS[difficulty];
        const timeLimit = difficulty === 'easy' ? 500 : difficulty === 'medium' ? 2000 : 5000;
        const result = searchWithIterativeDeepening(newState, depth, timeLimit);
        setEvaluation(result);
      }, 100);
    }
  };

  const handleRestart = () => {
    const initialState = createInitialGameState();
    setGameState(initialState);
    setStateHistory([initialState]);
    setHistoryIndex(0);
    setEvaluation(null);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setGameState(stateHistory[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < stateHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setGameState(stateHistory[newIndex]);
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleLoadFEN = (fen: string) => {
    try {
      const newState = parseFEN(fen);
      setGameState(newState);
      setStateHistory([newState]);
      setHistoryIndex(0);
      setEvaluation(null);
    } catch (error) {
      alert('Invalid FEN string');
    }
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            ChessX
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            Browser-Based Chess Engine with AI • Minimax + Alpha-Beta Pruning
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          <div className="flex flex-col gap-6 items-center">
            <GameStatus gameState={gameState} />
            <Board
              gameState={gameState}
              onMove={handleMove}
              flipped={flipped}
              disabled={isAiThinking || gameState.turn !== playerColor || gameResult !== 'ongoing'}
            />
          </div>

          <div className="flex flex-col gap-6 items-center lg:items-start w-full lg:w-auto">
            <GameControls
              onRestart={handleRestart}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onFlip={handleFlip}
              onLoadFEN={handleLoadFEN}
              onDifficultyChange={handleDifficultyChange}
              difficulty={difficulty}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < stateHistory.length - 1}
              flipped={flipped}
            />

            <EngineAnalysis evaluation={evaluation} isThinking={isAiThinking} />

            <MoveHistory moves={gameState.moveHistory} />
          </div>
        </div>

        <footer className="text-center mt-12 text-slate-400 text-sm">
          <p>
            Built with React + TypeScript • No Chess Libraries • Custom AI Engine
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

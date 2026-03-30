import { useState } from 'react';
import type { GameState, Move, Square as SquareType, PieceType } from '../engine/types';
import { Square } from './Square';
import { Piece } from './Piece';
import { PromotionDialog } from './PromotionDialog';
import { generateLegalMoves, applyMove, isInCheck } from '../engine/rules';
import { findKing } from '../engine/board';

interface BoardProps {
  gameState: GameState;
  onMove: (move: Move) => void;
  flipped?: boolean;
  disabled?: boolean;
}

export function Board({ gameState, onMove, flipped = false, disabled = false }: BoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<SquareType | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<Move | null>(null);

  const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
  const kingSquare = findKing(gameState.board, gameState.turn);
  const inCheck = kingSquare !== null && isInCheck(gameState, gameState.turn);

  const handleSquareClick = (square: SquareType) => {
    if (disabled) return;

    const piece = gameState.board[square];

    if (selectedSquare === null) {
      if (piece && piece.color === gameState.turn) {
        setSelectedSquare(square);
        const moves = generateLegalMoves(gameState).filter(m => m.from === square);
        setLegalMoves(moves);
      }
    } else {
      const move = legalMoves.find(m => m.to === square);

      if (move) {
        const needsPromotion =
          move.piece === 'p' &&
          (Math.floor(move.to / 8) === 7 || Math.floor(move.to / 8) === 0);

        if (needsPromotion && !move.promotion) {
          setPendingPromotion(move);
        } else {
          onMove(move);
        }

        setSelectedSquare(null);
        setLegalMoves([]);
      } else if (piece && piece.color === gameState.turn) {
        setSelectedSquare(square);
        const moves = generateLegalMoves(gameState).filter(m => m.from === square);
        setLegalMoves(moves);
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  };

  const handlePromotion = (promotionPiece: PieceType) => {
    if (pendingPromotion) {
      const move = { ...pendingPromotion, promotion: promotionPiece };
      onMove(move);
      setPendingPromotion(null);
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const squares = [];
  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      const square = rank * 8 + file;
      const displayRank = flipped ? 7 - rank : rank;
      const displayFile = flipped ? 7 - file : file;
      const displaySquare = displayRank * 8 + displayFile;

      const piece = gameState.board[displaySquare];
      const isLight = (rank + file) % 2 === 1;
      const isSelected = selectedSquare === displaySquare;
      const isLegalMove = legalMoves.some(m => m.to === displaySquare);
      const isLastMoveSquare = lastMove && (lastMove.from === displaySquare || lastMove.to === displaySquare);
      const isInCheckSquare = inCheck && kingSquare === displaySquare;

      squares.push(
        <Square
          key={square}
          square={displaySquare}
          isLight={isLight}
          isSelected={isSelected}
          isLegalMove={isLegalMove}
          isLastMoveSquare={!!isLastMoveSquare}
          isInCheck={!!isInCheckSquare}
          onClick={() => handleSquareClick(displaySquare)}
        >
          {piece && <Piece piece={piece} />}
        </Square>
      );
    }
  }

  return (
    <>
      <div
        className="grid gap-0 shadow-2xl"
        style={{
          gridTemplateColumns: 'repeat(8, 1fr)',
          gridTemplateRows: 'repeat(8, 1fr)',
          aspectRatio: '1',
          maxWidth: '600px',
          width: '100%',
        }}
      >
        {squares}
      </div>

      {pendingPromotion && (
        <PromotionDialog
          color={pendingPromotion.color}
          onSelect={handlePromotion}
        />
      )}
    </>
  );
}

import { useState, useCallback, useMemo } from 'react';
import { Chess, Square, Move, PieceSymbol, Color } from 'chess.js';

export type GameMode = 'pvp' | 'ai';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ChessPiece {
  type: PieceSymbol;
  color: Color;
  square: Square;
}

export interface GameState {
  board: (ChessPiece | null)[][];
  turn: Color;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  capturedWhite: PieceSymbol[];
  capturedBlack: PieceSymbol[];
  moveHistory: Move[];
  lastMove: Move | null;
}

const pieceValues: Record<PieceSymbol, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900,
};

const positionBonus: Record<PieceSymbol, number[][]> = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 5, 5, 5, 5, 5, 5, 5],
    [1, 1, 2, 3, 3, 2, 1, 1],
    [0.5, 0.5, 1, 2.5, 2.5, 1, 0.5, 0.5],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0.5, -0.5, -1, 0, 0, -1, -0.5, 0.5],
    [0.5, 1, 1, -2, -2, 1, 1, 0.5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-5, -4, -3, -3, -3, -3, -4, -5],
    [-4, -2, 0, 0, 0, 0, -2, -4],
    [-3, 0, 1, 1.5, 1.5, 1, 0, -3],
    [-3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3],
    [-3, 0, 1.5, 2, 2, 1.5, 0, -3],
    [-3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3],
    [-4, -2, 0, 0.5, 0.5, 0, -2, -4],
    [-5, -4, -3, -3, -3, -3, -4, -5],
  ],
  b: [
    [-2, -1, -1, -1, -1, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0.5, 1, 1, 0.5, 0, -1],
    [-1, 0.5, 0.5, 1, 1, 0.5, 0.5, -1],
    [-1, 0, 1, 1, 1, 1, 0, -1],
    [-1, 1, 1, 1, 1, 1, 1, -1],
    [-1, 0.5, 0, 0, 0, 0, 0.5, -1],
    [-2, -1, -1, -1, -1, -1, -1, -2],
  ],
  r: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0.5, 1, 1, 1, 1, 1, 1, 0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
    [0, 0, 0, 0.5, 0.5, 0, 0, 0],
  ],
  q: [
    [-2, -1, -1, -0.5, -0.5, -1, -1, -2],
    [-1, 0, 0, 0, 0, 0, 0, -1],
    [-1, 0, 0.5, 0.5, 0.5, 0.5, 0, -1],
    [-0.5, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
    [0, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
    [-1, 0.5, 0.5, 0.5, 0.5, 0.5, 0, -1],
    [-1, 0, 0.5, 0, 0, 0, 0, -1],
    [-2, -1, -1, -0.5, -0.5, -1, -1, -2],
  ],
  k: [
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-3, -4, -4, -5, -5, -4, -4, -3],
    [-2, -3, -3, -4, -4, -3, -3, -2],
    [-1, -2, -2, -2, -2, -2, -2, -1],
    [2, 2, 0, 0, 0, 0, 2, 2],
    [2, 3, 1, 0, 0, 1, 3, 2],
  ],
};

export function useChessGame() {
  const [game] = useState(() => new Chess());
  const [gameState, setGameState] = useState<GameState>(() => getGameState(game));
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isThinking, setIsThinking] = useState(false);

  function getGameState(chess: Chess): GameState {
    const board: (ChessPiece | null)[][] = [];
    const boardArray = chess.board();
    
    for (let row = 0; row < 8; row++) {
      board[row] = [];
      for (let col = 0; col < 8; col++) {
        const piece = boardArray[row][col];
        if (piece) {
          const file = String.fromCharCode(97 + col);
          const rank = String(8 - row);
          board[row][col] = {
            type: piece.type,
            color: piece.color,
            square: `${file}${rank}` as Square,
          };
        } else {
          board[row][col] = null;
        }
      }
    }

    const history = chess.history({ verbose: true });
    const capturedWhite: PieceSymbol[] = [];
    const capturedBlack: PieceSymbol[] = [];

    history.forEach((move) => {
      if (move.captured) {
        if (move.color === 'w') {
          capturedBlack.push(move.captured);
        } else {
          capturedWhite.push(move.captured);
        }
      }
    });

    return {
      board,
      turn: chess.turn(),
      isCheck: chess.isCheck(),
      isCheckmate: chess.isCheckmate(),
      isStalemate: chess.isStalemate(),
      isDraw: chess.isDraw(),
      isGameOver: chess.isGameOver(),
      capturedWhite,
      capturedBlack,
      moveHistory: history,
      lastMove: history.length > 0 ? history[history.length - 1] : null,
    };
  }

  const selectSquare = useCallback((square: Square) => {
    if (gameState.isGameOver) return;
    if (gameMode === 'ai' && game.turn() === 'b' && isThinking) return;

    const piece = game.get(square);

    if (selectedSquare) {
      // Try to make a move
      const move = legalMoves.find((m) => m === square);
      if (move) {
        try {
          // Check for pawn promotion
          const fromPiece = game.get(selectedSquare);
          const isPromotion =
            fromPiece?.type === 'p' &&
            ((fromPiece.color === 'w' && square[1] === '8') ||
              (fromPiece.color === 'b' && square[1] === '1'));

          game.move({
            from: selectedSquare,
            to: square,
            promotion: isPromotion ? 'q' : undefined,
          });

          setGameState(getGameState(game));
          setSelectedSquare(null);
          setLegalMoves([]);

          // AI move
          if (gameMode === 'ai' && !game.isGameOver() && game.turn() === 'b') {
            makeAIMove();
          }
          return;
        } catch {
          // Invalid move, try selecting new piece
        }
      }
    }

    // Select a piece
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [selectedSquare, legalMoves, gameState.isGameOver, gameMode, game, isThinking]);

  const evaluateBoard = useCallback((chess: Chess): number => {
    let score = 0;
    const boardArray = chess.board();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardArray[row][col];
        if (piece) {
          const value = pieceValues[piece.type];
          const bonus = positionBonus[piece.type];
          const posBonus = piece.color === 'w' ? bonus[row][col] : bonus[7 - row][col];
          
          if (piece.color === 'w') {
            score += value + posBonus;
          } else {
            score -= value + posBonus;
          }
        }
      }
    }

    return score;
  }, []);

  const minimax = useCallback((
    chess: Chess,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number => {
    if (depth === 0 || chess.isGameOver()) {
      return evaluateBoard(chess);
    }

    const moves = chess.moves();

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        chess.move(move);
        const evaluation = minimax(chess, depth - 1, alpha, beta, false);
        chess.undo();
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        chess.move(move);
        const evaluation = minimax(chess, depth - 1, alpha, beta, true);
        chess.undo();
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }, [evaluateBoard]);

  const makeAIMove = useCallback(async () => {
    setIsThinking(true);
    
    await new Promise((resolve) => setTimeout(resolve, 500));

    const moves = game.moves({ verbose: true });
    if (moves.length === 0) {
      setIsThinking(false);
      return;
    }

    let bestMove: Move | null = null;
    const depthMap: Record<Difficulty, number> = {
      easy: 1,
      medium: 2,
      hard: 3,
    };
    const depth = depthMap[difficulty];

    if (difficulty === 'easy' && Math.random() < 0.3) {
      // Random move for easy difficulty sometimes
      bestMove = moves[Math.floor(Math.random() * moves.length)];
    } else {
      let bestScore = Infinity;
      
      for (const move of moves) {
        game.move(move);
        const score = minimax(game, depth - 1, -Infinity, Infinity, true);
        game.undo();
        
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }

    if (bestMove) {
      game.move(bestMove);
      setGameState(getGameState(game));
    }

    setIsThinking(false);
  }, [game, difficulty, minimax]);

  const resetGame = useCallback(() => {
    game.reset();
    setGameState(getGameState(game));
    setSelectedSquare(null);
    setLegalMoves([]);
    setIsThinking(false);
  }, [game]);

  const undoMove = useCallback(() => {
    if (gameMode === 'ai') {
      // Undo both AI and player move
      game.undo();
      game.undo();
    } else {
      game.undo();
    }
    setGameState(getGameState(game));
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [game, gameMode]);

  const kingInCheck = useMemo(() => {
    if (!gameState.isCheck) return null;
    const board = game.board();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'k' && piece.color === game.turn()) {
          const file = String.fromCharCode(97 + col);
          const rank = String(8 - row);
          return `${file}${rank}` as Square;
        }
      }
    }
    return null;
  }, [gameState.isCheck, game]);

  return {
    gameState,
    selectedSquare,
    legalMoves,
    selectSquare,
    resetGame,
    undoMove,
    gameMode,
    setGameMode,
    difficulty,
    setDifficulty,
    isThinking,
    kingInCheck,
  };
}

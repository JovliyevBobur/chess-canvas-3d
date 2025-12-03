import { useChessGame } from '@/hooks/useChessGame';
import { ChessBoard3D } from './ChessBoard3D';
import { GameControls } from './GameControls';

export function ChessGame() {
  const {
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
  } = useChessGame();

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full h-full min-h-screen p-4 lg:p-8">
      <div className="relative w-full max-w-[600px] aspect-square bg-card/30 rounded-2xl overflow-hidden shadow-2xl">
        <ChessBoard3D
          gameState={gameState}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          onSquareClick={selectSquare}
          kingInCheck={kingInCheck}
        />
      </div>
      
      <GameControls
        gameState={gameState}
        gameMode={gameMode}
        difficulty={difficulty}
        isThinking={isThinking}
        onReset={resetGame}
        onUndo={undoMove}
        onModeChange={setGameMode}
        onDifficultyChange={setDifficulty}
      />
    </div>
  );
}

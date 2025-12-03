import { Button } from '@/components/ui/button';
import { GameMode, Difficulty, GameState } from '@/hooks/useChessGame';
import { RotateCcw, Undo2, Bot, Users, Crown, Loader2 } from 'lucide-react';
import { PieceSymbol } from 'chess.js';

interface GameControlsProps {
  gameState: GameState;
  gameMode: GameMode;
  difficulty: Difficulty;
  isThinking: boolean;
  onReset: () => void;
  onUndo: () => void;
  onModeChange: (mode: GameMode) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

const pieceUnicode: Record<PieceSymbol, { white: string; black: string }> = {
  k: { white: '♔', black: '♚' },
  q: { white: '♕', black: '♛' },
  r: { white: '♖', black: '♜' },
  b: { white: '♗', black: '♝' },
  n: { white: '♘', black: '♞' },
  p: { white: '♙', black: '♟' },
};

export function GameControls({
  gameState,
  gameMode,
  difficulty,
  isThinking,
  onReset,
  onUndo,
  onModeChange,
  onDifficultyChange,
}: GameControlsProps) {
  const getStatusText = () => {
    if (gameState.isCheckmate) {
      return `Checkmate! ${gameState.turn === 'w' ? 'Black' : 'White'} wins!`;
    }
    if (gameState.isStalemate) return 'Stalemate!';
    if (gameState.isDraw) return 'Draw!';
    if (isThinking) return 'AI is thinking...';
    if (gameState.isCheck) return `${gameState.turn === 'w' ? 'White' : 'Black'} is in check!`;
    return `${gameState.turn === 'w' ? 'White' : 'Black'}'s turn`;
  };

  return (
    <div className="glass-panel p-6 space-y-6 w-80">
      {/* Title */}
      <div className="text-center">
        <h1 className="chess-title text-2xl mb-1">Chess</h1>
        <p className="text-muted-foreground text-sm">3D Edition</p>
      </div>

      {/* Status */}
      <div
        className={`status-indicator text-center ${
          gameState.turn === 'w' ? 'turn-white' : 'turn-black'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          {isThinking && <Loader2 className="w-4 h-4 animate-spin" />}
          <span className={gameState.isCheck ? 'text-destructive font-semibold' : ''}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Game Mode */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Game Mode</label>
        <div className="flex gap-2">
          <Button
            variant={gameMode === 'pvp' ? 'default' : 'secondary'}
            size="sm"
            className="flex-1"
            onClick={() => {
              onModeChange('pvp');
              onReset();
            }}
          >
            <Users className="w-4 h-4 mr-2" />
            PvP
          </Button>
          <Button
            variant={gameMode === 'ai' ? 'default' : 'secondary'}
            size="sm"
            className="flex-1"
            onClick={() => {
              onModeChange('ai');
              onReset();
            }}
          >
            <Bot className="w-4 h-4 mr-2" />
            vs AI
          </Button>
        </div>
      </div>

      {/* AI Difficulty */}
      {gameMode === 'ai' && (
        <div className="space-y-2 animate-fade-in">
          <label className="text-sm text-muted-foreground">AI Difficulty</label>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <Button
                key={d}
                variant={difficulty === d ? 'default' : 'secondary'}
                size="sm"
                className="flex-1 capitalize"
                onClick={() => {
                  onDifficultyChange(d);
                  onReset();
                }}
              >
                {d}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Captured Pieces */}
      <div className="space-y-3">
        <label className="text-sm text-muted-foreground">Captured Pieces</label>
        
        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
          <Crown className="w-4 h-4 text-chess-piece-white" />
          <div className="flex flex-wrap gap-1">
            {gameState.capturedWhite.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              gameState.capturedWhite.map((p, i) => (
                <span key={i} className="text-lg captured-piece">
                  {pieceUnicode[p].white}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
          <Crown className="w-4 h-4 text-chess-piece-black" />
          <div className="flex flex-wrap gap-1">
            {gameState.capturedBlack.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              gameState.capturedBlack.map((p, i) => (
                <span key={i} className="text-lg captured-piece">
                  {pieceUnicode[p].black}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={onUndo}
          disabled={gameState.moveHistory.length === 0 || isThinking}
        >
          <Undo2 className="w-4 h-4 mr-2" />
          Undo
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          New Game
        </Button>
      </div>

      {/* Move History */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">
          Move History ({gameState.moveHistory.length})
        </label>
        <div className="max-h-32 overflow-y-auto p-2 rounded-lg bg-secondary/30 text-xs font-mono">
          {gameState.moveHistory.length === 0 ? (
            <span className="text-muted-foreground">No moves yet</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {gameState.moveHistory.map((move, i) => (
                <span
                  key={i}
                  className={`px-1.5 py-0.5 rounded ${
                    i === gameState.moveHistory.length - 1
                      ? 'bg-primary/20 text-primary'
                      : ''
                  }`}
                >
                  {Math.floor(i / 2) + 1}.{i % 2 === 0 ? '' : '..'}{move.san}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

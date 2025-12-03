import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Square } from 'chess.js';
import { ChessPiece3D } from './ChessPiece3D';
import { GameState } from '@/hooks/useChessGame';
import { Loader2 } from 'lucide-react';

interface ChessBoard3DProps {
  gameState: GameState;
  selectedSquare: Square | null;
  legalMoves: Square[];
  onSquareClick: (square: Square) => void;
  kingInCheck: Square | null;
}

function BoardSquare({
  position,
  isLight,
  isSelected,
  isLegalMove,
  isLastMove,
  isCheck,
  onClick,
}: {
  position: [number, number, number];
  isLight: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  onClick: () => void;
}) {
  const baseColor = isLight ? '#d4b896' : '#6b4423';
  let emissive = '#000000';
  let emissiveIntensity = 0;

  if (isCheck) {
    emissive = '#ff4444';
    emissiveIntensity = 0.5;
  } else if (isSelected) {
    emissive = '#d4a017';
    emissiveIntensity = 0.4;
  } else if (isLegalMove) {
    emissive = '#22c55e';
    emissiveIntensity = 0.3;
  } else if (isLastMove) {
    emissive = '#3b82f6';
    emissiveIntensity = 0.15;
  }

  return (
    <mesh position={position} onClick={onClick} receiveShadow>
      <boxGeometry args={[1, 0.2, 1]} />
      <meshStandardMaterial
        color={baseColor}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        metalness={0.1}
        roughness={0.8}
      />
    </mesh>
  );
}

function Board({
  gameState,
  selectedSquare,
  legalMoves,
  onSquareClick,
  kingInCheck,
}: ChessBoard3DProps) {
  const squares: JSX.Element[] = [];
  const pieces: JSX.Element[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const file = String.fromCharCode(97 + col);
      const rank = String(8 - row);
      const square = `${file}${rank}` as Square;
      const isLight = (row + col) % 2 === 0;
      const x = col - 3.5;
      const z = row - 3.5;

      const isSelected = selectedSquare === square;
      const isLegalMove = legalMoves.includes(square);
      const isLastMoveFrom = gameState.lastMove?.from === square;
      const isLastMoveTo = gameState.lastMove?.to === square;
      const isCheck = kingInCheck === square;

      squares.push(
        <BoardSquare
          key={`square-${square}`}
          position={[x, 0, z]}
          isLight={isLight}
          isSelected={isSelected}
          isLegalMove={isLegalMove}
          isLastMove={isLastMoveFrom || isLastMoveTo}
          isCheck={isCheck}
          onClick={() => onSquareClick(square)}
        />
      );

      // Legal move indicator dots
      if (isLegalMove && !gameState.board[row][col]) {
        squares.push(
          <mesh key={`dot-${square}`} position={[x, 0.15, z]}>
            <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
            />
          </mesh>
        );
      }

      const piece = gameState.board[row][col];
      if (piece) {
        const isSelectedPiece = selectedSquare === square;
        pieces.push(
          <ChessPiece3D
            key={`piece-${square}`}
            type={piece.type}
            color={piece.color}
            position={[x, 0.1, z]}
            isSelected={isSelectedPiece}
            onClick={() => onSquareClick(square)}
          />
        );
      }
    }
  }

  // Board frame
  const frameSegments = [];
  const frameThickness = 0.3;
  const frameHeight = 0.25;
  const boardSize = 8;

  frameSegments.push(
    <mesh key="frame-front" position={[0, 0.025, -4.15]} receiveShadow>
      <boxGeometry args={[boardSize + frameThickness * 2, frameHeight, frameThickness]} />
      <meshStandardMaterial color="#3d2817" metalness={0.2} roughness={0.7} />
    </mesh>,
    <mesh key="frame-back" position={[0, 0.025, 4.15]} receiveShadow>
      <boxGeometry args={[boardSize + frameThickness * 2, frameHeight, frameThickness]} />
      <meshStandardMaterial color="#3d2817" metalness={0.2} roughness={0.7} />
    </mesh>,
    <mesh key="frame-left" position={[-4.15, 0.025, 0]} receiveShadow>
      <boxGeometry args={[frameThickness, frameHeight, boardSize]} />
      <meshStandardMaterial color="#3d2817" metalness={0.2} roughness={0.7} />
    </mesh>,
    <mesh key="frame-right" position={[4.15, 0.025, 0]} receiveShadow>
      <boxGeometry args={[frameThickness, frameHeight, boardSize]} />
      <meshStandardMaterial color="#3d2817" metalness={0.2} roughness={0.7} />
    </mesh>
  );

  return (
    <group>
      {squares}
      {pieces}
      {frameSegments}
    </group>
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-muted-foreground text-sm">Loading 3D board...</span>
      </div>
    </div>
  );
}

export function ChessBoard3D(props: ChessBoard3DProps) {
  return (
    <div className="w-full h-full absolute inset-0">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          shadows
          camera={{ position: [0, 10, 8], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <color attach="background" args={['#151a23']} />
          <fog attach="fog" args={['#151a23', 15, 30]} />
          
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-5, 8, -5]} intensity={0.3} color="#ffeedd" />
          
          <Board {...props} />
          
          <ContactShadows
            position={[0, -0.1, 0]}
            opacity={0.4}
            scale={20}
            blur={2}
            far={10}
          />
          
          <Environment preset="studio" />
          
          <OrbitControls
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={8}
            maxDistance={18}
            enablePan={false}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

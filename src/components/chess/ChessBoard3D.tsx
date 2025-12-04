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
  // Polished wood colors - warm maple and rich walnut
  const baseColor = isLight ? '#e8d4b8' : '#5c3d2e';
  let emissive = '#000000';
  let emissiveIntensity = 0;

  if (isCheck) {
    emissive = '#ff3333';
    emissiveIntensity = 0.6;
  } else if (isSelected) {
    emissive = '#ffc107';
    emissiveIntensity = 0.5;
  } else if (isLegalMove) {
    emissive = '#4ade80';
    emissiveIntensity = 0.4;
  } else if (isLastMove) {
    emissive = '#60a5fa';
    emissiveIntensity = 0.2;
  }

  return (
    <mesh position={position} onClick={onClick} receiveShadow>
      <boxGeometry args={[1, 0.18, 1]} />
      <meshPhysicalMaterial
        color={baseColor}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        metalness={0.05}
        roughness={0.3}
        clearcoat={0.6}
        clearcoatRoughness={0.2}
        reflectivity={0.5}
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

      // Elegant legal move indicators
      if (isLegalMove && !gameState.board[row][col]) {
        squares.push(
          <mesh key={`dot-${square}`} position={[x, 0.12, z]}>
            <sphereGeometry args={[0.12, 32, 32]} />
            <meshPhysicalMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={0.6}
              transparent
              opacity={0.8}
              metalness={0.3}
              roughness={0.2}
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
            position={[x, 0.09, z]}
            isSelected={isSelectedPiece}
            onClick={() => onSquareClick(square)}
          />
        );
      }
    }
  }

  // Luxurious dark wood frame
  const frameSegments = [];
  const frameThickness = 0.4;
  const frameHeight = 0.3;
  const boardSize = 8;

  const frameMaterial = (
    <meshPhysicalMaterial 
      color="#2d1810" 
      metalness={0.1} 
      roughness={0.4}
      clearcoat={0.7}
      clearcoatRoughness={0.15}
    />
  );

  frameSegments.push(
    <mesh key="frame-front" position={[0, 0.02, -4.2]} receiveShadow castShadow>
      <boxGeometry args={[boardSize + frameThickness * 2, frameHeight, frameThickness]} />
      {frameMaterial}
    </mesh>,
    <mesh key="frame-back" position={[0, 0.02, 4.2]} receiveShadow castShadow>
      <boxGeometry args={[boardSize + frameThickness * 2, frameHeight, frameThickness]} />
      {frameMaterial}
    </mesh>,
    <mesh key="frame-left" position={[-4.2, 0.02, 0]} receiveShadow castShadow>
      <boxGeometry args={[frameThickness, frameHeight, boardSize]} />
      {frameMaterial}
    </mesh>,
    <mesh key="frame-right" position={[4.2, 0.02, 0]} receiveShadow castShadow>
      <boxGeometry args={[frameThickness, frameHeight, boardSize]} />
      {frameMaterial}
    </mesh>
  );

  // Frame corners for luxury feel
  const cornerSize = 0.5;
  const corners = [
    [-4.2, -4.2], [-4.2, 4.2], [4.2, -4.2], [4.2, 4.2]
  ];
  corners.forEach(([cx, cz], i) => {
    frameSegments.push(
      <mesh key={`corner-${i}`} position={[cx, 0.02, cz]} receiveShadow castShadow>
        <boxGeometry args={[cornerSize, frameHeight, cornerSize]} />
        {frameMaterial}
      </mesh>
    );
  });

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
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: 'high-performance',
          }}
          dpr={[1, 2]}
          style={{ background: 'transparent' }}
        >
          <color attach="background" args={['#0f1419']} />
          <fog attach="fog" args={['#0f1419', 18, 35]} />
          
          {/* Warm cinematic lighting */}
          <ambientLight intensity={0.3} color="#fff5e6" />
          
          {/* Main key light - warm */}
          <directionalLight
            position={[8, 15, 8]}
            intensity={1.5}
            color="#fff8f0"
            castShadow
            shadow-mapSize={[4096, 4096]}
            shadow-camera-far={60}
            shadow-camera-left={-12}
            shadow-camera-right={12}
            shadow-camera-top={12}
            shadow-camera-bottom={-12}
            shadow-bias={-0.0001}
          />
          
          {/* Fill light - cool blue */}
          <directionalLight
            position={[-6, 8, -4]}
            intensity={0.4}
            color="#b4d4ff"
          />
          
          {/* Rim light - warm accent */}
          <pointLight 
            position={[-8, 6, 8]} 
            intensity={0.5} 
            color="#ffd4a3" 
            distance={20}
          />
          
          {/* Top highlight */}
          <pointLight 
            position={[0, 12, 0]} 
            intensity={0.3} 
            color="#ffffff" 
            distance={25}
          />
          
          <Board {...props} />
          
          <ContactShadows
            position={[0, -0.12, 0]}
            opacity={0.5}
            scale={25}
            blur={2.5}
            far={12}
            color="#0a0806"
          />
          
          <Environment preset="studio" environmentIntensity={0.6} />
          
          <OrbitControls
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={8}
            maxDistance={20}
            enablePan={false}
            enableDamping
            dampingFactor={0.05}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

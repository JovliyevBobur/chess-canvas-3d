import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector2 } from 'three';
import { PieceSymbol, Color } from 'chess.js';

interface ChessPiece3DProps {
  type: PieceSymbol;
  color: Color;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}

const pieceGeometry: Record<PieceSymbol, { segments: number[][]; height: number }> = {
  p: { // Pawn
    segments: [
      [0.3, 0],
      [0.3, 0.1],
      [0.25, 0.15],
      [0.18, 0.35],
      [0.22, 0.45],
      [0.16, 0.6],
      [0.13, 0.75],
      [0.08, 0.85],
    ],
    height: 0.85,
  },
  r: { // Rook
    segments: [
      [0.35, 0],
      [0.35, 0.1],
      [0.28, 0.15],
      [0.25, 0.55],
      [0.32, 0.6],
      [0.32, 0.8],
      [0.22, 0.8],
      [0.22, 0.7],
      [0.28, 0.7],
      [0.28, 0.65],
      [0.08, 0.65],
    ],
    height: 1.0,
  },
  n: { // Knight
    segments: [
      [0.35, 0],
      [0.35, 0.1],
      [0.28, 0.15],
      [0.2, 0.4],
      [0.25, 0.6],
      [0.2, 0.85],
      [0.12, 1.0],
      [0.06, 1.1],
    ],
    height: 1.1,
  },
  b: { // Bishop
    segments: [
      [0.35, 0],
      [0.35, 0.1],
      [0.26, 0.15],
      [0.18, 0.5],
      [0.12, 0.8],
      [0.08, 1.0],
      [0.12, 1.1],
      [0.06, 1.15],
    ],
    height: 1.15,
  },
  q: { // Queen
    segments: [
      [0.38, 0],
      [0.38, 0.1],
      [0.3, 0.15],
      [0.2, 0.6],
      [0.28, 0.75],
      [0.16, 1.0],
      [0.1, 1.2],
      [0.15, 1.3],
      [0.08, 1.35],
    ],
    height: 1.35,
  },
  k: { // King
    segments: [
      [0.4, 0],
      [0.4, 0.1],
      [0.32, 0.15],
      [0.22, 0.6],
      [0.3, 0.75],
      [0.18, 1.1],
      [0.12, 1.3],
      [0.06, 1.35],
      [0.06, 1.5],
      [0.02, 1.5],
    ],
    height: 1.5,
  },
};

export function ChessPiece3D({ type, color, position, isSelected, onClick }: ChessPiece3DProps) {
  const meshRef = useRef<Mesh>(null);
  const targetY = useRef(position[1]);
  const currentY = useRef(position[1]);

  const pieceColor = color === 'w' ? '#f5f0e6' : '#1a1a1a';
  const emissiveColor = isSelected ? '#d4a017' : color === 'w' ? '#f5f0e6' : '#2a2a2a';
  const emissiveIntensity = isSelected ? 0.4 : 0.05;

  targetY.current = isSelected ? position[1] + 0.3 : position[1];

  useFrame((_, delta) => {
    if (meshRef.current) {
      currentY.current += (targetY.current - currentY.current) * delta * 8;
      meshRef.current.position.y = currentY.current;
      
      if (isSelected) {
        meshRef.current.rotation.y += delta * 0.5;
      }
    }
  });

  const points = useMemo(() => {
    const { segments } = pieceGeometry[type];
    return segments.map(([x, y]) => new Vector2(x, y));
  }, [type]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      castShadow
      receiveShadow
    >
      <latheGeometry args={[points, 32]} />
      <meshStandardMaterial
        color={pieceColor}
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}
        metalness={color === 'w' ? 0.1 : 0.3}
        roughness={color === 'w' ? 0.4 : 0.6}
      />
    </mesh>
  );
}

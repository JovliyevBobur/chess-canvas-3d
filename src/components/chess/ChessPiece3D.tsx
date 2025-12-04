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

// Ultra-detailed Staunton-style piece profiles - Pixar quality
const pieceGeometry: Record<PieceSymbol, { segments: number[][]; height: number }> = {
  p: { // Pawn - Classic rounded top, elegant proportions
    segments: [
      [0.28, 0],       // Base bottom
      [0.30, 0.02],    // Base lip
      [0.30, 0.06],    // Base edge
      [0.26, 0.10],    // Base bevel top
      [0.24, 0.12],    // Base top curve
      [0.16, 0.14],    // Stem start
      [0.14, 0.18],    // Stem narrow
      [0.13, 0.26],    // Stem middle
      [0.14, 0.32],    // Stem widening
      [0.18, 0.36],    // Collar bottom
      [0.20, 0.38],    // Collar wide
      [0.18, 0.40],    // Collar top
      [0.12, 0.44],    // Neck narrow
      [0.11, 0.48],    // Neck middle
      [0.14, 0.52],    // Head base flare
      [0.18, 0.56],    // Head curve start
      [0.20, 0.62],    // Head widest
      [0.19, 0.68],    // Head curve
      [0.16, 0.74],    // Head upper curve
      [0.12, 0.80],    // Head top curve
      [0.06, 0.84],    // Head peak
      [0.02, 0.86],    // Tip curve
      [0, 0.87],       // Top point
    ],
    height: 0.87,
  },
  r: { // Rook - Castle tower with battlements
    segments: [
      [0.32, 0],       // Base bottom
      [0.34, 0.02],    // Base lip
      [0.34, 0.08],    // Base edge
      [0.30, 0.12],    // Base bevel
      [0.28, 0.14],    // Base top
      [0.20, 0.16],    // Stem start
      [0.18, 0.24],    // Stem lower
      [0.17, 0.40],    // Stem middle
      [0.16, 0.52],    // Stem upper
      [0.18, 0.55],    // Collar start
      [0.22, 0.58],    // Collar wide
      [0.24, 0.60],    // Tower base
      [0.26, 0.62],    // Tower flare
      [0.26, 0.78],    // Tower wall
      [0.28, 0.80],    // Battlement base
      [0.28, 0.92],    // Battlement wall
      [0.22, 0.92],    // Inner step
      [0.22, 0.85],    // Inner wall
      [0.16, 0.85],    // Center step
      [0.16, 0.92],    // Center rise
      [0.10, 0.92],    // Inner center
      [0.10, 0.85],    // Inner center wall
      [0, 0.85],       // Top center
    ],
    height: 0.95,
  },
  n: { // Knight - Elegant horse head silhouette
    segments: [
      [0.30, 0],       // Base bottom
      [0.32, 0.02],    // Base lip
      [0.32, 0.08],    // Base edge
      [0.28, 0.12],    // Base bevel
      [0.26, 0.14],    // Base top
      [0.18, 0.16],    // Stem start
      [0.16, 0.22],    // Stem lower
      [0.15, 0.32],    // Stem middle
      [0.14, 0.40],    // Stem upper
      [0.16, 0.44],    // Collar
      [0.20, 0.48],    // Neck base
      [0.24, 0.54],    // Neck wide
      [0.26, 0.62],    // Neck curve
      [0.25, 0.72],    // Head back
      [0.22, 0.80],    // Head curve
      [0.18, 0.88],    // Muzzle back
      [0.20, 0.94],    // Muzzle wide
      [0.18, 1.00],    // Muzzle top
      [0.14, 1.04],    // Ear base
      [0.16, 1.08],    // Ear
      [0.12, 1.12],    // Ear tip area
      [0.08, 1.14],    // Top curve
      [0.04, 1.15],    // Peak
      [0, 1.16],       // Top point
    ],
    height: 1.16,
  },
  b: { // Bishop - Elegant mitre with slot
    segments: [
      [0.30, 0],       // Base bottom
      [0.32, 0.02],    // Base lip
      [0.32, 0.08],    // Base edge
      [0.28, 0.12],    // Base bevel
      [0.26, 0.14],    // Base top
      [0.18, 0.16],    // Stem start
      [0.16, 0.22],    // Stem lower
      [0.14, 0.34],    // Stem middle
      [0.13, 0.44],    // Stem upper
      [0.15, 0.48],    // Collar start
      [0.18, 0.51],    // Collar wide
      [0.20, 0.53],    // Collar peak
      [0.17, 0.56],    // Collar end
      [0.13, 0.62],    // Neck
      [0.12, 0.68],    // Neck upper
      [0.15, 0.72],    // Mitre base
      [0.18, 0.78],    // Mitre curve start
      [0.20, 0.86],    // Mitre widest
      [0.18, 0.94],    // Mitre upper curve
      [0.14, 1.02],    // Mitre peak curve
      [0.08, 1.10],    // Mitre top
      [0.04, 1.14],    // Ball base
      [0.06, 1.17],    // Ball
      [0.05, 1.20],    // Ball top
      [0.03, 1.22],    // Finial
      [0, 1.24],       // Top point
    ],
    height: 1.24,
  },
  q: { // Queen - Elegant crown with delicate coronet
    segments: [
      [0.34, 0],       // Base bottom
      [0.36, 0.02],    // Base lip
      [0.36, 0.08],    // Base edge
      [0.32, 0.12],    // Base bevel
      [0.30, 0.14],    // Base top curve
      [0.20, 0.16],    // Stem start
      [0.18, 0.24],    // Stem lower
      [0.16, 0.38],    // Stem middle
      [0.15, 0.50],    // Stem upper
      [0.17, 0.54],    // Collar start
      [0.20, 0.57],    // Collar wide
      [0.23, 0.60],    // Collar peak
      [0.20, 0.64],    // Collar end
      [0.16, 0.72],    // Neck
      [0.15, 0.78],    // Neck upper
      [0.20, 0.82],    // Crown base
      [0.24, 0.88],    // Crown curve
      [0.26, 0.96],    // Crown widest
      [0.24, 1.04],    // Crown upper
      [0.20, 1.12],    // Crown taper
      [0.16, 1.18],    // Coronet base
      [0.18, 1.22],    // Coronet points
      [0.14, 1.28],    // Coronet top
      [0.08, 1.32],    // Orb base
      [0.10, 1.36],    // Orb
      [0.08, 1.40],    // Orb top
      [0.04, 1.42],    // Finial
      [0, 1.44],       // Top point
    ],
    height: 1.44,
  },
  k: { // King - Majestic crown with cross
    segments: [
      [0.36, 0],       // Base bottom
      [0.38, 0.02],    // Base lip
      [0.38, 0.08],    // Base edge
      [0.34, 0.12],    // Base bevel
      [0.32, 0.14],    // Base top
      [0.22, 0.16],    // Stem start
      [0.20, 0.26],    // Stem lower
      [0.18, 0.42],    // Stem middle
      [0.16, 0.56],    // Stem upper
      [0.18, 0.60],    // Collar start
      [0.22, 0.64],    // Collar wide
      [0.25, 0.68],    // Collar peak
      [0.22, 0.72],    // Collar end
      [0.18, 0.80],    // Neck
      [0.16, 0.88],    // Neck upper
      [0.22, 0.92],    // Crown base
      [0.26, 0.98],    // Crown curve
      [0.28, 1.06],    // Crown widest
      [0.26, 1.14],    // Crown upper
      [0.22, 1.22],    // Crown taper
      [0.18, 1.28],    // Crown rim
      [0.14, 1.34],    // Cross platform
      [0.08, 1.38],    // Cross base
      [0.06, 1.44],    // Cross vertical
      [0.10, 1.48],    // Cross arm base
      [0.10, 1.52],    // Cross arm
      [0.06, 1.52],    // Cross arm inner
      [0.06, 1.62],    // Cross top vertical
      [0.03, 1.64],    // Cross peak
      [0, 1.66],       // Top point
    ],
    height: 1.66,
  },
};

export function ChessPiece3D({ type, color, position, isSelected, onClick }: ChessPiece3DProps) {
  const meshRef = useRef<Mesh>(null);
  const targetY = useRef(position[1]);
  const currentY = useRef(position[1]);

  // Pixar-quality material colors - glossy porcelain/marble look
  const isWhite = color === 'w';
  
  // Cream ivory for white, rich dark wood for black
  const pieceColor = isWhite ? '#fdf8f0' : '#1a1410';
  const emissiveColor = isSelected 
    ? '#ffd700' 
    : isWhite ? '#fff5e6' : '#2a1f18';
  const emissiveIntensity = isSelected ? 0.6 : 0.03;

  targetY.current = isSelected ? position[1] + 0.35 : position[1];

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Smooth spring-like animation
      const diff = targetY.current - currentY.current;
      currentY.current += diff * delta * 10;
      meshRef.current.position.y = currentY.current;
      
      if (isSelected) {
        meshRef.current.rotation.y += delta * 0.8;
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
      <latheGeometry args={[points, 64]} />
      <meshPhysicalMaterial
        color={pieceColor}
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}
        metalness={isWhite ? 0.02 : 0.08}
        roughness={isWhite ? 0.15 : 0.25}
        clearcoat={0.8}
        clearcoatRoughness={0.1}
        reflectivity={0.9}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

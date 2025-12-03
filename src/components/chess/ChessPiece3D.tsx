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
  p: { // Pawn - Classic Staunton style
    segments: [
      [0.32, 0],      // Base bottom
      [0.32, 0.04],   // Base edge
      [0.28, 0.08],   // Base top bevel
      [0.26, 0.1],    // Base top
      [0.18, 0.12],   // Stem start
      [0.16, 0.2],    // Stem
      [0.15, 0.3],    // Stem narrow
      [0.17, 0.35],   // Collar start
      [0.2, 0.38],    // Collar
      [0.17, 0.42],   // Collar end
      [0.14, 0.5],    // Neck
      [0.18, 0.55],   // Head base
      [0.2, 0.6],     // Head wide
      [0.19, 0.68],   // Head curve
      [0.15, 0.75],   // Head top curve
      [0.08, 0.8],    // Head tip
      [0, 0.82],      // Top point
    ],
    height: 0.82,
  },
  r: { // Rook - Castle tower style
    segments: [
      [0.35, 0],      // Base bottom
      [0.35, 0.05],   // Base edge
      [0.3, 0.1],     // Base bevel
      [0.28, 0.12],   // Base top
      [0.2, 0.14],    // Stem start
      [0.18, 0.35],   // Stem middle
      [0.17, 0.5],    // Stem upper
      [0.22, 0.52],   // Collar
      [0.25, 0.55],   // Tower base
      [0.25, 0.75],   // Tower wall
      [0.28, 0.77],   // Battlement base
      [0.28, 0.9],    // Battlement top
      [0.2, 0.9],     // Inner battlement
      [0.2, 0.82],    // Battlement inner
      [0.15, 0.82],   // Center
      [0.15, 0.9],    // Center top
      [0, 0.9],       // Top center
    ],
    height: 0.95,
  },
  n: { // Knight - Horse head style
    segments: [
      [0.34, 0],      // Base bottom
      [0.34, 0.05],   // Base edge
      [0.29, 0.1],    // Base bevel
      [0.27, 0.12],   // Base top
      [0.18, 0.14],   // Stem start
      [0.16, 0.25],   // Stem
      [0.15, 0.35],   // Stem upper
      [0.18, 0.38],   // Collar
      [0.22, 0.42],   // Neck base
      [0.25, 0.5],    // Neck wide
      [0.22, 0.6],    // Neck curve
      [0.18, 0.7],    // Head base
      [0.2, 0.8],     // Muzzle
      [0.15, 0.9],    // Muzzle top
      [0.12, 0.95],   // Ear area
      [0.14, 1.0],    // Ear
      [0.08, 1.05],   // Top curve
      [0, 1.08],      // Top point
    ],
    height: 1.08,
  },
  b: { // Bishop - Mitre hat style
    segments: [
      [0.34, 0],      // Base bottom
      [0.34, 0.05],   // Base edge
      [0.29, 0.1],    // Base bevel
      [0.27, 0.12],   // Base top
      [0.18, 0.14],   // Stem start
      [0.16, 0.25],   // Stem lower
      [0.15, 0.4],    // Stem middle
      [0.18, 0.45],   // Collar
      [0.2, 0.48],    // Collar wide
      [0.17, 0.52],   // Collar end
      [0.14, 0.6],    // Neck
      [0.18, 0.65],   // Mitre base
      [0.2, 0.72],    // Mitre wide
      [0.18, 0.82],   // Mitre curve
      [0.12, 0.95],   // Mitre top curve
      [0.06, 1.05],   // Mitre peak
      [0.08, 1.1],    // Ball base
      [0.06, 1.15],   // Ball
      [0, 1.18],      // Top point
    ],
    height: 1.18,
  },
  q: { // Queen - Crown style
    segments: [
      [0.38, 0],      // Base bottom
      [0.38, 0.05],   // Base edge
      [0.33, 0.1],    // Base bevel
      [0.3, 0.12],    // Base top
      [0.2, 0.14],    // Stem start
      [0.18, 0.3],    // Stem lower
      [0.17, 0.45],   // Stem middle
      [0.2, 0.5],     // Collar
      [0.24, 0.54],   // Collar wide
      [0.2, 0.58],    // Collar end
      [0.16, 0.7],    // Neck
      [0.22, 0.75],   // Crown base
      [0.26, 0.82],   // Crown wide
      [0.24, 0.9],    // Crown curve
      [0.2, 1.0],     // Crown upper
      [0.15, 1.08],   // Crown peak base
      [0.18, 1.12],   // Crown points
      [0.12, 1.18],   // Crown top
      [0.08, 1.22],   // Ball base
      [0.1, 1.28],    // Ball
      [0.06, 1.32],   // Ball top
      [0, 1.35],      // Top point
    ],
    height: 1.35,
  },
  k: { // King - Cross crown style
    segments: [
      [0.4, 0],       // Base bottom
      [0.4, 0.05],    // Base edge
      [0.35, 0.1],    // Base bevel
      [0.32, 0.12],   // Base top
      [0.22, 0.14],   // Stem start
      [0.2, 0.3],     // Stem lower
      [0.18, 0.5],    // Stem middle
      [0.22, 0.55],   // Collar
      [0.26, 0.6],    // Collar wide
      [0.22, 0.65],   // Collar end
      [0.18, 0.8],    // Neck
      [0.24, 0.85],   // Crown base
      [0.28, 0.92],   // Crown wide
      [0.26, 1.0],    // Crown curve
      [0.22, 1.1],    // Crown upper
      [0.18, 1.18],   // Crown peak
      [0.14, 1.25],   // Cross base
      [0.06, 1.28],   // Cross vertical start
      [0.06, 1.35],   // Cross horizontal level
      [0.12, 1.35],   // Cross arm
      [0.12, 1.4],    // Cross arm top
      [0.06, 1.4],    // Cross center
      [0.06, 1.5],    // Cross top
      [0, 1.52],      // Top point
    ],
    height: 1.52,
  },
};

export function ChessPiece3D({ type, color, position, isSelected, onClick }: ChessPiece3DProps) {
  const meshRef = useRef<Mesh>(null);
  const targetY = useRef(position[1]);
  const currentY = useRef(position[1]);

  // Realistic piece colors - ivory white and ebony black
  const pieceColor = color === 'w' ? '#faf6f0' : '#2d2318';
  const emissiveColor = isSelected ? '#ffd700' : color === 'w' ? '#fff8e7' : '#3d3328';
  const emissiveIntensity = isSelected ? 0.5 : 0.02;

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
      <latheGeometry args={[points, 48]} />
      <meshStandardMaterial
        color={pieceColor}
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}
        metalness={color === 'w' ? 0.05 : 0.15}
        roughness={color === 'w' ? 0.25 : 0.35}
      />
    </mesh>
  );
}

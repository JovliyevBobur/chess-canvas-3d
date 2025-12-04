import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector2, Shape, ExtrudeGeometry } from 'three';
import { PieceSymbol, Color } from 'chess.js';

interface ChessPiece3DProps {
  type: PieceSymbol;
  color: Color;
  position: [number, number, number];
  isSelected: boolean;
  isInCheck?: boolean;
  onClick: () => void;
}

// Ultra-detailed Staunton-style piece profiles
const pieceGeometry: Record<Exclude<PieceSymbol, 'n'>, { segments: number[][]; height: number }> = {
  p: {
    segments: [
      [0.28, 0], [0.30, 0.02], [0.30, 0.06], [0.26, 0.10], [0.24, 0.12],
      [0.16, 0.14], [0.14, 0.18], [0.13, 0.26], [0.14, 0.32], [0.18, 0.36],
      [0.20, 0.38], [0.18, 0.40], [0.12, 0.44], [0.11, 0.48], [0.14, 0.52],
      [0.18, 0.56], [0.20, 0.62], [0.19, 0.68], [0.16, 0.74], [0.12, 0.80],
      [0.06, 0.84], [0.02, 0.86], [0, 0.87],
    ],
    height: 0.87,
  },
  r: {
    segments: [
      [0.32, 0], [0.34, 0.02], [0.34, 0.08], [0.30, 0.12], [0.28, 0.14],
      [0.20, 0.16], [0.18, 0.24], [0.17, 0.40], [0.16, 0.52], [0.18, 0.55],
      [0.22, 0.58], [0.24, 0.60], [0.26, 0.62], [0.26, 0.78], [0.28, 0.80],
      [0.28, 0.92], [0.22, 0.92], [0.22, 0.85], [0.16, 0.85], [0.16, 0.92],
      [0.10, 0.92], [0.10, 0.85], [0, 0.85],
    ],
    height: 0.95,
  },
  b: {
    segments: [
      [0.30, 0], [0.32, 0.02], [0.32, 0.08], [0.28, 0.12], [0.26, 0.14],
      [0.18, 0.16], [0.16, 0.22], [0.14, 0.34], [0.13, 0.44], [0.15, 0.48],
      [0.18, 0.51], [0.20, 0.53], [0.17, 0.56], [0.13, 0.62], [0.12, 0.68],
      [0.15, 0.72], [0.18, 0.78], [0.20, 0.86], [0.18, 0.94], [0.14, 1.02],
      [0.08, 1.10], [0.04, 1.14], [0.06, 1.17], [0.05, 1.20], [0.03, 1.22], [0, 1.24],
    ],
    height: 1.24,
  },
  q: {
    segments: [
      [0.34, 0], [0.36, 0.02], [0.36, 0.08], [0.32, 0.12], [0.30, 0.14],
      [0.20, 0.16], [0.18, 0.24], [0.16, 0.38], [0.15, 0.50], [0.17, 0.54],
      [0.20, 0.57], [0.23, 0.60], [0.20, 0.64], [0.16, 0.72], [0.15, 0.78],
      [0.20, 0.82], [0.24, 0.88], [0.26, 0.96], [0.24, 1.04], [0.20, 1.12],
      [0.16, 1.18], [0.18, 1.22], [0.14, 1.28], [0.08, 1.32], [0.10, 1.36],
      [0.08, 1.40], [0.04, 1.42], [0, 1.44],
    ],
    height: 1.44,
  },
  k: {
    segments: [
      [0.36, 0], [0.38, 0.02], [0.38, 0.08], [0.34, 0.12], [0.32, 0.14],
      [0.22, 0.16], [0.20, 0.26], [0.18, 0.42], [0.16, 0.56], [0.18, 0.60],
      [0.22, 0.64], [0.25, 0.68], [0.22, 0.72], [0.18, 0.80], [0.16, 0.88],
      [0.22, 0.92], [0.26, 0.98], [0.28, 1.06], [0.26, 1.14], [0.22, 1.22],
      [0.18, 1.28], [0.14, 1.34], [0.08, 1.38], [0.06, 1.44], [0.10, 1.48],
      [0.10, 1.52], [0.06, 1.52], [0.06, 1.62], [0.03, 1.64], [0, 1.66],
    ],
    height: 1.66,
  },
};

// Create a proper horse-shaped knight using ExtrudeGeometry
function createKnightShape(): Shape {
  const shape = new Shape();
  
  // Start at bottom left of base
  shape.moveTo(-0.25, 0);
  
  // Base
  shape.lineTo(0.25, 0);
  shape.lineTo(0.28, 0.02);
  shape.lineTo(0.28, 0.08);
  shape.lineTo(0.22, 0.12);
  
  // Right side going up - neck back
  shape.quadraticCurveTo(0.20, 0.20, 0.18, 0.30);
  shape.quadraticCurveTo(0.16, 0.45, 0.20, 0.55);
  
  // Back of head curve
  shape.quadraticCurveTo(0.24, 0.65, 0.22, 0.75);
  
  // Ear
  shape.lineTo(0.18, 0.82);
  shape.lineTo(0.22, 0.90);
  shape.lineTo(0.18, 0.88);
  
  // Top of head
  shape.quadraticCurveTo(0.12, 0.92, 0.05, 0.88);
  
  // Forehead curve
  shape.quadraticCurveTo(-0.02, 0.85, -0.08, 0.78);
  
  // Eye indent
  shape.quadraticCurveTo(-0.12, 0.72, -0.10, 0.65);
  
  // Nose bridge
  shape.quadraticCurveTo(-0.08, 0.58, -0.15, 0.52);
  
  // Muzzle top
  shape.quadraticCurveTo(-0.22, 0.48, -0.28, 0.50);
  
  // Nose tip
  shape.quadraticCurveTo(-0.32, 0.48, -0.30, 0.44);
  
  // Muzzle bottom
  shape.quadraticCurveTo(-0.26, 0.40, -0.20, 0.42);
  
  // Chin/jaw
  shape.quadraticCurveTo(-0.14, 0.38, -0.12, 0.32);
  
  // Neck front
  shape.quadraticCurveTo(-0.14, 0.24, -0.18, 0.16);
  
  // Back to base
  shape.quadraticCurveTo(-0.22, 0.12, -0.25, 0.08);
  shape.lineTo(-0.28, 0.08);
  shape.lineTo(-0.28, 0.02);
  shape.lineTo(-0.25, 0);
  
  return shape;
}

function KnightPiece({ color, position, isSelected, isInCheck, onClick }: Omit<ChessPiece3DProps, 'type'>) {
  const meshRef = useRef<Mesh>(null);
  const targetY = useRef(position[1]);
  const currentY = useRef(position[1]);
  
  const isWhite = color === 'w';
  const pieceColor = isWhite ? '#fdf8f0' : '#1a1410';
  const emissiveColor = isInCheck 
    ? '#ff3333'
    : isSelected 
      ? '#ffd700' 
      : isWhite ? '#fff5e6' : '#2a1f18';
  const emissiveIntensity = isInCheck ? 0.8 : isSelected ? 0.6 : 0.03;

  targetY.current = isSelected ? position[1] + 0.35 : position[1];

  useFrame((_, delta) => {
    if (meshRef.current) {
      const diff = targetY.current - currentY.current;
      currentY.current += diff * delta * 10;
      meshRef.current.position.y = currentY.current;
      
      if (isSelected) {
        meshRef.current.rotation.y += delta * 0.8;
      }
    }
  });

  const geometry = useMemo(() => {
    const shape = createKnightShape();
    const extrudeSettings = {
      steps: 1,
      depth: 0.35,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.06,
      bevelOffset: 0,
      bevelSegments: 12,
    };
    return new ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[Math.PI / 2, isWhite ? Math.PI / 2 : -Math.PI / 2, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      geometry={geometry}
      castShadow
      receiveShadow
    >
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

function LatheBasedPiece({ type, color, position, isSelected, isInCheck, onClick }: ChessPiece3DProps) {
  const meshRef = useRef<Mesh>(null);
  const targetY = useRef(position[1]);
  const currentY = useRef(position[1]);

  const isWhite = color === 'w';
  
  const pieceColor = isWhite ? '#fdf8f0' : '#1a1410';
  const emissiveColor = isInCheck 
    ? '#ff3333'
    : isSelected 
      ? '#ffd700' 
      : isWhite ? '#fff5e6' : '#2a1f18';
  const emissiveIntensity = isInCheck ? 0.8 : isSelected ? 0.6 : 0.03;

  targetY.current = isSelected ? position[1] + 0.35 : position[1];

  useFrame((_, delta) => {
    if (meshRef.current) {
      const diff = targetY.current - currentY.current;
      currentY.current += diff * delta * 10;
      meshRef.current.position.y = currentY.current;
      
      if (isSelected) {
        meshRef.current.rotation.y += delta * 0.8;
      }
    }
  });

  const points = useMemo(() => {
    if (type === 'n') return [];
    const { segments } = pieceGeometry[type];
    return segments.map(([x, y]) => new Vector2(x, y));
  }, [type]);

  if (type === 'n') return null;

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

export function ChessPiece3D(props: ChessPiece3DProps) {
  if (props.type === 'n') {
    return <KnightPiece {...props} />;
  }
  return <LatheBasedPiece {...props} />;
}

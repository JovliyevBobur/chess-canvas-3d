import { Text, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Mesh } from 'three';

interface GameOverlayProps {
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  winner: 'w' | 'b' | null;
}

function CheckIndicator({ visible }: { visible: boolean }) {
  const textRef = useRef<Mesh>(null);
  const [pulse, setPulse] = useState(0);

  useFrame((_, delta) => {
    if (visible && textRef.current) {
      setPulse((prev) => (prev + delta * 4) % (Math.PI * 2));
      const scale = 1 + Math.sin(pulse) * 0.1;
      textRef.current.scale.setScalar(scale);
    }
  });

  if (!visible) return null;

  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
      <group position={[0, 3, 0]}>
        <Text
          ref={textRef}
          fontSize={0.8}
          color="#ff4444"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#ffaa00"
        >
          CHECK!
          <meshBasicMaterial
            color="#ff4444"
            toneMapped={false}
          />
        </Text>
        {/* Glow effect */}
        <pointLight position={[0, 0, 0.5]} intensity={2} color="#ff4444" distance={5} />
      </group>
    </Float>
  );
}

function GameEndOverlay({ isCheckmate, isStalemate, winner }: Omit<GameOverlayProps, 'isCheck'>) {
  const [opacity, setOpacity] = useState(0);
  const groupRef = useRef<any>(null);

  useFrame((_, delta) => {
    if ((isCheckmate || isStalemate) && opacity < 1) {
      setOpacity((prev) => Math.min(prev + delta * 2, 1));
    }
  });

  if (!isCheckmate && !isStalemate) return null;

  const text = isStalemate 
    ? 'STALEMATE' 
    : winner === 'w' 
      ? 'WHITE WINS!' 
      : 'BLACK WINS!';
  
  const textColor = isStalemate 
    ? '#888888' 
    : winner === 'w' 
      ? '#ffffff' 
      : '#1a1a1a';
  
  const glowColor = isStalemate 
    ? '#666666' 
    : winner === 'w' 
      ? '#ffd700' 
      : '#4a4a4a';

  const outlineColor = isStalemate
    ? '#444444'
    : winner === 'w'
      ? '#ffaa00'
      : '#888888';

  return (
    <group ref={groupRef} position={[0, 4, 0]}>
      {/* Background dim plane */}
      <mesh position={[0, -2, -2]} rotation={[0, 0, 0]}>
        <planeGeometry args={[20, 15]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={opacity * 0.5}
          depthWrite={false}
        />
      </mesh>
      
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.3}>
        <Text
          fontSize={1.2}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.08}
          outlineColor={outlineColor}
        >
          {text}
          <meshBasicMaterial
            color={textColor}
            transparent
            opacity={opacity}
            toneMapped={false}
          />
        </Text>
      </Float>
      
      {/* Winner glow */}
      <pointLight 
        position={[0, 0, 2]} 
        intensity={opacity * 5} 
        color={glowColor} 
        distance={10} 
      />
      
      {/* Subtitle */}
      <Text
        position={[0, -1, 0]}
        fontSize={0.4}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
      >
        {isCheckmate ? 'CHECKMATE' : 'DRAW'}
        <meshBasicMaterial
          color="#aaaaaa"
          transparent
          opacity={opacity * 0.8}
          toneMapped={false}
        />
      </Text>
    </group>
  );
}

export function GameOverlay({ isCheck, isCheckmate, isStalemate, winner }: GameOverlayProps) {
  return (
    <>
      <CheckIndicator visible={isCheck && !isCheckmate} />
      <GameEndOverlay 
        isCheckmate={isCheckmate} 
        isStalemate={isStalemate} 
        winner={winner} 
      />
    </>
  );
}

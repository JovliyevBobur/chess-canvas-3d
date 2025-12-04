import { Text } from '@react-three/drei';

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

export function BoardLabels() {
  const labels: JSX.Element[] = [];
  const labelOffset = 4.6;
  const labelY = 0.05;

  // File labels (a-h) on both sides
  files.forEach((file, i) => {
    const x = i - 3.5;
    
    // Front (white side)
    labels.push(
      <Text
        key={`file-front-${file}`}
        position={[x, labelY, labelOffset]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.25}
        color="#c9a66b"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        {file}
      </Text>
    );
    
    // Back (black side)
    labels.push(
      <Text
        key={`file-back-${file}`}
        position={[x, labelY, -labelOffset]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        fontSize={0.25}
        color="#c9a66b"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        {file}
      </Text>
    );
  });

  // Rank labels (1-8) on both sides
  ranks.forEach((rank, i) => {
    const z = i - 3.5;
    
    // Left side
    labels.push(
      <Text
        key={`rank-left-${rank}`}
        position={[-labelOffset, labelY, z]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        fontSize={0.25}
        color="#c9a66b"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        {rank}
      </Text>
    );
    
    // Right side
    labels.push(
      <Text
        key={`rank-right-${rank}`}
        position={[labelOffset, labelY, z]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={0.25}
        color="#c9a66b"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        {rank}
      </Text>
    );
  });

  return <group>{labels}</group>;
}

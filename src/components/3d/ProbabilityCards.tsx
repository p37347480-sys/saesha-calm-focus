import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Probability - Card Clash & Dice games
export function ProbabilityCards() {
  const cardsRef = useRef<THREE.Mesh[]>([]);
  const diceRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate cards
    cardsRef.current.forEach((card, i) => {
      if (card) {
        card.rotation.y = Math.sin(time * 0.5 + i) * 0.3;
      }
    });
    
    // Rotate dice
    if (diceRef.current) {
      diceRef.current.rotation.x = time * 0.3;
      diceRef.current.rotation.y = time * 0.4;
    }
  });

  const cardPositions: [number, number, number][] = [
    [-1.5, 0.5, -2.5],
    [-0.5, 0.3, -2.8],
    [0.5, 0.4, -2.6],
    [1.5, 0.2, -3],
  ];

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <pointLight position={[-3, 2, 0]} intensity={0.6} color="#ef4444" />
      <pointLight position={[3, 2, 0]} intensity={0.6} color="#3b82f6" />
      
      {/* Playing cards */}
      {cardPositions.map((pos, i) => (
        <Float key={i} speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
          <mesh
            ref={(el) => {
              if (el) cardsRef.current[i] = el;
            }}
            position={pos}
            rotation={[0, 0, Math.PI / 12]}
          >
            <boxGeometry args={[0.6, 0.9, 0.02]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#ef4444' : '#3b82f6'}
              metalness={0.3}
              roughness={0.4}
              emissive={i % 2 === 0 ? '#ef4444' : '#3b82f6'}
              emissiveIntensity={0.2}
            />
          </mesh>
        </Float>
      ))}
      
      {/* Dice */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
        <mesh ref={diceRef} position={[0, -1, -2.5]}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial
            color="#f8fafc"
            metalness={0.2}
            roughness={0.6}
          />
        </mesh>
      </Float>
      
      {/* Table surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -3]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.4} />
      </mesh>
    </>
  );
}

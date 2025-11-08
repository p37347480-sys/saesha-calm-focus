import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Fraction Master - Pizza/Pie divisions
export function FractionPizza() {
  const slicesRef = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Gentle rotation and float for slices
    slicesRef.current.forEach((slice, i) => {
      if (slice) {
        slice.position.y = Math.sin(time * 0.5 + i * 0.5) * 0.1;
        slice.rotation.y = time * 0.2 + (i * Math.PI / 4);
      }
    });
  });

  // Create pizza slices
  const sliceCount = 8;
  const slices: JSX.Element[] = [];
  
  for (let i = 0; i < sliceCount; i++) {
    const angle = (i / sliceCount) * Math.PI * 2;
    const x = Math.cos(angle) * 0.3;
    const z = Math.sin(angle) * 0.3 - 3;
    const color = i % 2 === 0 ? '#fbbf24' : '#f59e0b';
    
    slices.push(
      <Float key={i} speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh
          ref={(el) => {
            if (el) slicesRef.current[i] = el;
          }}
          position={[x, 0, z]}
          rotation={[0, angle, 0]}
        >
          <cylinderGeometry args={[0.8, 0.8, 0.15, 32, 1, false, 0, Math.PI / 4]} />
          <meshStandardMaterial
            color={color}
            metalness={0.2}
            roughness={0.7}
            emissive={color}
            emissiveIntensity={0.15}
          />
        </mesh>
      </Float>
    );
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[0, 3, -3]} intensity={0.7} color="#fbbf24" />
      
      {/* Pizza slices */}
      <group position={[0, 0, 0]}>
        {slices}
      </group>
      
      {/* Center circle */}
      <mesh position={[0, 0, -3]}>
        <cylinderGeometry args={[0.15, 0.15, 0.2, 32]} />
        <meshStandardMaterial
          color="#dc2626"
          emissive="#dc2626"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Plate */}
      <mesh position={[0, -0.2, -3]}>
        <cylinderGeometry args={[1.5, 1.5, 0.05, 32]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>
    </>
  );
}

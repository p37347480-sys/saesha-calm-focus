import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// AquaTank Architect - Volume calculations with water
export function AquaTank() {
  const waterRef = useRef<THREE.Mesh>(null);
  const bubblesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate water surface
    if (waterRef.current) {
      waterRef.current.position.y = Math.sin(time * 0.5) * 0.05 - 0.5;
    }
    
    // Animate bubbles
    if (bubblesRef.current) {
      bubblesRef.current.children.forEach((bubble, i) => {
        bubble.position.y = ((time * 0.5 + i * 0.5) % 3) - 1.5;
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[0, 2, 0]} intensity={0.7} color="#06b6d4" />
      
      {/* Tank container - transparent */}
      <mesh position={[0, 0, -3]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color="#06b6d4"
          transparent
          opacity={0.2}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      
      {/* Water - semi-transparent */}
      <mesh ref={waterRef} position={[0, -0.5, -3]}>
        <boxGeometry args={[1.9, 1.5, 1.9]} />
        <meshStandardMaterial
          color="#0ea5e9"
          transparent
          opacity={0.6}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
      
      {/* Bubbles */}
      <group ref={bubblesRef}>
        {[...Array(6)].map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 1.5,
              -1.5,
              -3 + (Math.random() - 0.5) * 1.5,
            ]}
          >
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#67e8f9"
              transparent
              opacity={0.6}
              emissive="#67e8f9"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
      </group>
      
      {/* Cylinder section */}
      <mesh position={[0, 1.5, -3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.5, 32]} />
        <meshStandardMaterial
          color="#0284c7"
          transparent
          opacity={0.4}
          roughness={0.2}
        />
      </mesh>
    </>
  );
}

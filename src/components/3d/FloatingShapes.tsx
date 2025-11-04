import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShape({ position, color, type }: { position: [number, number, number]; color: string; type: 'sphere' | 'box' | 'torus' }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        {type === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
        {type === 'box' && <boxGeometry args={[0.8, 0.8, 0.8]} />}
        {type === 'torus' && <torusGeometry args={[0.5, 0.2, 16, 32]} />}
        <meshStandardMaterial 
          color={color} 
          metalness={0.6}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

export function FloatingShapes() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#b4a7d6" />
      
      <FloatingShape position={[-2, 1, -2]} color="#b4a7d6" type="sphere" />
      <FloatingShape position={[2, -1, -2]} color="#a8d5ba" type="box" />
      <FloatingShape position={[0, 2, -3]} color="#f5c4a8" type="torus" />
      <FloatingShape position={[-3, -2, -1]} color="#f5b5c4" type="sphere" />
      <FloatingShape position={[3, 1, -2]} color="#a8d5f5" type="box" />
    </>
  );
}

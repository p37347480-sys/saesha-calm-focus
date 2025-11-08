import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Break the Lock - Algebra equations
export function AlgebraLock() {
  const ringRefs = useRef<THREE.Mesh[]>([]);
  const lockBodyRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Rotate combination rings
    ringRefs.current.forEach((ring, i) => {
      if (ring) {
        ring.rotation.z = Math.sin(time * 0.3 + i * 0.5) * 0.5;
      }
    });
    
    // Pulse lock body
    if (lockBodyRef.current) {
      const scale = 1 + Math.sin(time * 2) * 0.02;
      lockBodyRef.current.scale.setScalar(scale);
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[0, 0, 2]} intensity={0.8} color="#3b82f6" />
      <pointLight position={[0, 0, -5]} intensity={0.5} color="#f97316" />
      
      {/* Lock body */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh ref={lockBodyRef} position={[0, 0, -3]}>
          <boxGeometry args={[1.5, 2, 0.4]} />
          <meshStandardMaterial
            color="#1e40af"
            metalness={0.9}
            roughness={0.2}
            emissive="#3b82f6"
            emissiveIntensity={0.2}
          />
        </mesh>
      </Float>
      
      {/* Combination rings */}
      {[-0.5, 0, 0.5].map((xPos, i) => (
        <Float key={i} speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <mesh
            ref={(el) => {
              if (el) ringRefs.current[i] = el;
            }}
            position={[xPos, 0.5, -2.5]}
          >
            <torusGeometry args={[0.25, 0.08, 16, 32]} />
            <meshStandardMaterial
              color={i === 1 ? '#f97316' : '#3b82f6'}
              metalness={0.8}
              roughness={0.3}
              emissive={i === 1 ? '#f97316' : '#3b82f6'}
              emissiveIntensity={0.4}
            />
          </mesh>
        </Float>
      ))}
      
      {/* Keyhole */}
      <mesh position={[0, -0.5, -2.8]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive="#3b82f6"
          emissiveIntensity={0.5}
        />
      </mesh>
    </>
  );
}

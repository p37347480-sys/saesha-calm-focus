import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Algebra Block Builder - Expanding expressions through 3D block construction
export function AlgebraBlockBuilder() {
  const aBlockRef = useRef<THREE.Mesh>(null);
  const bBlockRef = useRef<THREE.Mesh>(null);
  const a2Ref = useRef<THREE.Mesh>(null);
  const b2Ref = useRef<THREE.Mesh>(null);
  const abRef = useRef<THREE.Mesh>(null);
  const ab2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate the "a" block
    if (aBlockRef.current) {
      aBlockRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      aBlockRef.current.position.y = Math.sin(time * 0.8) * 0.1 + 1;
    }
    
    // Animate the "b" block
    if (bBlockRef.current) {
      bBlockRef.current.rotation.y = Math.cos(time * 0.5) * 0.1;
      bBlockRef.current.position.y = Math.cos(time * 0.8) * 0.1 + 0.5;
    }
    
    // Pulse a² tile
    if (a2Ref.current) {
      const scale = 1 + Math.sin(time * 2) * 0.05;
      a2Ref.current.scale.setScalar(scale);
    }
    
    // Pulse b² tile
    if (b2Ref.current) {
      const scale = 1 + Math.cos(time * 2) * 0.05;
      b2Ref.current.scale.setScalar(scale);
    }
    
    // Animate ab plane connections
    if (abRef.current) {
      abRef.current.rotation.z = Math.sin(time) * 0.05;
    }
    if (ab2Ref.current) {
      ab2Ref.current.rotation.z = Math.cos(time) * 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.7} />
      <pointLight position={[-3, 3, 2]} intensity={0.6} color="#8b5cf6" />
      <pointLight position={[3, -2, 2]} intensity={0.4} color="#06b6d4" />
      
      {/* Grid floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[10, 10, 20, 20]} />
        <meshStandardMaterial 
          color="#1e1b4b" 
          wireframe 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
      {/* "a" block - long rectangular prism */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh ref={aBlockRef} position={[-2, 1, 0]}>
          <boxGeometry args={[1.5, 0.4, 0.4]} />
          <meshStandardMaterial
            color="#8b5cf6"
            metalness={0.7}
            roughness={0.2}
            emissive="#8b5cf6"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>
      
      {/* "b" block - shorter rectangular prism */}
      <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.25}>
        <mesh ref={bBlockRef} position={[2, 0.5, 0]}>
          <boxGeometry args={[0.8, 0.4, 0.4]} />
          <meshStandardMaterial
            color="#06b6d4"
            metalness={0.7}
            roughness={0.2}
            emissive="#06b6d4"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>
      
      {/* a² square tile */}
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.15}>
        <mesh ref={a2Ref} position={[-1.2, -0.5, -1]}>
          <boxGeometry args={[1.2, 0.1, 1.2]} />
          <meshStandardMaterial
            color="#a78bfa"
            metalness={0.8}
            roughness={0.15}
            emissive="#a78bfa"
            emissiveIntensity={0.4}
          />
        </mesh>
      </Float>
      
      {/* b² smaller square tile */}
      <Float speed={1.4} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh ref={b2Ref} position={[1.5, -0.5, -1]}>
          <boxGeometry args={[0.7, 0.1, 0.7]} />
          <meshStandardMaterial
            color="#22d3ee"
            metalness={0.8}
            roughness={0.15}
            emissive="#22d3ee"
            emissiveIntensity={0.4}
          />
        </mesh>
      </Float>
      
      {/* ab plane - intersection representation */}
      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.1}>
        <mesh ref={abRef} position={[0, 0, 0.8]}>
          <boxGeometry args={[1.2, 0.08, 0.7]} />
          <meshStandardMaterial
            color="#c4b5fd"
            metalness={0.6}
            roughness={0.3}
            emissive="#c4b5fd"
            emissiveIntensity={0.25}
            transparent
            opacity={0.8}
          />
        </mesh>
      </Float>
      
      {/* Second ab plane */}
      <Float speed={1.1} rotationIntensity={0.05} floatIntensity={0.1}>
        <mesh ref={ab2Ref} position={[0, -0.8, 0.8]}>
          <boxGeometry args={[1.2, 0.08, 0.7]} />
          <meshStandardMaterial
            color="#c4b5fd"
            metalness={0.6}
            roughness={0.3}
            emissive="#c4b5fd"
            emissiveIntensity={0.25}
            transparent
            opacity={0.8}
          />
        </mesh>
      </Float>
      
      {/* Connecting lines/beams */}
      {[-1, 1].map((x, i) => (
        <mesh key={i} position={[x * 0.8, 0.2, -0.5]}>
          <cylinderGeometry args={[0.02, 0.02, 1.5, 8]} />
          <meshStandardMaterial
            color="#e879f9"
            emissive="#e879f9"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </>
  );
}

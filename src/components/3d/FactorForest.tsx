import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Factor Forest Adventure - Factorising expressions by deconstructing magical trees
export function FactorForest() {
  const trunkRef = useRef<THREE.Mesh>(null);
  const branch1Ref = useRef<THREE.Mesh>(null);
  const branch2Ref = useRef<THREE.Mesh>(null);
  const root1Ref = useRef<THREE.Mesh>(null);
  const root2Ref = useRef<THREE.Mesh>(null);
  const leavesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Gentle trunk sway
    if (trunkRef.current) {
      trunkRef.current.rotation.z = Math.sin(time * 0.3) * 0.02;
    }
    
    // Branch animations
    if (branch1Ref.current) {
      branch1Ref.current.rotation.z = Math.sin(time * 0.5) * 0.05 - 0.4;
    }
    if (branch2Ref.current) {
      branch2Ref.current.rotation.z = Math.cos(time * 0.5) * 0.05 + 0.4;
    }
    
    // Glowing factor roots pulse
    if (root1Ref.current) {
      const scale = 1 + Math.sin(time * 2) * 0.1;
      root1Ref.current.scale.set(scale, scale, scale);
    }
    if (root2Ref.current) {
      const scale = 1 + Math.cos(time * 2) * 0.1;
      root2Ref.current.scale.set(scale, scale, scale);
    }
    
    // Leaves rotation
    if (leavesRef.current) {
      leavesRef.current.rotation.y = time * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 3]} intensity={0.6} color="#fef3c7" />
      <pointLight position={[-3, 2, 2]} intensity={0.5} color="#22c55e" />
      <pointLight position={[3, -1, 2]} intensity={0.4} color="#a855f7" />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial color="#134e4a" />
      </mesh>
      
      {/* Tree trunk - represents x² */}
      <Float speed={0.5} rotationIntensity={0.02} floatIntensity={0.05}>
        <mesh ref={trunkRef} position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 3, 12]} />
          <meshStandardMaterial
            color="#92400e"
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>
      </Float>
      
      {/* Branch 1 - represents linear term */}
      <mesh ref={branch1Ref} position={[-0.5, 1.5, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.1, 0.15, 1.5, 8]} />
        <meshStandardMaterial
          color="#a16207"
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>
      
      {/* Branch 2 - represents another linear term */}
      <mesh ref={branch2Ref} position={[0.5, 1.8, 0]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.1, 0.15, 1.5, 8]} />
        <meshStandardMaterial
          color="#a16207"
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>
      
      {/* Leaves/crown - represents constant terms */}
      <group ref={leavesRef} position={[0, 2.5, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Float key={i} speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
            <mesh
              position={[
                Math.cos((i / 6) * Math.PI * 2) * 0.8,
                Math.sin(i * 0.5) * 0.3,
                Math.sin((i / 6) * Math.PI * 2) * 0.8
              ]}
            >
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial
                color="#22c55e"
                metalness={0.3}
                roughness={0.5}
                emissive="#22c55e"
                emissiveIntensity={0.2}
              />
            </mesh>
          </Float>
        ))}
      </group>
      
      {/* Glowing factor root 1 - (x + 2) */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh ref={root1Ref} position={[-1.2, -1.5, 0.5]}>
          <dodecahedronGeometry args={[0.4]} />
          <meshStandardMaterial
            color="#a855f7"
            metalness={0.8}
            roughness={0.2}
            emissive="#a855f7"
            emissiveIntensity={0.6}
          />
        </mesh>
      </Float>
      
      {/* Glowing factor root 2 - (x + 3) */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh ref={root2Ref} position={[1.2, -1.5, 0.5]}>
          <dodecahedronGeometry args={[0.4]} />
          <meshStandardMaterial
            color="#ec4899"
            metalness={0.8}
            roughness={0.2}
            emissive="#ec4899"
            emissiveIntensity={0.6}
          />
        </mesh>
      </Float>
      
      {/* Root connections to trunk */}
      <mesh position={[-0.6, -1, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.08, 0.1, 1.2, 8]} />
        <meshStandardMaterial
          color="#713f12"
          emissive="#a855f7"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0.6, -1, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.08, 0.1, 1.2, 8]} />
        <meshStandardMaterial
          color="#713f12"
          emissive="#ec4899"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Magical particles */}
      {[...Array(12)].map((_, i) => (
        <Float key={i} speed={3} rotationIntensity={0.5} floatIntensity={1}>
          <mesh
            position={[
              (Math.random() - 0.5) * 4,
              Math.random() * 3 - 1,
              (Math.random() - 0.5) * 3
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#a855f7' : '#22c55e'}
              emissive={i % 2 === 0 ? '#a855f7' : '#22c55e'}
              emissiveIntensity={1}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

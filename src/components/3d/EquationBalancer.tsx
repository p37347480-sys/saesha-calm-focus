import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Equation Balancer Arena - Solving equations using physics-based balance scales
export function EquationBalancer() {
  const beamRef = useRef<THREE.Mesh>(null);
  const leftPanRef = useRef<THREE.Group>(null);
  const rightPanRef = useRef<THREE.Group>(null);
  const xCubeRef = useRef<THREE.Mesh>(null);
  const pivotRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Gentle balance beam tilt animation
    if (beamRef.current) {
      beamRef.current.rotation.z = Math.sin(time * 0.5) * 0.05;
    }
    
    // Pan sway - opposite to beam tilt
    if (leftPanRef.current) {
      leftPanRef.current.position.y = -1.5 + Math.sin(time * 0.5) * 0.1;
    }
    if (rightPanRef.current) {
      rightPanRef.current.position.y = -1.5 - Math.sin(time * 0.5) * 0.1;
    }
    
    // Glowing x cube pulse
    if (xCubeRef.current) {
      const scale = 1 + Math.sin(time * 2) * 0.08;
      xCubeRef.current.scale.setScalar(scale);
      xCubeRef.current.rotation.y = time * 0.5;
    }
    
    // Pivot glow
    if (pivotRef.current) {
      const intensity = 0.3 + Math.sin(time * 3) * 0.1;
      (pivotRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} />
      <pointLight position={[-3, 2, 2]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[3, 2, 2]} intensity={0.5} color="#f59e0b" />
      
      {/* Arena floor - futuristic grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[12, 12, 24, 24]} />
        <meshStandardMaterial 
          color="#0c4a6e" 
          wireframe 
          transparent 
          opacity={0.4}
        />
      </mesh>
      
      {/* Pivot/fulcrum - triangle base */}
      <mesh ref={pivotRef} position={[0, 0, 0]}>
        <coneGeometry args={[0.5, 1.5, 4]} />
        <meshStandardMaterial
          color="#f59e0b"
          metalness={0.9}
          roughness={0.1}
          emissive="#f59e0b"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Balance beam */}
      <mesh ref={beamRef} position={[0, 0.8, 0]}>
        <boxGeometry args={[5, 0.15, 0.3]} />
        <meshStandardMaterial
          color="#475569"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Left pan group */}
      <group ref={leftPanRef} position={[-2, -1.5, 0]}>
        {/* Pan chains */}
        {[-0.3, 0.3].map((z, i) => (
          <mesh key={i} position={[0, 0.7, z]}>
            <cylinderGeometry args={[0.02, 0.02, 1.4, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        {/* Pan platform */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.7, 0.1, 32]} />
          <meshStandardMaterial
            color="#64748b"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        
        {/* Glowing "x" cube on left */}
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.2}>
          <mesh ref={xCubeRef} position={[0, 0.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial
              color="#3b82f6"
              metalness={0.8}
              roughness={0.1}
              emissive="#3b82f6"
              emissiveIntensity={0.6}
            />
          </mesh>
        </Float>
      </group>
      
      {/* Right pan group */}
      <group ref={rightPanRef} position={[2, -1.5, 0]}>
        {/* Pan chains */}
        {[-0.3, 0.3].map((z, i) => (
          <mesh key={i} position={[0, 0.7, z]}>
            <cylinderGeometry args={[0.02, 0.02, 1.4, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        {/* Pan platform */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.7, 0.1, 32]} />
          <meshStandardMaterial
            color="#64748b"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        
        {/* Constant term weights - metal balls */}
        {[
          { pos: [-0.2, 0.25, 0.15], size: 0.2 },
          { pos: [0.2, 0.25, -0.1], size: 0.2 },
          { pos: [0, 0.25, -0.2], size: 0.2 }
        ].map((ball, i) => (
          <Float key={i} speed={1.5} rotationIntensity={0.1} floatIntensity={0.1}>
            <mesh position={ball.pos as [number, number, number]}>
              <sphereGeometry args={[ball.size, 16, 16]} />
              <meshStandardMaterial
                color="#f59e0b"
                metalness={0.9}
                roughness={0.1}
                emissive="#f59e0b"
                emissiveIntensity={0.2}
              />
            </mesh>
          </Float>
        ))}
      </group>
      
      {/* Floating equation symbols decoration */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[0, 2.5, -2]}>
          <torusGeometry args={[0.3, 0.08, 16, 32]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>
      
      {/* Anti-gravity negative weight (red) floating nearby */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
        <mesh position={[-3, 1, 1]}>
          <octahedronGeometry args={[0.3]} />
          <meshStandardMaterial
            color="#ef4444"
            metalness={0.8}
            roughness={0.1}
            emissive="#ef4444"
            emissiveIntensity={0.4}
          />
        </mesh>
      </Float>
      
      {/* Arena pillars */}
      {[-4, 4].map((x, i) => (
        <mesh key={i} position={[x, -1, -3]}>
          <cylinderGeometry args={[0.2, 0.25, 4, 8]} />
          <meshStandardMaterial
            color="#1e3a5f"
            metalness={0.6}
            roughness={0.4}
            emissive="#3b82f6"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </>
  );
}

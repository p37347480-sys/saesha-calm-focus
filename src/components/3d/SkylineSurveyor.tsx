import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Skyline Surveyor - Trigonometry building height measurement
export function SkylineSurveyor() {
  const buildingRefs = useRef<THREE.Mesh[]>([]);
  const laserRef = useRef<THREE.Line>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate laser scanning
    if (laserRef.current) {
      laserRef.current.rotation.z = Math.sin(time * 0.5) * 0.3;
    }
    
    // Subtle building sway
    buildingRefs.current.forEach((building, i) => {
      if (building) {
        building.rotation.z = Math.sin(time * 0.3 + i) * 0.02;
      }
    });
  });

  const buildings = [
    { pos: [-3, -1, -4] as [number, number, number], height: 2, color: '#3b82f6' },
    { pos: [-1, -1, -3] as [number, number, number], height: 3, color: '#2563eb' },
    { pos: [1, -1, -3.5] as [number, number, number], height: 2.5, color: '#1d4ed8' },
    { pos: [3, -1, -4] as [number, number, number], height: 1.8, color: '#1e40af' },
  ];

  // Create laser line
  const laserPoints = [
    new THREE.Vector3(0, -2, 0),
    new THREE.Vector3(0, 2, -3),
  ];
  const laserGeometry = new THREE.BufferGeometry().setFromPoints(laserPoints);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#fbbf24" />
      <pointLight position={[0, 3, -2]} intensity={0.6} color="#10b981" />
      
      {/* Buildings */}
      {buildings.map((building, i) => (
        <Float key={i} speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
          <mesh
            ref={(el) => {
              if (el) buildingRefs.current[i] = el;
            }}
            position={building.pos}
          >
            <boxGeometry args={[0.6, building.height, 0.6]} />
            <meshStandardMaterial
              color={building.color}
              metalness={0.7}
              roughness={0.3}
              emissive={building.color}
              emissiveIntensity={0.15}
            />
          </mesh>
        </Float>
      ))}
      
      {/* Laser beam */}
      <primitive object={new THREE.Line(laserGeometry, new THREE.LineBasicMaterial({ color: '#10b981', linewidth: 2, transparent: true, opacity: 0.6 }))} ref={laserRef} />
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, -3]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1f2937" transparent opacity={0.3} />
      </mesh>
    </>
  );
}

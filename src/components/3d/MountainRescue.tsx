import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Mountain Rescue Drone - Elevation and angles
export function MountainRescue() {
  const droneRef = useRef<THREE.Mesh>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const pathRef = useRef<THREE.Line>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate drone movement
    if (droneRef.current) {
      droneRef.current.position.y = Math.sin(time * 0.5) * 0.5 + 1;
      droneRef.current.rotation.y = time * 0.3;
    }
    
    // Pulsing beacon
    if (beaconRef.current) {
      beaconRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
    }
  });

  // Flight path line
  const pathPoints = [
    new THREE.Vector3(-2, -1.5, -2),
    new THREE.Vector3(-1, 0, -2.5),
    new THREE.Vector3(0, 1, -3),
    new THREE.Vector3(1, 2, -3.5),
  ];
  const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#fcd34d" />
      <pointLight position={[1, 3, -3]} intensity={0.8} color="#ef4444" />
      
      {/* Mountains */}
      <mesh position={[-2, -0.5, -4]}>
        <coneGeometry args={[1.5, 3, 4]} />
        <meshStandardMaterial color="#6b7280" roughness={0.8} />
      </mesh>
      <mesh position={[1, 0, -3.5]}>
        <coneGeometry args={[1.2, 4, 4]} />
        <meshStandardMaterial color="#4b5563" roughness={0.8} />
      </mesh>
      <mesh position={[2.5, -1, -4.5]}>
        <coneGeometry args={[1, 2.5, 4]} />
        <meshStandardMaterial color="#374151" roughness={0.8} />
      </mesh>
      
      {/* Drone */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={droneRef} position={[0, 1, -2]}>
          <boxGeometry args={[0.3, 0.1, 0.3]} />
          <meshStandardMaterial 
            color="#ef4444" 
            emissive="#ef4444" 
            emissiveIntensity={0.5}
            metalness={0.8}
          />
        </mesh>
      </Float>
      
      {/* Beacon at peak */}
      <mesh ref={beaconRef} position={[1, 2.2, -3.5]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* Flight path */}
      <primitive object={new THREE.Line(pathGeometry, new THREE.LineBasicMaterial({ color: '#10b981', linewidth: 2, transparent: true, opacity: 0.5 }))} ref={pathRef} />
    </>
  );
}

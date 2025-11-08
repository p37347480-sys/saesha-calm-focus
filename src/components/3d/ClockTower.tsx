import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Clock Tower Challenge - Time and circular functions
export function ClockTower() {
  const gearRefs = useRef<THREE.Mesh[]>([]);
  const hourHandRef = useRef<THREE.Mesh>(null);
  const minuteHandRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Rotate gears
    gearRefs.current.forEach((gear, i) => {
      if (gear) {
        gear.rotation.z = time * (i % 2 === 0 ? 0.5 : -0.5);
      }
    });
    
    // Rotate clock hands
    if (hourHandRef.current) {
      hourHandRef.current.rotation.z = -time * 0.1;
    }
    if (minuteHandRef.current) {
      minuteHandRef.current.rotation.z = -time * 0.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <pointLight position={[0, 0, 2]} intensity={0.8} color="#d97706" />
      
      {/* Clock face */}
      <mesh position={[0, 0.5, -3]}>
        <cylinderGeometry args={[1.2, 1.2, 0.2, 32]} />
        <meshStandardMaterial
          color="#78350f"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {/* Hour hand */}
      <mesh ref={hourHandRef} position={[0, 0.5, -2.8]}>
        <boxGeometry args={[0.08, 0.5, 0.05]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Minute hand */}
      <mesh ref={minuteHandRef} position={[0, 0.5, -2.75]}>
        <boxGeometry args={[0.05, 0.8, 0.05]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Gears */}
      {[
        { pos: [-1.5, -0.5, -2] as [number, number, number], radius: 0.4 },
        { pos: [1.5, -0.5, -2.5] as [number, number, number], radius: 0.5 },
        { pos: [-1, -1.5, -2.8] as [number, number, number], radius: 0.35 },
        { pos: [1.2, -1.8, -2.3] as [number, number, number], radius: 0.45 },
      ].map((gear, i) => (
        <Float key={i} speed={0.5} rotationIntensity={0} floatIntensity={0.2}>
          <mesh
            ref={(el) => {
              if (el) gearRefs.current[i] = el;
            }}
            position={gear.pos}
          >
            <torusGeometry args={[gear.radius, 0.08, 8, 8]} />
            <meshStandardMaterial
              color="#b45309"
              metalness={0.9}
              roughness={0.2}
              emissive="#d97706"
              emissiveIntensity={0.2}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

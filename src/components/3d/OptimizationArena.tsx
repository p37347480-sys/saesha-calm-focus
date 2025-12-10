import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

function OptimizableShape({ 
  dimensions, 
  efficiency 
}: { 
  dimensions: { width: number; height: number; depth: number };
  efficiency: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  // Color based on efficiency: blue (low) to green (high) to red (max)
  const getColor = () => {
    if (efficiency < 0.5) {
      return new THREE.Color('#3b82f6').lerp(new THREE.Color('#22c55e'), efficiency * 2);
    }
    return new THREE.Color('#22c55e').lerp(new THREE.Color('#ef4444'), (efficiency - 0.5) * 2);
  };

  return (
    <group>
      {/* Glow effect */}
      <mesh ref={glowRef} scale={1.1}>
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
        <meshBasicMaterial color={getColor()} transparent opacity={0.2} />
      </mesh>

      {/* Main shape */}
      <mesh ref={meshRef}>
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
        <meshStandardMaterial 
          color={getColor()} 
          transparent 
          opacity={0.85}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

function EfficiencyMeter({ value, position }: { value: number; position: [number, number, number] }) {
  const fillRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (fillRef.current) {
      fillRef.current.scale.y = THREE.MathUtils.lerp(fillRef.current.scale.y, value, 0.05);
      fillRef.current.position.y = (value * 2) / 2 - 1;
    }
  });

  return (
    <group position={position}>
      {/* Background */}
      <mesh>
        <boxGeometry args={[0.3, 4, 0.1]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Fill */}
      <mesh ref={fillRef} position={[0, -1, 0.06]}>
        <boxGeometry args={[0.25, 4, 0.05]} />
        <meshStandardMaterial 
          color={value > 0.7 ? "#22c55e" : value > 0.4 ? "#f59e0b" : "#ef4444"} 
        />
      </mesh>

      <Text position={[0, 2.5, 0]} fontSize={0.2} color="#ffffff" anchorX="center">
        Efficiency
      </Text>
    </group>
  );
}

function DimensionSlider({ 
  label, 
  value, 
  position 
}: { 
  label: string; 
  value: number; 
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <Text position={[0, 0.4, 0]} fontSize={0.15} color="#94a3b8" anchorX="center">
        {label}
      </Text>
      
      {/* Slider track */}
      <mesh>
        <boxGeometry args={[2, 0.1, 0.1]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>

      {/* Slider knob */}
      <mesh position={[(value - 0.5) * 2, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#a855f7" />
      </mesh>
    </group>
  );
}

export function OptimizationArena() {
  const [dimensions] = useState({ width: 1.5, height: 2, depth: 1 });
  const [efficiency] = useState(0.65);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#3b82f6" />

      {/* Arena Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Arena Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]}>
        <ringGeometry args={[7.5, 8, 64]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.3} />
      </mesh>

      {/* Main Optimizable Shape */}
      <OptimizableShape dimensions={dimensions} efficiency={efficiency} />

      {/* Efficiency Meter */}
      <EfficiencyMeter value={efficiency} position={[4, 0, 0]} />

      {/* Dimension Controls */}
      <group position={[-4, -1, 0]}>
        <DimensionSlider label="Width" value={dimensions.width / 3} position={[0, 0.8, 0]} />
        <DimensionSlider label="Height" value={dimensions.height / 3} position={[0, 0, 0]} />
        <DimensionSlider label="Depth" value={dimensions.depth / 3} position={[0, -0.8, 0]} />
      </group>

      {/* Volume Display */}
      <group position={[0, -1.5, 3]}>
        <mesh>
          <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.75, 0.75, efficiency * 1.5, 32]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.7} />
        </mesh>
        <Text position={[0, 1, 0]} fontSize={0.2} color="#94a3b8" anchorX="center">
          Volume
        </Text>
      </group>

      {/* Title */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.5}
        color="#f59e0b"
        anchorX="center"
        anchorY="middle"
      >
        Optimization Arena
      </Text>

      {/* Instruction */}
      <Text
        position={[0, 2.9, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        Discover optimal shapes by experimenting
      </Text>
    </>
  );
}

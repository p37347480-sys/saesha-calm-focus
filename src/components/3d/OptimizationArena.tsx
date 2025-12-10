import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

function OptimizableBox({ 
  dimensions, 
  efficiency 
}: { 
  dimensions: { width: number; height: number; depth: number };
  efficiency: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const targetDims = useRef(dimensions);
  const currentDims = useRef({ ...dimensions });

  useFrame((state) => {
    // Lerp current dimensions to target
    currentDims.current.width = THREE.MathUtils.lerp(currentDims.current.width, dimensions.width, 0.1);
    currentDims.current.height = THREE.MathUtils.lerp(currentDims.current.height, dimensions.height, 0.1);
    currentDims.current.depth = THREE.MathUtils.lerp(currentDims.current.depth, dimensions.depth, 0.1);

    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.scale.set(currentDims.current.width, currentDims.current.height, currentDims.current.depth);
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.03 + 1;
      glowRef.current.scale.set(
        currentDims.current.width * 1.1 * pulse, 
        currentDims.current.height * 1.1 * pulse, 
        currentDims.current.depth * 1.1 * pulse
      );
    }
  });

  // Color based on efficiency
  const getColor = () => {
    if (efficiency < 0.4) return '#ef4444';
    if (efficiency < 0.7) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <group>
      <mesh ref={glowRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={getColor()} transparent opacity={0.15} />
      </mesh>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={getColor()} 
          transparent 
          opacity={0.9}
          metalness={0.4}
          roughness={0.3}
          emissive={getColor()}
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

function ControlSlider({ 
  label, 
  value, 
  min, 
  max,
  position,
  onChange,
  color
}: { 
  label: string; 
  value: number;
  min: number;
  max: number;
  position: [number, number, number];
  onChange: (val: number) => void;
  color: string;
}) {
  const [hovered, setHovered] = useState<'minus' | 'plus' | null>(null);
  
  const normalized = (value - min) / (max - min);

  return (
    <group position={position}>
      <Text position={[0, 0.5, 0]} fontSize={0.18} color="#ffffff" anchorX="center">
        {label}: {value.toFixed(1)}
      </Text>
      
      {/* Track */}
      <mesh>
        <boxGeometry args={[2.5, 0.1, 0.1]} />
        <meshStandardMaterial color="#2a2a4a" />
      </mesh>

      {/* Fill */}
      <mesh position={[-(1.25 - normalized * 1.25), 0, 0.06]}>
        <boxGeometry args={[normalized * 2.5, 0.08, 0.02]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Knob */}
      <mesh position={[-1.25 + normalized * 2.5, 0, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>

      {/* Minus Button */}
      <mesh 
        position={[-1.8, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onChange(Math.max(min, value - 0.2)); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered('minus'); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(null); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[0.3, 0.3, 0.1]} />
        <meshStandardMaterial 
          color={hovered === 'minus' ? '#a855f7' : '#ef4444'} 
          emissive={hovered === 'minus' ? '#a855f7' : '#ef4444'}
          emissiveIntensity={0.3}
        />
      </mesh>
      <Text position={[-1.8, 0, 0.1]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle">-</Text>

      {/* Plus Button */}
      <mesh 
        position={[1.8, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onChange(Math.min(max, value + 0.2)); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered('plus'); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(null); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[0.3, 0.3, 0.1]} />
        <meshStandardMaterial 
          color={hovered === 'plus' ? '#a855f7' : '#22c55e'} 
          emissive={hovered === 'plus' ? '#a855f7' : '#22c55e'}
          emissiveIntensity={0.3}
        />
      </mesh>
      <Text position={[1.8, 0, 0.1]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle">+</Text>
    </group>
  );
}

function MetricDisplay({ 
  label, 
  value, 
  unit,
  color,
  position 
}: { 
  label: string; 
  value: number;
  unit: string;
  color: string;
  position: [number, number, number];
}) {
  const fillRef = useRef<THREE.Mesh>(null);
  const maxVal = 15;
  const normalized = Math.min(value / maxVal, 1);

  useFrame(() => {
    if (fillRef.current) {
      fillRef.current.scale.y = THREE.MathUtils.lerp(fillRef.current.scale.y, normalized, 0.1);
      fillRef.current.position.y = -1 + (normalized * 2) / 2;
    }
  });

  return (
    <group position={position}>
      {/* Container */}
      <mesh>
        <boxGeometry args={[0.4, 2.5, 0.1]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      
      {/* Fill */}
      <mesh ref={fillRef} position={[0, -1, 0.06]}>
        <boxGeometry args={[0.35, 2, 0.02]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>

      <Text position={[0, 1.6, 0]} fontSize={0.12} color="#94a3b8" anchorX="center">
        {label}
      </Text>
      <Text position={[0, -1.5, 0]} fontSize={0.15} color={color} anchorX="center">
        {value.toFixed(1)}{unit}
      </Text>
    </group>
  );
}

function EfficiencyGauge({ value, position }: { value: number; position: [number, number, number] }) {
  const getColor = () => {
    if (value < 0.4) return '#ef4444';
    if (value < 0.7) return '#f59e0b';
    return '#22c55e';
  };

  const getMessage = () => {
    if (value < 0.4) return 'Not Efficient';
    if (value < 0.7) return 'Getting Better!';
    if (value < 0.9) return 'Good!';
    return 'Optimal!';
  };

  return (
    <group position={position}>
      {/* Background circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshStandardMaterial color="#2a2a4a" />
      </mesh>
      
      {/* Progress arc - simplified as colored ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0.01]}>
        <ringGeometry args={[0.82, 0.98, 32, 1, 0, Math.PI * 2 * value]} />
        <meshStandardMaterial color={getColor()} emissive={getColor()} emissiveIntensity={0.5} />
      </mesh>

      <Text position={[0, 0.3, 0]} fontSize={0.3} color={getColor()} anchorX="center">
        {Math.round(value * 100)}%
      </Text>
      <Text position={[0, -0.1, 0]} fontSize={0.15} color="#ffffff" anchorX="center">
        {getMessage()}
      </Text>
    </group>
  );
}

export function OptimizationArena() {
  const [dimensions, setDimensions] = useState({ width: 1.5, height: 1.5, depth: 1.5 });
  
  const volume = dimensions.width * dimensions.height * dimensions.depth;
  const surfaceArea = 2 * (
    dimensions.width * dimensions.height + 
    dimensions.height * dimensions.depth + 
    dimensions.width * dimensions.depth
  );
  
  // For a given volume, a cube has minimum surface area
  // Efficiency = ratio of cube surface area to actual surface area
  const cubeEdge = Math.pow(volume, 1/3);
  const cubeSurfaceArea = 6 * cubeEdge * cubeEdge;
  const efficiency = Math.min(cubeSurfaceArea / surfaceArea, 1);

  return (
    <>
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

      {/* Main Shape */}
      <OptimizableBox dimensions={dimensions} efficiency={efficiency} />

      {/* Control Panel */}
      <group position={[0, 0, 5]}>
        <ControlSlider 
          label="Width" 
          value={dimensions.width} 
          min={0.5} 
          max={3}
          position={[0, 1, 0]}
          onChange={(v) => setDimensions(d => ({ ...d, width: v }))}
          color="#ef4444"
        />
        <ControlSlider 
          label="Height" 
          value={dimensions.height} 
          min={0.5} 
          max={3}
          position={[0, 0, 0]}
          onChange={(v) => setDimensions(d => ({ ...d, height: v }))}
          color="#22c55e"
        />
        <ControlSlider 
          label="Depth" 
          value={dimensions.depth} 
          min={0.5} 
          max={3}
          position={[0, -1, 0]}
          onChange={(v) => setDimensions(d => ({ ...d, depth: v }))}
          color="#3b82f6"
        />
      </group>

      {/* Metrics */}
      <group position={[5, 0, 0]}>
        <MetricDisplay label="Volume" value={volume} unit="³" color="#3b82f6" position={[-0.5, 0, 0]} />
        <MetricDisplay label="Surface" value={surfaceArea} unit="²" color="#f59e0b" position={[0.5, 0, 0]} />
      </group>

      {/* Efficiency Gauge */}
      <EfficiencyGauge value={efficiency} position={[-5, 0, 0]} />

      {/* Title */}
      <Text position={[0, 3.5, 0]} fontSize={0.5} color="#f59e0b" anchorX="center">
        Optimization Arena
      </Text>
      <Text position={[0, 2.9, 0]} fontSize={0.18} color="#94a3b8" anchorX="center">
        Adjust dimensions to find the most efficient shape!
      </Text>
      <Text position={[0, 2.5, 0]} fontSize={0.14} color="#4ade80" anchorX="center">
        Hint: A cube is most efficient for its volume!
      </Text>
    </>
  );
}

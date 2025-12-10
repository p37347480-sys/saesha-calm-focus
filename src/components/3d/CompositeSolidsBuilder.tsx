import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

function CompositeShape({ 
  position, 
  isExploded 
}: { 
  position: [number, number, number];
  isExploded: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [targetPositions] = useState({
    cube: [0, -0.5, 0] as [number, number, number],
    cylinder: [0, 0.5, 0] as [number, number, number],
    cone: [0, 1.5, 0] as [number, number, number],
  });
  const [explodedPositions] = useState({
    cube: [-1.5, -0.5, 0] as [number, number, number],
    cylinder: [0, 0.5, 1.5] as [number, number, number],
    cone: [1.5, 1.5, 0] as [number, number, number],
  });

  const cubeRef = useRef<THREE.Mesh>(null);
  const cylinderRef = useRef<THREE.Mesh>(null);
  const coneRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }

    const lerpFactor = 0.05;
    const targets = isExploded ? explodedPositions : targetPositions;

    if (cubeRef.current) {
      cubeRef.current.position.x = THREE.MathUtils.lerp(cubeRef.current.position.x, targets.cube[0], lerpFactor);
      cubeRef.current.position.y = THREE.MathUtils.lerp(cubeRef.current.position.y, targets.cube[1], lerpFactor);
      cubeRef.current.position.z = THREE.MathUtils.lerp(cubeRef.current.position.z, targets.cube[2], lerpFactor);
    }
    if (cylinderRef.current) {
      cylinderRef.current.position.x = THREE.MathUtils.lerp(cylinderRef.current.position.x, targets.cylinder[0], lerpFactor);
      cylinderRef.current.position.y = THREE.MathUtils.lerp(cylinderRef.current.position.y, targets.cylinder[1], lerpFactor);
      cylinderRef.current.position.z = THREE.MathUtils.lerp(cylinderRef.current.position.z, targets.cylinder[2], lerpFactor);
    }
    if (coneRef.current) {
      coneRef.current.position.x = THREE.MathUtils.lerp(coneRef.current.position.x, targets.cone[0], lerpFactor);
      coneRef.current.position.y = THREE.MathUtils.lerp(coneRef.current.position.y, targets.cone[1], lerpFactor);
      coneRef.current.position.z = THREE.MathUtils.lerp(coneRef.current.position.z, targets.cone[2], lerpFactor);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base Cube */}
      <mesh ref={cubeRef} position={targetPositions.cube}>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#ef4444" transparent opacity={0.85} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Middle Cylinder */}
      <mesh ref={cylinderRef} position={targetPositions.cylinder}>
        <cylinderGeometry args={[0.6, 0.6, 1, 32]} />
        <meshStandardMaterial color="#22c55e" transparent opacity={0.85} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Top Cone */}
      <mesh ref={coneRef} position={targetPositions.cone}>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.85} metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

function ShapeLibrary({ position }: { position: [number, number, number] }) {
  const shapes = [
    { type: 'cube', color: '#ef4444', pos: [-1.5, 0, 0] as [number, number, number] },
    { type: 'sphere', color: '#a855f7', pos: [0, 0, 0] as [number, number, number] },
    { type: 'cylinder', color: '#22c55e', pos: [1.5, 0, 0] as [number, number, number] },
  ];

  return (
    <group position={position}>
      <Text position={[0, 1, 0]} fontSize={0.25} color="#94a3b8" anchorX="center">
        Shape Library
      </Text>
      {shapes.map((shape, i) => (
        <mesh key={i} position={shape.pos} scale={0.5}>
          {shape.type === 'cube' && <boxGeometry args={[1, 1, 1]} />}
          {shape.type === 'sphere' && <sphereGeometry args={[0.5, 32, 32]} />}
          {shape.type === 'cylinder' && <cylinderGeometry args={[0.4, 0.4, 1, 32]} />}
          <meshStandardMaterial color={shape.color} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

export function CompositeSolidsBuilder() {
  const [isExploded, setIsExploded] = useState(false);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#22c55e" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      <gridHelper args={[20, 20, '#4a5568', '#2d3748']} position={[0, -1.99, 0]} />

      {/* Main Composite Shape */}
      <CompositeShape position={[0, 0, 0]} isExploded={isExploded} />

      {/* Shape Library */}
      <ShapeLibrary position={[-4, -1, 0]} />

      {/* Toggle Button Area */}
      <mesh 
        position={[4, 0, 0]} 
        onClick={() => setIsExploded(!isExploded)}
      >
        <boxGeometry args={[1.5, 0.5, 0.5]} />
        <meshStandardMaterial color={isExploded ? "#ef4444" : "#22c55e"} />
      </mesh>
      <Text position={[4, 0.6, 0]} fontSize={0.2} color="#ffffff" anchorX="center">
        {isExploded ? "Combine" : "Split Apart"}
      </Text>

      {/* Title */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.5}
        color="#22c55e"
        anchorX="center"
        anchorY="middle"
      >
        Composite Solids Builder
      </Text>

      {/* Instruction */}
      <Text
        position={[0, 2.9, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        Click the button to split and combine shapes
      </Text>
    </>
  );
}

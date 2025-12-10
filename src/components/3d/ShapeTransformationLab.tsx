import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

function TransformableShape({ 
  shape, 
  position, 
  scale, 
  color 
}: { 
  shape: 'cube' | 'cylinder' | 'sphere' | 'cone';
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      if (hovered) {
        meshRef.current.scale.setScalar(1.1);
      } else {
        meshRef.current.scale.set(...scale);
      }
    }
  });

  const getGeometry = () => {
    switch (shape) {
      case 'cube':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case 'sphere':
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'cone':
        return <coneGeometry args={[0.5, 1, 32]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {getGeometry()}
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={0.8}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

function VolumeIndicator({ position, fillLevel }: { position: [number, number, number]; fillLevel: number }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const targetScale = 0.3 + fillLevel * 0.7;
      ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, targetScale, 0.05);
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.3, 0.3, 2, 32]} />
      <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} />
    </mesh>
  );
}

function FloatingLabel({ text, position }: { text: string; position: [number, number, number] }) {
  return (
    <Text
      position={position}
      fontSize={0.25}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}

export function ShapeTransformationLab() {
  const [volumeLevels] = useState([0.6, 0.8, 0.4, 0.7]);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#3b82f6" />

      {/* Lab Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Grid Lines */}
      <gridHelper args={[20, 20, '#4a5568', '#2d3748']} position={[0, -1.99, 0]} />

      {/* Shapes */}
      <TransformableShape 
        shape="cube" 
        position={[-3, 0, 0]} 
        scale={[1.2, 1.5, 1.2]} 
        color="#ef4444" 
      />
      <FloatingLabel text="Cube" position={[-3, 1.5, 0]} />

      <TransformableShape 
        shape="cylinder" 
        position={[-1, 0, 0]} 
        scale={[1, 1.8, 1]} 
        color="#22c55e" 
      />
      <FloatingLabel text="Cylinder" position={[-1, 1.5, 0]} />

      <TransformableShape 
        shape="sphere" 
        position={[1, 0, 0]} 
        scale={[1.3, 1.3, 1.3]} 
        color="#3b82f6" 
      />
      <FloatingLabel text="Sphere" position={[1, 1.5, 0]} />

      <TransformableShape 
        shape="cone" 
        position={[3, 0, 0]} 
        scale={[1, 1.6, 1]} 
        color="#f59e0b" 
      />
      <FloatingLabel text="Cone" position={[3, 1.5, 0]} />

      {/* Volume Indicators */}
      <group position={[0, -1.5, 3]}>
        <VolumeIndicator position={[-3, 0, 0]} fillLevel={volumeLevels[0]} />
        <VolumeIndicator position={[-1, 0, 0]} fillLevel={volumeLevels[1]} />
        <VolumeIndicator position={[1, 0, 0]} fillLevel={volumeLevels[2]} />
        <VolumeIndicator position={[3, 0, 0]} fillLevel={volumeLevels[3]} />
      </group>

      {/* Title */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.5}
        color="#a855f7"
        anchorX="center"
        anchorY="middle"
      >
        Shape Transformation Lab
      </Text>

      {/* Instruction */}
      <Text
        position={[0, 2.4, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        Hover over shapes to see them transform
      </Text>
    </>
  );
}

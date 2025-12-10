import { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

function InteractiveShape({ 
  shape, 
  position, 
  baseColor,
  isSelected,
  onClick
}: { 
  shape: 'cube' | 'cylinder' | 'sphere' | 'cone';
  position: [number, number, number];
  baseColor: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);

  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
        meshRef.current.scale.set(scale[0] * pulse, scale[1] * pulse, scale[2] * pulse);
      } else {
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
        meshRef.current.scale.set(scale[0], scale[1], scale[2]);
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

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        {getGeometry()}
        <meshStandardMaterial 
          color={isSelected ? '#fbbf24' : hovered ? '#a855f7' : baseColor} 
          transparent 
          opacity={0.9}
          metalness={0.4}
          roughness={0.3}
          emissive={isSelected ? '#fbbf24' : hovered ? '#a855f7' : baseColor}
          emissiveIntensity={isSelected ? 0.3 : hovered ? 0.2 : 0.1}
        />
      </mesh>
      {isSelected && (
        <mesh scale={1.2}>
          {getGeometry()}
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.15} wireframe />
        </mesh>
      )}
    </group>
  );
}

function ControlButton({ 
  position, 
  label, 
  onClick, 
  color = '#3b82f6' 
}: { 
  position: [number, number, number]; 
  label: string; 
  onClick: () => void;
  color?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[1.2, 0.4, 0.2]} />
        <meshStandardMaterial 
          color={hovered ? '#a855f7' : color} 
          emissive={hovered ? '#a855f7' : color}
          emissiveIntensity={hovered ? 0.4 : 0.2}
        />
      </mesh>
      <Text position={[0, 0, 0.15]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}

function VolumeDisplay({ volume, surfaceArea, position }: { volume: number; surfaceArea: number; position: [number, number, number] }) {
  const fillRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (fillRef.current) {
      const targetHeight = Math.min(volume / 5, 2);
      fillRef.current.scale.y = THREE.MathUtils.lerp(fillRef.current.scale.y, targetHeight, 0.1);
    }
  });

  return (
    <group position={position}>
      {/* Container */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 2.5, 32, 1, true]} />
        <meshStandardMaterial color="#2a2a4a" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Liquid fill */}
      <mesh ref={fillRef} position={[0, -1, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 1, 32]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.7} />
      </mesh>

      <Text position={[0, 1.8, 0]} fontSize={0.18} color="#ffffff" anchorX="center">
        Volume: {volume.toFixed(1)}
      </Text>
      <Text position={[0, -1.6, 0]} fontSize={0.15} color="#94a3b8" anchorX="center">
        Surface: {surfaceArea.toFixed(1)}
      </Text>
    </group>
  );
}

export function ShapeTransformationLab() {
  const [selectedShape, setSelectedShape] = useState<number | null>(null);
  const [shapes, setShapes] = useState([
    { type: 'cube' as const, scale: [1, 1, 1] as [number, number, number], color: '#ef4444' },
    { type: 'cylinder' as const, scale: [1, 1, 1] as [number, number, number], color: '#22c55e' },
    { type: 'sphere' as const, scale: [1, 1, 1] as [number, number, number], color: '#3b82f6' },
    { type: 'cone' as const, scale: [1, 1, 1] as [number, number, number], color: '#f59e0b' },
  ]);

  const calculateVolume = (index: number) => {
    const shape = shapes[index];
    const [w, h, d] = shape.scale;
    switch (shape.type) {
      case 'cube': return w * h * d;
      case 'cylinder': return Math.PI * (w * 0.5) ** 2 * h;
      case 'sphere': return (4/3) * Math.PI * (w * 0.5) ** 3;
      case 'cone': return (1/3) * Math.PI * (w * 0.5) ** 2 * h;
      default: return 0;
    }
  };

  const calculateSurface = (index: number) => {
    const shape = shapes[index];
    const [w, h] = shape.scale;
    switch (shape.type) {
      case 'cube': return 6 * w * w;
      case 'cylinder': return 2 * Math.PI * (w * 0.5) * (h + w * 0.5);
      case 'sphere': return 4 * Math.PI * (w * 0.5) ** 2;
      case 'cone': return Math.PI * (w * 0.5) * (w * 0.5 + Math.sqrt(h ** 2 + (w * 0.5) ** 2));
      default: return 0;
    }
  };

  const modifyShape = (dimension: 'width' | 'height', delta: number) => {
    if (selectedShape === null) return;
    setShapes(prev => prev.map((shape, i) => {
      if (i !== selectedShape) return shape;
      const newScale = [...shape.scale] as [number, number, number];
      if (dimension === 'width') {
        newScale[0] = Math.max(0.3, Math.min(3, newScale[0] + delta));
        newScale[2] = newScale[0];
      } else {
        newScale[1] = Math.max(0.3, Math.min(3, newScale[1] + delta));
      }
      return { ...shape, scale: newScale };
    }));
  };

  const positions: [number, number, number][] = [[-3, 0, 0], [-1, 0, 0], [1, 0, 0], [3, 0, 0]];
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#3b82f6" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>
      <gridHelper args={[20, 20, '#4a5568', '#2d3748']} position={[0, -1.99, 0]} />

      {/* Shapes */}
      {shapes.map((shape, index) => (
        <group key={index}>
          <InteractiveShape
            shape={shape.type}
            position={positions[index]}
            baseColor={shape.color}
            isSelected={selectedShape === index}
            onClick={() => setSelectedShape(selectedShape === index ? null : index)}
          />
          <Text position={[positions[index][0], -1.5, positions[index][2]]} fontSize={0.2} color="#ffffff" anchorX="center">
            {shape.type.charAt(0).toUpperCase() + shape.type.slice(1)}
          </Text>
        </group>
      ))}

      {/* Controls Panel */}
      {selectedShape !== null && (
        <group position={[0, 0, 4]}>
          <Text position={[0, 1.5, 0]} fontSize={0.25} color="#fbbf24" anchorX="center">
            Modify {shapes[selectedShape].type}
          </Text>
          
          <group position={[-1.5, 0.5, 0]}>
            <Text position={[0, 0.5, 0]} fontSize={0.15} color="#94a3b8" anchorX="center">Width</Text>
            <ControlButton position={[-0.7, 0, 0]} label="-" onClick={() => modifyShape('width', -0.2)} color="#ef4444" />
            <ControlButton position={[0.7, 0, 0]} label="+" onClick={() => modifyShape('width', 0.2)} color="#22c55e" />
          </group>
          
          <group position={[1.5, 0.5, 0]}>
            <Text position={[0, 0.5, 0]} fontSize={0.15} color="#94a3b8" anchorX="center">Height</Text>
            <ControlButton position={[-0.7, 0, 0]} label="-" onClick={() => modifyShape('height', -0.2)} color="#ef4444" />
            <ControlButton position={[0.7, 0, 0]} label="+" onClick={() => modifyShape('height', 0.2)} color="#22c55e" />
          </group>
        </group>
      )}

      {/* Volume Display */}
      {selectedShape !== null && (
        <VolumeDisplay 
          volume={calculateVolume(selectedShape)} 
          surfaceArea={calculateSurface(selectedShape)}
          position={[5, 0, 0]} 
        />
      )}

      {/* Title */}
      <Text position={[0, 3.5, 0]} fontSize={0.5} color="#a855f7" anchorX="center">
        Shape Transformation Lab
      </Text>
      <Text position={[0, 2.9, 0]} fontSize={0.2} color="#94a3b8" anchorX="center">
        Click a shape to select it, then use buttons to change size!
      </Text>
    </>
  );
}

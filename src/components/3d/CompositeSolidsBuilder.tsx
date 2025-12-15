import { useRef, useState, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { QuizPanel } from './QuizPanel';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const compositeQuestions: Question[] = [
  { question: "Volume of composite solid = ?", options: ["Sum of volumes", "Difference of volumes", "Product of volumes", "Average of volumes"], correctAnswer: 0 },
  { question: "A cube on top of a cylinder creates?", options: ["Prism", "Composite solid", "Pyramid", "Cone"], correctAnswer: 1 },
  { question: "To find surface area of composite, you must?", options: ["Add all surfaces", "Subtract hidden surfaces", "Both A and B", "Multiply surfaces"], correctAnswer: 2 },
  { question: "Hemisphere + cylinder = ?", options: ["Capsule shape", "Cone", "Cube", "Pyramid"], correctAnswer: 0 },
  { question: "If cube has side 2, and cone has radius 1, height 2, total volume is?", options: ["8 + 2π/3", "8 + 4π/3", "4 + 2π/3", "8 + 2π"], correctAnswer: 0 },
  { question: "What is removed when shapes touch?", options: ["Volume", "Contact surfaces", "Nothing", "Weight"], correctAnswer: 1 },
  { question: "Cylinder (r=1,h=2) + hemisphere (r=1) volume?", options: ["2π + 2π/3", "4π", "π + π/3", "3π"], correctAnswer: 0 },
  { question: "Which combination creates a house shape?", options: ["Cube + cylinder", "Prism + pyramid", "Sphere + cone", "Cylinder + cone"], correctAnswer: 1 },
  { question: "Ice cream cone shape is?", options: ["Cone + hemisphere", "Cone + sphere", "Cylinder + cone", "Cone + cylinder"], correctAnswer: 0 },
  { question: "A silo is shaped like?", options: ["Cube + cone", "Cylinder + hemisphere", "Cylinder + cone", "Prism + pyramid"], correctAnswer: 2 },
  { question: "What's the volume of a cube with a cylindrical hole?", options: ["Cube - cylinder", "Cube + cylinder", "Cube × cylinder", "Cube ÷ cylinder"], correctAnswer: 0 },
  { question: "Two cubes stacked have combined surface area of?", options: ["12 faces", "10 faces", "8 faces", "6 faces"], correctAnswer: 1 },
  { question: "Cone (r=2,h=3) volume is?", options: ["4π", "12π", "2π", "6π"], correctAnswer: 0 },
  { question: "A rocket shape is made of?", options: ["Cylinder + cone", "Sphere + cone", "Cube + pyramid", "All cylinders"], correctAnswer: 0 },
  { question: "When subtracting shapes, volume is?", options: ["Always smaller", "Always larger", "Same", "Depends"], correctAnswer: 0 }
];

type ShapeType = 'cube' | 'cylinder' | 'cone' | 'sphere';

interface PlacedShape {
  type: ShapeType;
  position: [number, number, number];
  color: string;
  id: number;
}

function DraggableLibraryShape({ 
  type, 
  position, 
  color,
  onSelect
}: { 
  type: ShapeType;
  position: [number, number, number];
  color: string;
  onSelect: (type: ShapeType) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      if (hovered) {
        meshRef.current.scale.setScalar(1.2);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  const getGeometry = () => {
    switch (type) {
      case 'cube': return <boxGeometry args={[0.6, 0.6, 0.6]} />;
      case 'cylinder': return <cylinderGeometry args={[0.3, 0.3, 0.6, 32]} />;
      case 'cone': return <coneGeometry args={[0.3, 0.6, 32]} />;
      case 'sphere': return <sphereGeometry args={[0.3, 32, 32]} />;
    }
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(type); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        {getGeometry()}
        <meshStandardMaterial 
          color={hovered ? '#fbbf24' : color} 
          transparent 
          opacity={0.9}
          emissive={hovered ? '#fbbf24' : color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>
      <Text position={[0, -0.6, 0]} fontSize={0.12} color="#ffffff" anchorX="center">
        {type}
      </Text>
    </group>
  );
}

function PlacedShapeComponent({ 
  shape,
  isSelected,
  onSelect,
  onRemove
}: { 
  shape: PlacedShape;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const getGeometry = () => {
    switch (shape.type) {
      case 'cube': return <boxGeometry args={[0.8, 0.8, 0.8]} />;
      case 'cylinder': return <cylinderGeometry args={[0.4, 0.4, 0.8, 32]} />;
      case 'cone': return <coneGeometry args={[0.4, 0.8, 32]} />;
      case 'sphere': return <sphereGeometry args={[0.4, 32, 32]} />;
    }
  };

  return (
    <group position={shape.position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        {getGeometry()}
        <meshStandardMaterial 
          color={isSelected ? '#fbbf24' : hovered ? '#a855f7' : shape.color} 
          transparent 
          opacity={0.85}
          emissive={isSelected ? '#fbbf24' : hovered ? '#a855f7' : shape.color}
          emissiveIntensity={isSelected ? 0.4 : hovered ? 0.2 : 0.1}
        />
      </mesh>
      {isSelected && (
        <>
          <mesh scale={1.15}>
            {getGeometry()}
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.2} wireframe />
          </mesh>
          {/* Delete button */}
          <mesh 
            position={[0, 0.8, 0]}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
          >
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
          </mesh>
          <Text position={[0, 0.8, 0.2]} fontSize={0.1} color="#ffffff" anchorX="center">✕</Text>
        </>
      )}
    </group>
  );
}

function BuildArea({ 
  onClick, 
  selectedTool 
}: { 
  onClick: (position: [number, number, number]) => void;
  selectedTool: ShapeType | null;
}) {
  const [hoverPos, setHoverPos] = useState<[number, number, number] | null>(null);
  
  const gridPositions: [number, number, number][] = [];
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      gridPositions.push([x, 0, z]);
    }
  }

  return (
    <group position={[0, -1.5, 0]}>
      {gridPositions.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={(e) => { 
            e.stopPropagation(); 
            if (selectedTool) onClick([pos[0], pos[1] + 0.5, pos[2]]); 
          }}
          onPointerOver={(e) => { 
            e.stopPropagation(); 
            setHoverPos(pos);
            if (selectedTool) document.body.style.cursor = 'copy';
          }}
          onPointerOut={() => { 
            setHoverPos(null);
            document.body.style.cursor = 'auto';
          }}
        >
          <planeGeometry args={[0.9, 0.9]} />
          <meshStandardMaterial 
            color={hoverPos === pos && selectedTool ? '#4ade80' : '#2a2a4a'} 
            transparent 
            opacity={hoverPos === pos && selectedTool ? 0.8 : 0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function VolumeCounter({ totalVolume, position }: { totalVolume: number; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <Text position={[0, 0.15, 0.1]} fontSize={0.15} color="#94a3b8" anchorX="center">
        Total Volume
      </Text>
      <Text position={[0, -0.15, 0.1]} fontSize={0.25} color="#4ade80" anchorX="center">
        {totalVolume.toFixed(1)} units³
      </Text>
    </group>
  );
}

export function CompositeSolidsBuilder() {
  const [selectedTool, setSelectedTool] = useState<ShapeType | null>(null);
  const [placedShapes, setPlacedShapes] = useState<PlacedShape[]>([]);
  const [selectedPlaced, setSelectedPlaced] = useState<number | null>(null);
  const nextId = useRef(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);

  // Auto-trigger question every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentQuestion && usedQuestions.length < compositeQuestions.length) {
        const available = compositeQuestions.filter((_, i) => !usedQuestions.includes(i));
        if (available.length > 0) {
          const randomIdx = Math.floor(Math.random() * available.length);
          const originalIdx = compositeQuestions.indexOf(available[randomIdx]);
          setCurrentQuestion(available[randomIdx]);
          setUsedQuestions(prev => [...prev, originalIdx]);
        }
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [currentQuestion, usedQuestions]);

  // Also trigger on interaction
  useEffect(() => {
    if (interactionCount > 0 && interactionCount % 2 === 0 && !currentQuestion) {
      const available = compositeQuestions.filter((_, i) => !usedQuestions.includes(i));
      if (available.length > 0) {
        const randomIdx = Math.floor(Math.random() * available.length);
        const originalIdx = compositeQuestions.indexOf(available[randomIdx]);
        setCurrentQuestion(available[randomIdx]);
        setUsedQuestions(prev => [...prev, originalIdx]);
      }
    }
  }, [interactionCount]);

  const handleAnswer = (selectedIndex: number, isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setQuestionsAnswered(prev => prev + 1);
    setCurrentQuestion(null);
  };

  const shapeColors: Record<ShapeType, string> = {
    cube: '#ef4444',
    cylinder: '#22c55e',
    cone: '#3b82f6',
    sphere: '#a855f7'
  };

  const addShape = (position: [number, number, number]) => {
    if (!selectedTool) return;
    setInteractionCount(prev => prev + 1);
    setPlacedShapes(prev => [...prev, {
      type: selectedTool,
      position,
      color: shapeColors[selectedTool],
      id: nextId.current++
    }]);
  };

  const removeShape = (id: number) => {
    setPlacedShapes(prev => prev.filter(s => s.id !== id));
    setSelectedPlaced(null);
    setInteractionCount(prev => prev + 1);
  };

  const clearAll = () => {
    setPlacedShapes([]);
    setSelectedPlaced(null);
    setInteractionCount(prev => prev + 1);
  };

  const calculateVolume = (type: ShapeType) => {
    switch (type) {
      case 'cube': return 0.8 ** 3;
      case 'cylinder': return Math.PI * 0.4 ** 2 * 0.8;
      case 'cone': return (1/3) * Math.PI * 0.4 ** 2 * 0.8;
      case 'sphere': return (4/3) * Math.PI * 0.4 ** 3;
    }
  };

  const totalVolume = placedShapes.reduce((sum, s) => sum + calculateVolume(s.type), 0);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#22c55e" />

      <Html fullscreen>
        <QuizPanel 
          currentQuestion={currentQuestion}
          onAnswer={handleAnswer}
          score={score}
          totalQuestions={questionsAnswered}
          emoji="🧊"
          title="Composite Solids Quiz"
        />
      </Html>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Build Area Grid */}
      <BuildArea onClick={addShape} selectedTool={selectedTool} />

      {/* Placed Shapes */}
      {placedShapes.map(shape => (
        <PlacedShapeComponent
          key={shape.id}
          shape={shape}
          isSelected={selectedPlaced === shape.id}
          onSelect={() => setSelectedPlaced(selectedPlaced === shape.id ? null : shape.id)}
          onRemove={() => removeShape(shape.id)}
        />
      ))}

      {/* Shape Library */}
      <group position={[-5, 0, 0]}>
        <Text position={[0, 1.5, 0]} fontSize={0.25} color="#ffffff" anchorX="center">
          Pick a Shape
        </Text>
        <DraggableLibraryShape type="cube" position={[0, 0.5, 0]} color="#ef4444" onSelect={setSelectedTool} />
        <DraggableLibraryShape type="cylinder" position={[0, -0.5, 0]} color="#22c55e" onSelect={setSelectedTool} />
        <DraggableLibraryShape type="cone" position={[0, -1.5, 0.5]} color="#3b82f6" onSelect={setSelectedTool} />
        <DraggableLibraryShape type="sphere" position={[0, -2.5, 0]} color="#a855f7" onSelect={setSelectedTool} />
        
        {selectedTool && (
          <Text position={[0, 2, 0]} fontSize={0.15} color="#4ade80" anchorX="center">
            Selected: {selectedTool}
          </Text>
        )}
      </group>

      {/* Volume Counter */}
      <VolumeCounter totalVolume={totalVolume} position={[5, 1, 0]} />

      {/* Clear Button */}
      <group position={[5, -0.5, 0]}>
        <mesh
          onClick={(e) => { e.stopPropagation(); clearAll(); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <boxGeometry args={[1.5, 0.5, 0.2]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.2} />
        </mesh>
        <Text position={[0, 0, 0.15]} fontSize={0.15} color="#ffffff" anchorX="center">
          Clear All
        </Text>
      </group>

      {/* Title */}
      <Text position={[0, 3.5, 0]} fontSize={0.5} color="#22c55e" anchorX="center">
        Composite Solids Builder
      </Text>
      <Text position={[0, 2.9, 0]} fontSize={0.18} color="#94a3b8" anchorX="center">
        1. Pick a shape from the left • 2. Click on the grid to place it!
      </Text>
    </>
  );
}

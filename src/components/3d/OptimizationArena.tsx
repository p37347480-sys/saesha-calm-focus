import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { QuizPanel } from './QuizPanel';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const optimizationQuestions: Question[] = [
  { question: "For fixed volume, which shape has minimum surface area?", options: ["Cube", "Sphere", "Cylinder", "Cone"], correctAnswer: 1 },
  { question: "To maximize volume with fixed surface area, use?", options: ["Long thin shape", "Compact shape", "Flat shape", "Any shape"], correctAnswer: 1 },
  { question: "A cube is optimal when?", options: ["Never", "All sides equal", "Height > width", "Height < width"], correctAnswer: 1 },
  { question: "For packaging, efficiency means?", options: ["Maximum volume, minimum surface", "Minimum volume, maximum surface", "Equal volume and surface", "Neither"], correctAnswer: 0 },
  { question: "If you double all dimensions, surface area increases by?", options: ["2x", "4x", "8x", "16x"], correctAnswer: 1 },
  { question: "If you double all dimensions, volume increases by?", options: ["2x", "4x", "8x", "16x"], correctAnswer: 2 },
  { question: "Ratio of surface area to volume is called?", options: ["Surface ratio", "Volume ratio", "SA:V ratio", "Dimension ratio"], correctAnswer: 2 },
  { question: "As objects get larger, SA:V ratio?", options: ["Increases", "Decreases", "Stays same", "Varies randomly"], correctAnswer: 1 },
  { question: "Optimal cylinder (min SA for fixed V) has h:d ratio of?", options: ["1:1", "2:1", "1:2", "3:1"], correctAnswer: 0 },
  { question: "Why do cells stay small?", options: ["SA:V ratio", "Weight", "Color", "Shape"], correctAnswer: 0 },
  { question: "A sphere's efficiency comes from having?", options: ["No edges", "No corners", "Minimum SA for V", "All of these"], correctAnswer: 3 },
  { question: "For a box with volume 27, minimum SA needs sides of?", options: ["1,1,27", "3,3,3", "9,3,1", "27,1,1"], correctAnswer: 1 },
  { question: "Optimization problems often involve?", options: ["Maximizing or minimizing", "Adding only", "Subtracting only", "Multiplying only"], correctAnswer: 0 },
  { question: "Efficiency increases when shape is more?", options: ["Irregular", "Symmetrical", "Flat", "Long"], correctAnswer: 1 },
  { question: "Real-world example of SA:V optimization?", options: ["Building design", "Package design", "Animal cells", "All of these"], correctAnswer: 3 }
];

function OptimizableBox({ 
  dimensions, 
  efficiency 
}: { 
  dimensions: { width: number; height: number; depth: number };
  efficiency: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const edgeRef = useRef<THREE.Mesh>(null);
  const targetDims = useRef(dimensions);
  const currentDims = useRef({ ...dimensions });

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    // Smooth lerp current dimensions to target
    currentDims.current.width = THREE.MathUtils.lerp(currentDims.current.width, dimensions.width, 0.08);
    currentDims.current.height = THREE.MathUtils.lerp(currentDims.current.height, dimensions.height, 0.08);
    currentDims.current.depth = THREE.MathUtils.lerp(currentDims.current.depth, dimensions.depth, 0.08);

    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.4;
      meshRef.current.scale.set(currentDims.current.width, currentDims.current.height, currentDims.current.depth);
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = time * 0.4;
      const pulse = Math.sin(time * 3) * 0.05 + 1.15;
      glowRef.current.scale.set(
        currentDims.current.width * pulse, 
        currentDims.current.height * pulse, 
        currentDims.current.depth * pulse
      );
    }
    if (edgeRef.current) {
      edgeRef.current.rotation.y = time * 0.4;
      edgeRef.current.scale.set(currentDims.current.width, currentDims.current.height, currentDims.current.depth);
    }
  });

  // Color based on efficiency with gradient feel
  const getColor = () => {
    if (efficiency < 0.4) return '#ef4444';
    if (efficiency < 0.7) return '#f59e0b';
    if (efficiency < 0.9) return '#84cc16';
    return '#22c55e';
  };

  return (
    <group>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={getColor()} transparent opacity={0.12} />
      </mesh>
      {/* Main box with enhanced materials */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={getColor()} 
          transparent 
          opacity={0.92}
          metalness={0.6}
          roughness={0.2}
          emissive={getColor()}
          emissiveIntensity={efficiency > 0.8 ? 0.4 : 0.2}
        />
      </mesh>
      {/* Wireframe edge highlight */}
      <mesh ref={edgeRef}>
        <boxGeometry args={[1.02, 1.02, 1.02]} />
        <meshBasicMaterial color={getColor()} wireframe transparent opacity={0.3} />
      </mesh>
      {/* Efficiency particles */}
      {efficiency > 0.8 && (
        <>
          {[...Array(8)].map((_, i) => (
            <Float key={i} speed={3 + i * 0.3} floatIntensity={0.5}>
              <mesh position={[
                Math.cos(i * Math.PI / 4) * 1.5,
                Math.sin(i * Math.PI / 4) * 1.5,
                0
              ]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1} />
              </mesh>
            </Float>
          ))}
        </>
      )}
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
  const minusBtnRef = useRef<THREE.Mesh>(null);
  const plusBtnRef = useRef<THREE.Mesh>(null);
  const knobRef = useRef<THREE.Mesh>(null);
  
  const normalized = (value - min) / (max - min);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (minusBtnRef.current && hovered === 'minus') {
      const pulse = Math.sin(time * 8) * 0.1 + 1;
      minusBtnRef.current.scale.setScalar(pulse);
    }
    if (plusBtnRef.current && hovered === 'plus') {
      const pulse = Math.sin(time * 8) * 0.1 + 1;
      plusBtnRef.current.scale.setScalar(pulse);
    }
    if (knobRef.current) {
      const glow = Math.sin(time * 4) * 0.02 + 1;
      knobRef.current.scale.setScalar(glow);
    }
  });

  return (
    <group position={position}>
      <Text position={[0, 0.5, 0]} fontSize={0.2} color="#ffffff" anchorX="center" fontWeight="bold">
        {label}: {value.toFixed(1)}
      </Text>
      
      {/* Track background */}
      <mesh>
        <boxGeometry args={[2.5, 0.12, 0.12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Active fill with glow */}
      <mesh position={[-(1.25 - normalized * 1.25), 0, 0.08]}>
        <boxGeometry args={[normalized * 2.5, 0.1, 0.03]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>

      {/* Animated Knob */}
      <group position={[-1.25 + normalized * 2.5, 0, 0.1]}>
        <mesh ref={knobRef}>
          <sphereGeometry args={[0.15, 20, 20]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} metalness={0.8} roughness={0.1} />
        </mesh>
        <mesh scale={1.3}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
      </group>

      {/* Enhanced Minus Button */}
      <group position={[-1.9, 0, 0]}>
        {hovered === 'minus' && (
          <mesh scale={1.5}>
            <octahedronGeometry args={[0.22]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.2} />
          </mesh>
        )}
        <mesh 
          ref={minusBtnRef}
          onClick={(e) => { e.stopPropagation(); onChange(Math.max(min, value - 0.2)); }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered('minus'); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(null); document.body.style.cursor = 'auto'; }}
        >
          <octahedronGeometry args={[0.2]} />
          <meshStandardMaterial 
            color={hovered === 'minus' ? '#f87171' : '#ef4444'} 
            emissive="#ef4444"
            emissiveIntensity={hovered === 'minus' ? 0.8 : 0.3}
            metalness={0.7}
          />
        </mesh>
      </group>

      {/* Enhanced Plus Button */}
      <group position={[1.9, 0, 0]}>
        {hovered === 'plus' && (
          <mesh scale={1.5}>
            <octahedronGeometry args={[0.22]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.2} />
          </mesh>
        )}
        <mesh 
          ref={plusBtnRef}
          onClick={(e) => { e.stopPropagation(); onChange(Math.min(max, value + 0.2)); }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered('plus'); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(null); document.body.style.cursor = 'auto'; }}
        >
          <octahedronGeometry args={[0.2]} />
          <meshStandardMaterial 
            color={hovered === 'plus' ? '#4ade80' : '#22c55e'} 
            emissive="#22c55e"
            emissiveIntensity={hovered === 'plus' ? 0.8 : 0.3}
            metalness={0.7}
          />
        </mesh>
      </group>
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
  const [interactionCount, setInteractionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);

  // Auto-trigger question every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentQuestion && usedQuestions.length < optimizationQuestions.length) {
        const available = optimizationQuestions.filter((_, i) => !usedQuestions.includes(i));
        if (available.length > 0) {
          const randomIdx = Math.floor(Math.random() * available.length);
          const originalIdx = optimizationQuestions.indexOf(available[randomIdx]);
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
      const available = optimizationQuestions.filter((_, i) => !usedQuestions.includes(i));
      if (available.length > 0) {
        const randomIdx = Math.floor(Math.random() * available.length);
        const originalIdx = optimizationQuestions.indexOf(available[randomIdx]);
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

  const handleDimensionChange = (dim: 'width' | 'height' | 'depth', value: number) => {
    setDimensions(d => ({ ...d, [dim]: value }));
    setInteractionCount(prev => prev + 1);
  };

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#a855f7" />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#3b82f6" />

      <Html fullscreen>
        <QuizPanel 
          currentQuestion={currentQuestion}
          onAnswer={handleAnswer}
          score={score}
          totalQuestions={questionsAnswered}
          emoji="🎯"
          title="Optimization Quiz"
        />
      </Html>

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
          onChange={(v) => handleDimensionChange('width', v)}
          color="#ef4444"
        />
        <ControlSlider 
          label="Height" 
          value={dimensions.height} 
          min={0.5} 
          max={3}
          position={[0, 0, 0]}
          onChange={(v) => handleDimensionChange('height', v)}
          color="#22c55e"
        />
        <ControlSlider 
          label="Depth" 
          value={dimensions.depth} 
          min={0.5} 
          max={3}
          position={[0, -1, 0]}
          onChange={(v) => handleDimensionChange('depth', v)}
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

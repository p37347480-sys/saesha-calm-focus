import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { QuizPanel } from './QuizPanel';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const algebraQuestions: Question[] = [
  { question: "(a + b)² expands to?", options: ["a² + b²", "a² + 2ab + b²", "a² - 2ab + b²", "2a² + 2b²"], correctAnswer: 1 },
  { question: "What is the area of a square with side 'x'?", options: ["4x", "2x", "x²", "x + x"], correctAnswer: 2 },
  { question: "(x + 3)(x + 2) = ?", options: ["x² + 5x + 6", "x² + 6x + 5", "x² + 5x + 5", "2x + 5"], correctAnswer: 0 },
  { question: "If a = 3 and b = 2, what is ab?", options: ["5", "6", "32", "1"], correctAnswer: 1 },
  { question: "The area of a rectangle with length a and width b is?", options: ["a + b", "2(a + b)", "a × b", "a² + b²"], correctAnswer: 2 },
  { question: "(a - b)² equals?", options: ["a² - b²", "a² + 2ab + b²", "a² - 2ab + b²", "a² - ab + b²"], correctAnswer: 2 },
  { question: "What does 2ab represent geometrically?", options: ["Two squares", "Two rectangles of size a×b", "A single line", "A circle"], correctAnswer: 1 },
  { question: "x² + 6x + 9 factors to?", options: ["(x + 3)²", "(x - 3)²", "(x + 9)(x - 3)", "(x + 1)(x + 9)"], correctAnswer: 0 },
  { question: "(a + b)(a - b) = ?", options: ["a² + b²", "a² - b²", "2ab", "a² - 2ab + b²"], correctAnswer: 1 },
  { question: "If x = 5, what is 2x + 3?", options: ["10", "13", "8", "25"], correctAnswer: 1 },
  { question: "Simplify: 3x + 5x", options: ["8x", "15x", "8x²", "35x"], correctAnswer: 0 },
  { question: "What is (x + 4)² expanded?", options: ["x² + 8x + 16", "x² + 4x + 16", "x² + 8x + 8", "x² + 16"], correctAnswer: 0 },
  { question: "If 2x = 10, what is x?", options: ["2", "5", "10", "20"], correctAnswer: 1 },
  { question: "Factor: x² - 9", options: ["(x - 3)²", "(x + 3)²", "(x + 3)(x - 3)", "(x - 9)(x + 1)"], correctAnswer: 2 },
  { question: "What is the coefficient of x in 5x² + 3x - 7?", options: ["5", "3", "-7", "1"], correctAnswer: 1 }
];

// Using shared QuizPanel component from ./QuizPanel

// Interactive algebra block with enhanced animations
function AlgebraBlock({ 
  type, 
  position, 
  size,
  color,
  onClick,
  isSelected
}: {
  type: 'a' | 'b' | 'a2' | 'b2' | 'ab';
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  onClick: () => void;
  isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      if (isSelected) {
        meshRef.current.rotation.y = time * 2;
        meshRef.current.position.y = position[1] + Math.sin(time * 3) * 0.15;
        meshRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.1);
      } else if (hovered) {
        meshRef.current.scale.setScalar(1.15);
        meshRef.current.rotation.y = time * 0.5;
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
    if (glowRef.current && (isSelected || hovered)) {
      const pulse = Math.sin(state.clock.elapsedTime * 5) * 0.15 + 1.3;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <Float speed={isSelected ? 3 : 1.5} floatIntensity={isSelected ? 0.5 : 0.2}>
      <group position={position}>
        {/* Glow effect */}
        {(isSelected || hovered) && (
          <mesh ref={glowRef}>
            <boxGeometry args={[size[0] * 1.2, size[1] * 1.2, size[2] * 1.2]} />
            <meshBasicMaterial color={color} transparent opacity={0.2} />
          </mesh>
        )}
        <mesh 
          ref={meshRef} 
          onClick={onClick}
          onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        >
          <boxGeometry args={size} />
          <meshStandardMaterial
            color={hovered ? '#fbbf24' : color}
            metalness={0.8}
            roughness={0.15}
            emissive={isSelected ? '#fbbf24' : hovered ? '#fbbf24' : color}
            emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.3}
          />
        </mesh>
        {isSelected && (
          <mesh scale={1.1}>
            <boxGeometry args={size} />
            <meshBasicMaterial color="#fbbf24" wireframe transparent opacity={0.6} />
          </mesh>
        )}
      </group>
    </Float>
  );
}

// Enhanced Expression builder showing (a+b)² expansion
function ExpressionBuilder({ a, b }: { a: number; b: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [animProgress, setAnimProgress] = useState(0);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle breathing animation
      const breath = Math.sin(state.clock.elapsedTime * 0.8) * 0.02;
      groupRef.current.scale.setScalar(1 + breath);
    }
    // Smooth animation progress
    setAnimProgress(prev => Math.min(prev + 0.02, 1));
  });
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* a² square with animated glow */}
      <Float speed={0.8} floatIntensity={0.05}>
        <mesh position={[-a/2, 0, -a/2]}>
          <boxGeometry args={[a * animProgress, 0.2, a * animProgress]} />
          <meshStandardMaterial 
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Edge glow */}
        <mesh position={[-a/2, 0.15, -a/2]}>
          <boxGeometry args={[a * animProgress + 0.05, 0.02, a * animProgress + 0.05]} />
          <meshBasicMaterial color="#c4b5fd" transparent opacity={0.6} />
        </mesh>
      </Float>
      
      {/* b² square with animated glow */}
      <Float speed={1} floatIntensity={0.05}>
        <mesh position={[a/2 + b/2, 0, a/2 + b/2]}>
          <boxGeometry args={[b * animProgress, 0.2, b * animProgress]} />
          <meshStandardMaterial 
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[a/2 + b/2, 0.15, a/2 + b/2]}>
          <boxGeometry args={[b * animProgress + 0.05, 0.02, b * animProgress + 0.05]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.6} />
        </mesh>
      </Float>
      
      {/* First ab rectangle with pulse */}
      <Float speed={1.2} floatIntensity={0.08}>
        <mesh position={[a/2 + b/2, 0, -a/2]}>
          <boxGeometry args={[b * animProgress, 0.15, a * animProgress]} />
          <meshStandardMaterial 
            color="#c4b5fd"
            emissive="#a78bfa"
            emissiveIntensity={0.4}
            transparent
            opacity={0.9}
          />
        </mesh>
      </Float>
      
      {/* Second ab rectangle with pulse */}
      <Float speed={1.2} floatIntensity={0.08}>
        <mesh position={[-a/2, 0, a/2 + b/2]}>
          <boxGeometry args={[a * animProgress, 0.15, b * animProgress]} />
          <meshStandardMaterial 
            color="#c4b5fd"
            emissive="#a78bfa"
            emissiveIntensity={0.4}
            transparent
            opacity={0.9}
          />
        </mesh>
      </Float>

      {/* Connection lines with energy effect */}
      {animProgress > 0.5 && (
        <>
          <mesh position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
            <torusGeometry args={[(a + b) * 0.4, 0.02, 8, 32]} />
            <meshStandardMaterial color="#e879f9" emissive="#e879f9" emissiveIntensity={0.8} transparent opacity={0.4} />
          </mesh>
        </>
      )}
    </group>
  );
}

// Enhanced interactive variable slider blocks
function VariableBlock({ 
  variable, 
  value, 
  position, 
  color,
  onIncrease,
  onDecrease
}: {
  variable: string;
  value: number;
  position: [number, number, number];
  color: string;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  const [hoveredBtn, setHoveredBtn] = useState<'plus' | 'minus' | null>(null);
  const blockRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (blockRef.current) {
      blockRef.current.scale.x = THREE.MathUtils.lerp(blockRef.current.scale.x, value * 0.5, 0.1);
    }
  });

  return (
    <group position={position}>
      {/* Variable block with smooth scaling */}
      <mesh ref={blockRef}>
        <boxGeometry args={[1, 0.6, 0.6]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      
      {/* Glow ring around block */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.03, 8, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.5} />
      </mesh>
      
      {/* Enhanced Increase button */}
      <Float speed={3} floatIntensity={hoveredBtn === 'plus' ? 0.4 : 0.15}>
        <group position={[value * 0.3 + 0.6, 0, 0]}>
          <mesh 
            onClick={(e) => { e.stopPropagation(); onIncrease(); }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredBtn('plus'); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHoveredBtn(null); document.body.style.cursor = 'auto'; }}
          >
            <octahedronGeometry args={[0.25]} />
            <meshStandardMaterial 
              color={hoveredBtn === 'plus' ? '#4ade80' : '#22c55e'} 
              emissive="#22c55e" 
              emissiveIntensity={hoveredBtn === 'plus' ? 1 : 0.5}
              metalness={0.8}
            />
          </mesh>
          {hoveredBtn === 'plus' && (
            <mesh scale={1.5}>
              <octahedronGeometry args={[0.25]} />
              <meshBasicMaterial color="#22c55e" transparent opacity={0.2} />
            </mesh>
          )}
        </group>
      </Float>
      
      {/* Enhanced Decrease button */}
      <Float speed={3} floatIntensity={hoveredBtn === 'minus' ? 0.4 : 0.15}>
        <group position={[-value * 0.3 - 0.6, 0, 0]}>
          <mesh 
            onClick={(e) => { e.stopPropagation(); onDecrease(); }}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredBtn('minus'); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHoveredBtn(null); document.body.style.cursor = 'auto'; }}
          >
            <octahedronGeometry args={[0.25]} />
            <meshStandardMaterial 
              color={hoveredBtn === 'minus' ? '#f87171' : '#ef4444'} 
              emissive="#ef4444" 
              emissiveIntensity={hoveredBtn === 'minus' ? 1 : 0.5}
              metalness={0.8}
            />
          </mesh>
          {hoveredBtn === 'minus' && (
            <mesh scale={1.5}>
              <octahedronGeometry args={[0.25]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.2} />
            </mesh>
          )}
        </group>
      </Float>
    </group>
  );
}

export function AlgebraBlockBuilder() {
  const groupRef = useRef<THREE.Group>(null);
  const [aValue, setAValue] = useState(1.5);
  const [bValue, setBValue] = useState(0.8);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.1;
    }
  });

  const handleInteraction = () => {
    setInteractionCount(prev => prev + 1);
  };

  // Auto-trigger question every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentQuestion && usedQuestions.length < algebraQuestions.length) {
        const available = algebraQuestions.filter((_, i) => !usedQuestions.includes(i));
        if (available.length > 0) {
          const randomIdx = Math.floor(Math.random() * available.length);
          const originalIdx = algebraQuestions.indexOf(available[randomIdx]);
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
      const available = algebraQuestions.filter((_, i) => !usedQuestions.includes(i));
      if (available.length > 0) {
        const randomIdx = Math.floor(Math.random() * available.length);
        const originalIdx = algebraQuestions.indexOf(available[randomIdx]);
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

  const increaseA = () => { setAValue(prev => Math.min(2.5, prev + 0.2)); handleInteraction(); };
  const decreaseA = () => { setAValue(prev => Math.max(0.5, prev - 0.2)); handleInteraction(); };
  const increaseB = () => { setBValue(prev => Math.min(1.5, prev + 0.2)); handleInteraction(); };
  const decreaseB = () => { setBValue(prev => Math.max(0.3, prev - 0.2)); handleInteraction(); };

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.7} />
      <pointLight position={[-3, 3, 2]} intensity={0.6} color="#8b5cf6" />
      <pointLight position={[3, -2, 2]} intensity={0.4} color="#06b6d4" />
      <fog attach="fog" args={['#1e1b4b', 8, 20]} />

      <Html fullscreen>
        <QuizPanel 
          currentQuestion={currentQuestion}
          onAnswer={handleAnswer}
          score={score}
          totalQuestions={questionsAnswered}
          emoji="🧱"
          title="Algebra Quiz"
        />
      </Html>

      {/* Grid floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[12, 12, 24, 24]} />
        <meshStandardMaterial color="#1e1b4b" wireframe transparent opacity={0.3} />
      </mesh>

      <group ref={groupRef}>
        {/* Main expression builder */}
        <group position={[0, -1, 0]}>
          <ExpressionBuilder a={aValue} b={bValue} />
        </group>

        {/* Variable control blocks */}
        <VariableBlock 
          variable="a"
          value={aValue}
          position={[-3, 1.5, 0]}
          color="#8b5cf6"
          onIncrease={increaseA}
          onDecrease={decreaseA}
        />
        
        <VariableBlock 
          variable="b"
          value={bValue}
          position={[3, 1.5, 0]}
          color="#06b6d4"
          onIncrease={increaseB}
          onDecrease={decreaseB}
        />

        {/* Floating individual blocks for reference */}
        <AlgebraBlock 
          type="a"
          position={[-2.5, 0.5, 2]}
          size={[aValue * 0.4, 0.3, 0.3]}
          color="#8b5cf6"
          onClick={() => { setSelectedBlock('a'); handleInteraction(); }}
          isSelected={selectedBlock === 'a'}
        />
        
        <AlgebraBlock 
          type="b"
          position={[2.5, 0.5, 2]}
          size={[bValue * 0.4, 0.3, 0.3]}
          color="#06b6d4"
          onClick={() => { setSelectedBlock('b'); handleInteraction(); }}
          isSelected={selectedBlock === 'b'}
        />

        {/* a² visual */}
        <Float speed={1.2} floatIntensity={0.15}>
          <mesh position={[-1.5, 2, -1.5]} onClick={() => { setSelectedBlock('a2'); handleInteraction(); }}>
            <boxGeometry args={[aValue * 0.5, 0.15, aValue * 0.5]} />
            <meshStandardMaterial
              color="#a78bfa"
              metalness={0.8}
              roughness={0.15}
              emissive="#a78bfa"
              emissiveIntensity={selectedBlock === 'a2' ? 0.6 : 0.4}
            />
          </mesh>
        </Float>

        {/* b² visual */}
        <Float speed={1.4} floatIntensity={0.2}>
          <mesh position={[1.5, 2, -1.5]} onClick={() => { setSelectedBlock('b2'); handleInteraction(); }}>
            <boxGeometry args={[bValue * 0.5, 0.15, bValue * 0.5]} />
            <meshStandardMaterial
              color="#22d3ee"
              metalness={0.8}
              roughness={0.15}
              emissive="#22d3ee"
              emissiveIntensity={selectedBlock === 'b2' ? 0.6 : 0.4}
            />
          </mesh>
        </Float>

        {/* ab rectangle visual */}
        <Float speed={1} floatIntensity={0.1}>
          <mesh position={[0, 2.5, -1]} onClick={() => { setSelectedBlock('ab'); handleInteraction(); }}>
            <boxGeometry args={[aValue * 0.4, 0.1, bValue * 0.4]} />
            <meshStandardMaterial
              color="#c4b5fd"
              metalness={0.6}
              roughness={0.3}
              emissive="#c4b5fd"
              emissiveIntensity={selectedBlock === 'ab' ? 0.5 : 0.25}
              transparent
              opacity={0.9}
            />
          </mesh>
        </Float>
      </group>

      {/* Connecting energy beams */}
      {[-1.2, 1.2].map((x, i) => (
        <mesh key={i} position={[x * 0.8, 0.2, -0.5]}>
          <cylinderGeometry args={[0.02, 0.02, 1.8, 8]} />
          <meshStandardMaterial
            color="#e879f9"
            emissive="#e879f9"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <Float key={i} speed={1 + Math.random()} floatIntensity={0.5}>
          <mesh position={[
            (Math.random() - 0.5) * 8,
            Math.random() * 4,
            (Math.random() - 0.5) * 8
          ]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? '#8b5cf6' : '#06b6d4'}
              emissive={i % 2 === 0 ? '#8b5cf6' : '#06b6d4'}
              emissiveIntensity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

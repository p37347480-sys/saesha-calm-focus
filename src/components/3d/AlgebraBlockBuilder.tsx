import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const algebraQuestions: Question[] = [
  {
    question: "(a + b)² expands to?",
    options: ["a² + b²", "a² + 2ab + b²", "a² - 2ab + b²", "2a² + 2b²"],
    correctAnswer: 1
  },
  {
    question: "What is the area of a square with side 'x'?",
    options: ["4x", "2x", "x²", "x + x"],
    correctAnswer: 2
  },
  {
    question: "(x + 3)(x + 2) = ?",
    options: ["x² + 5x + 6", "x² + 6x + 5", "x² + 5x + 5", "2x + 5"],
    correctAnswer: 0
  },
  {
    question: "If a = 3 and b = 2, what is ab?",
    options: ["5", "6", "32", "1"],
    correctAnswer: 1
  },
  {
    question: "The area of a rectangle with length a and width b is?",
    options: ["a + b", "2(a + b)", "a × b", "a² + b²"],
    correctAnswer: 2
  },
  {
    question: "(a - b)² equals?",
    options: ["a² - b²", "a² + 2ab + b²", "a² - 2ab + b²", "a² - ab + b²"],
    correctAnswer: 2
  },
  {
    question: "What does 2ab represent geometrically?",
    options: ["Two squares", "Two rectangles of size a×b", "A single line", "A circle"],
    correctAnswer: 1
  },
  {
    question: "x² + 6x + 9 factors to?",
    options: ["(x + 3)²", "(x - 3)²", "(x + 9)(x - 3)", "(x + 1)(x + 9)"],
    correctAnswer: 0
  }
];

function QuizPanel({ currentQuestion, onAnswer, score, totalQuestions }: { 
  currentQuestion: Question | null;
  onAnswer: (index: number) => void;
  score: number;
  totalQuestions: number;
}) {
  if (!currentQuestion) return null;

  return (
    <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm p-4 rounded-xl shadow-lg max-w-sm border border-border">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-primary">🧱 Algebra Quiz</span>
        <span className="text-sm text-muted-foreground">Score: {score}/{totalQuestions}</span>
      </div>
      <p className="text-foreground font-medium mb-3">{currentQuestion.question}</p>
      <div className="space-y-2">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(index)}
            className="w-full text-left p-2 rounded-lg bg-muted hover:bg-primary/20 transition-colors text-sm text-foreground"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

// Interactive algebra block
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
  
  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 2;
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      }
    }
  });

  return (
    <Float speed={isSelected ? 3 : 1} floatIntensity={isSelected ? 0.4 : 0.15}>
      <mesh ref={meshRef} position={position} onClick={onClick}>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={isSelected ? 0.6 : 0.3}
        />
      </mesh>
    </Float>
  );
}

// Expression builder showing (a+b)² expansion
function ExpressionBuilder({ a, b }: { a: number; b: number }) {
  const a2 = a * a;
  const b2 = b * b;
  const ab = a * b;
  
  return (
    <group position={[0, 0, 0]}>
      {/* a² square */}
      <mesh position={[-a/2, 0, -a/2]}>
        <boxGeometry args={[a, 0.15, a]} />
        <meshStandardMaterial 
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>
      
      {/* b² square */}
      <mesh position={[a/2 + b/2, 0, a/2 + b/2]}>
        <boxGeometry args={[b, 0.15, b]} />
        <meshStandardMaterial 
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>
      
      {/* First ab rectangle */}
      <mesh position={[a/2 + b/2, 0, -a/2]}>
        <boxGeometry args={[b, 0.12, a]} />
        <meshStandardMaterial 
          color="#c4b5fd"
          emissive="#c4b5fd"
          emissiveIntensity={0.35}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Second ab rectangle */}
      <mesh position={[-a/2, 0, a/2 + b/2]}>
        <boxGeometry args={[a, 0.12, b]} />
        <meshStandardMaterial 
          color="#c4b5fd"
          emissive="#c4b5fd"
          emissiveIntensity={0.35}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

// Variable slider blocks
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
  return (
    <group position={position}>
      {/* Variable block */}
      <mesh>
        <boxGeometry args={[value * 0.5, 0.5, 0.5]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Increase button */}
      <Float speed={2} floatIntensity={0.2}>
        <mesh position={[value * 0.3 + 0.4, 0, 0]} onClick={onIncrease}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
        </mesh>
      </Float>
      
      {/* Decrease button */}
      <Float speed={2} floatIntensity={0.2}>
        <mesh position={[-value * 0.3 - 0.4, 0, 0]} onClick={onDecrease}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
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

  useEffect(() => {
    if (interactionCount > 0 && interactionCount % 3 === 0 && !currentQuestion) {
      const available = algebraQuestions.filter((_, i) => !usedQuestions.includes(i));
      if (available.length > 0) {
        const randomIdx = Math.floor(Math.random() * available.length);
        const originalIdx = algebraQuestions.indexOf(available[randomIdx]);
        setCurrentQuestion(available[randomIdx]);
        setUsedQuestions(prev => [...prev, originalIdx]);
      }
    }
  }, [interactionCount]);

  const handleAnswer = (selectedIndex: number) => {
    if (currentQuestion && selectedIndex === currentQuestion.correctAnswer) {
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

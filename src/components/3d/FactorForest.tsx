import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const factorQuestions: Question[] = [
  { question: "x² + 5x + 6 factors to?", options: ["(x+1)(x+6)", "(x+2)(x+3)", "(x+5)(x+1)", "(x-2)(x-3)"], correctAnswer: 1 },
  { question: "What are the factors of x² - 9?", options: ["(x+3)(x+3)", "(x-3)(x-3)", "(x+3)(x-3)", "(x+9)(x-1)"], correctAnswer: 2 },
  { question: "If (x+a)(x+b) = x² + 7x + 12, what is a+b?", options: ["3", "7", "12", "4"], correctAnswer: 1 },
  { question: "x² - 5x + 6 factors to?", options: ["(x-2)(x-3)", "(x+2)(x+3)", "(x-1)(x-6)", "(x+1)(x-6)"], correctAnswer: 0 },
  { question: "The roots of (x+2)(x-5) = 0 are?", options: ["x = 2, 5", "x = -2, 5", "x = 2, -5", "x = -2, -5"], correctAnswer: 1 },
  { question: "To factor x² + bx + c, we need two numbers that?", options: ["Add to b, multiply to c", "Add to c, multiply to b", "Both equal b", "Both equal c"], correctAnswer: 0 },
  { question: "What is a² - b² called?", options: ["Perfect square", "Sum of squares", "Difference of squares", "Quadratic"], correctAnswer: 2 },
  { question: "2x² + 4x factors to?", options: ["2(x² + 2x)", "2x(x + 2)", "x(2x + 4)", "Both B and C"], correctAnswer: 3 },
  { question: "x² + 8x + 16 factors to?", options: ["(x+4)²", "(x+8)(x+2)", "(x-4)²", "(x+16)(x+1)"], correctAnswer: 0 },
  { question: "What is the GCF of 6x² and 9x?", options: ["3", "3x", "6x", "x²"], correctAnswer: 1 },
  { question: "x² - 4x - 12 factors to?", options: ["(x-6)(x+2)", "(x+6)(x-2)", "(x-4)(x-3)", "(x+4)(x-3)"], correctAnswer: 0 },
  { question: "Which is a perfect square trinomial?", options: ["x² + 4x + 4", "x² + 5x + 6", "x² - 9", "x² + x"], correctAnswer: 0 },
  { question: "Factor: 3x + 6", options: ["3(x + 2)", "x(3 + 6)", "3(x + 6)", "6(x + 1)"], correctAnswer: 0 },
  { question: "x² - 16 factors to?", options: ["(x-4)²", "(x+4)(x-4)", "(x-8)(x+2)", "(x+16)(x-1)"], correctAnswer: 1 },
  { question: "What are the roots of x² - x - 6 = 0?", options: ["x = 2, -3", "x = -2, 3", "x = 3, -2", "x = 1, 6"], correctAnswer: 2 }
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
        <span className="text-sm font-medium text-primary">🌲 Factoring Quiz</span>
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

// Interactive factoring tree
function FactorTree({ 
  expression, 
  factors,
  position,
  isExpanded,
  onClick
}: {
  expression: string;
  factors: [string, string];
  position: [number, number, number];
  isExpanded: boolean;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      {/* Main trunk (expression) */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 3, 12]} />
        <meshStandardMaterial color="#92400e" roughness={0.8} />
      </mesh>
      
      {/* Expression crown */}
      <Float speed={1} floatIntensity={0.1}>
        <mesh position={[0, 3.2, 0]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial 
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>
      
      {/* Factor branches */}
      {isExpanded && (
        <>
          {/* Left branch and root */}
          <mesh position={[-0.6, 0.5, 0]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.08, 0.12, 1.5, 8]} />
            <meshStandardMaterial color="#a16207" roughness={0.7} />
          </mesh>
          <Float speed={1.5} floatIntensity={0.2}>
            <mesh position={[-1.2, -0.5, 0.5]}>
              <dodecahedronGeometry args={[0.4]} />
              <meshStandardMaterial
                color="#a855f7"
                metalness={0.8}
                roughness={0.2}
                emissive="#a855f7"
                emissiveIntensity={0.6}
              />
            </mesh>
          </Float>
          
          {/* Right branch and root */}
          <mesh position={[0.6, 0.5, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.08, 0.12, 1.5, 8]} />
            <meshStandardMaterial color="#a16207" roughness={0.7} />
          </mesh>
          <Float speed={1.5} floatIntensity={0.2}>
            <mesh position={[1.2, -0.5, 0.5]}>
              <dodecahedronGeometry args={[0.4]} />
              <meshStandardMaterial
                color="#ec4899"
                metalness={0.8}
                roughness={0.2}
                emissive="#ec4899"
                emissiveIntensity={0.6}
              />
            </mesh>
          </Float>
          
          {/* Root connections with glow */}
          <mesh position={[-0.6, -0.2, 0.3]} rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.05, 0.08, 1, 8]} />
            <meshStandardMaterial color="#713f12" emissive="#a855f7" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0.6, -0.2, 0.3]} rotation={[0, 0, -0.3]}>
            <cylinderGeometry args={[0.05, 0.08, 1, 8]} />
            <meshStandardMaterial color="#713f12" emissive="#ec4899" emissiveIntensity={0.3} />
          </mesh>
        </>
      )}
      
      {/* Decorative leaves */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Float key={i} speed={2} floatIntensity={0.3}>
          <mesh position={[
            Math.cos((i / 6) * Math.PI * 2) * 0.8,
            2.5 + Math.sin(i * 0.5) * 0.3,
            Math.sin((i / 6) * Math.PI * 2) * 0.8
          ]}>
            <sphereGeometry args={[0.25, 12, 12]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={0.2}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Common factor extractor
function CommonFactorMachine({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const machineRef = useRef<THREE.Group>(null);
  const [isActive, setIsActive] = useState(false);
  
  useFrame((state) => {
    if (machineRef.current && isActive) {
      machineRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  const handleClick = () => {
    setIsActive(!isActive);
    onClick();
  };

  return (
    <group ref={machineRef} position={position} onClick={handleClick}>
      {/* Base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.8, 1, 0.3, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Extraction funnel */}
      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[0.6, 1, 16, 1, true]} />
        <meshStandardMaterial 
          color="#3b82f6"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Output tubes */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={i} position={[x, -0.2, 0]} rotation={[0, 0, x > 0 ? 0.3 : -0.3]}>
          <cylinderGeometry args={[0.1, 0.15, 0.6, 8]} />
          <meshStandardMaterial 
            color={i === 0 ? '#a855f7' : '#ec4899'}
            emissive={i === 0 ? '#a855f7' : '#ec4899'}
            emissiveIntensity={isActive ? 0.6 : 0.2}
          />
        </mesh>
      ))}
      
      {/* Glow ring */}
      <mesh position={[0, 1.3, 0]}>
        <torusGeometry args={[0.5, 0.05, 8, 32]} />
        <meshStandardMaterial 
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={isActive ? 1 : 0.3}
        />
      </mesh>
    </group>
  );
}

export function FactorForest() {
  const [expandedTrees, setExpandedTrees] = useState<number[]>([]);
  const [interactionCount, setInteractionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);

  const toggleTree = (index: number) => {
    setExpandedTrees(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
    setInteractionCount(prev => prev + 1);
  };

  const handleMachineClick = () => {
    setInteractionCount(prev => prev + 1);
  };

  useEffect(() => {
    if (interactionCount > 0 && interactionCount % 2 === 0 && !currentQuestion) {
      const available = factorQuestions.filter((_, i) => !usedQuestions.includes(i));
      if (available.length > 0) {
        const randomIdx = Math.floor(Math.random() * available.length);
        const originalIdx = factorQuestions.indexOf(available[randomIdx]);
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

  const trees = [
    { expression: 'x² + 5x + 6', factors: ['(x+2)', '(x+3)'] as [string, string] },
    { expression: 'x² - 9', factors: ['(x+3)', '(x-3)'] as [string, string] },
    { expression: 'x² + 7x + 12', factors: ['(x+3)', '(x+4)'] as [string, string] },
  ];

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 3]} intensity={0.6} color="#fef3c7" />
      <pointLight position={[-3, 2, 2]} intensity={0.5} color="#22c55e" />
      <pointLight position={[3, -1, 2]} intensity={0.4} color="#a855f7" />
      <fog attach="fog" args={['#134e4a', 8, 25]} />

      <Html fullscreen>
        <QuizPanel 
          currentQuestion={currentQuestion}
          onAnswer={handleAnswer}
          score={score}
          totalQuestions={questionsAnswered}
        />
      </Html>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#134e4a" />
      </mesh>

      {/* Forest path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.48, 0]}>
        <planeGeometry args={[1.5, 12]} />
        <meshStandardMaterial color="#713f12" roughness={0.9} />
      </mesh>

      {/* Factor trees */}
      {trees.map((tree, i) => (
        <FactorTree
          key={i}
          expression={tree.expression}
          factors={tree.factors}
          position={[(i - 1) * 3, -1.5, -2 + i * 0.5]}
          isExpanded={expandedTrees.includes(i)}
          onClick={() => toggleTree(i)}
        />
      ))}

      {/* Common factor machine */}
      <CommonFactorMachine position={[0, -1, 3]} onClick={handleMachineClick} />

      {/* Background trees */}
      {[-5, -3, 3, 5].map((x, i) => (
        <group key={i} position={[x, -1.5, -5 - Math.abs(x) * 0.3]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.15, 0.25, 3, 8]} />
            <meshStandardMaterial color="#713f12" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.5, 0]}>
            <coneGeometry args={[1, 2.5, 8]} />
            <meshStandardMaterial color="#166534" />
          </mesh>
        </group>
      ))}

      {/* Magical particles */}
      {[...Array(25)].map((_, i) => (
        <Float key={i} speed={3} rotationIntensity={0.5} floatIntensity={1}>
          <mesh position={[
            (Math.random() - 0.5) * 10,
            Math.random() * 4,
            (Math.random() - 0.5) * 8
          ]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#a855f7' : '#22c55e'}
              emissive={i % 2 === 0 ? '#a855f7' : '#22c55e'}
              emissiveIntensity={1}
            />
          </mesh>
        </Float>
      ))}

      {/* Fireflies */}
      {[...Array(10)].map((_, i) => (
        <Float key={`fly-${i}`} speed={0.5 + Math.random()} floatIntensity={2}>
          <pointLight
            position={[
              (Math.random() - 0.5) * 12,
              Math.random() * 3 + 0.5,
              (Math.random() - 0.5) * 10
            ]}
            intensity={0.2}
            distance={2}
            color="#fef08a"
          />
        </Float>
      ))}
    </>
  );
}

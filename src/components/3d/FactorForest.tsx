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

// Enhanced interactive factoring tree with better animations
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
  const [hovered, setHovered] = useState(false);
  const crownRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
      if (hovered) {
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, 1.1, 0.1));
      } else {
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, 1, 0.1));
      }
    }
    if (crownRef.current) {
      const pulse = isExpanded ? Math.sin(state.clock.elapsedTime * 4) * 0.1 + 1 : 1;
      crownRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position} 
      onClick={onClick}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* Main trunk (expression) with bark texture effect */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 3, 12]} />
        <meshStandardMaterial 
          color={hovered ? '#b45309' : '#92400e'} 
          roughness={0.8}
          emissive="#92400e"
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>
      
      {/* Expression crown with enhanced glow */}
      <Float speed={1.5} floatIntensity={0.15}>
        <group position={[0, 3.2, 0]}>
          <mesh ref={crownRef}>
            <sphereGeometry args={[0.6, 24, 24]} />
            <meshStandardMaterial 
              color={isExpanded ? '#4ade80' : '#22c55e'}
              emissive={isExpanded ? '#4ade80' : '#22c55e'}
              emissiveIntensity={isExpanded ? 0.6 : 0.3}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
          {/* Outer glow ring */}
          {(hovered || isExpanded) && (
            <mesh>
              <sphereGeometry args={[0.75, 16, 16]} />
              <meshBasicMaterial color="#4ade80" transparent opacity={0.2} />
            </mesh>
          )}
        </group>
      </Float>
      
      {/* Factor branches with smooth animation */}
      {isExpanded && (
        <>
          {/* Left branch and root with enhanced visuals */}
          <mesh position={[-0.6, 0.5, 0]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.08, 0.12, 1.5, 8]} />
            <meshStandardMaterial color="#a16207" roughness={0.7} emissive="#a16207" emissiveIntensity={0.1} />
          </mesh>
          <Float speed={2} floatIntensity={0.3}>
            <group position={[-1.2, -0.5, 0.5]}>
              <mesh>
                <dodecahedronGeometry args={[0.45]} />
                <meshStandardMaterial
                  color="#a855f7"
                  metalness={0.9}
                  roughness={0.1}
                  emissive="#a855f7"
                  emissiveIntensity={0.7}
                />
              </mesh>
              <mesh scale={1.3}>
                <dodecahedronGeometry args={[0.45]} />
                <meshBasicMaterial color="#a855f7" transparent opacity={0.15} wireframe />
              </mesh>
            </group>
          </Float>
          
          {/* Right branch and root with enhanced visuals */}
          <mesh position={[0.6, 0.5, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.08, 0.12, 1.5, 8]} />
            <meshStandardMaterial color="#a16207" roughness={0.7} emissive="#a16207" emissiveIntensity={0.1} />
          </mesh>
          <Float speed={2} floatIntensity={0.3}>
            <group position={[1.2, -0.5, 0.5]}>
              <mesh>
                <dodecahedronGeometry args={[0.45]} />
                <meshStandardMaterial
                  color="#ec4899"
                  metalness={0.9}
                  roughness={0.1}
                  emissive="#ec4899"
                  emissiveIntensity={0.7}
                />
              </mesh>
              <mesh scale={1.3}>
                <dodecahedronGeometry args={[0.45]} />
                <meshBasicMaterial color="#ec4899" transparent opacity={0.15} wireframe />
              </mesh>
            </group>
          </Float>
          
          {/* Energy connection beams */}
          <mesh position={[-0.6, -0.2, 0.3]} rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.03, 0.06, 1, 8]} />
            <meshStandardMaterial color="#e879f9" emissive="#a855f7" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0.6, -0.2, 0.3]} rotation={[0, 0, -0.3]}>
            <cylinderGeometry args={[0.03, 0.06, 1, 8]} />
            <meshStandardMaterial color="#f472b6" emissive="#ec4899" emissiveIntensity={0.8} />
          </mesh>
        </>
      )}
      
      {/* Animated decorative leaves */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Float key={i} speed={2 + i * 0.2} floatIntensity={0.4}>
          <mesh position={[
            Math.cos((i / 8) * Math.PI * 2) * 0.9,
            2.5 + Math.sin(i * 0.7) * 0.4,
            Math.sin((i / 8) * Math.PI * 2) * 0.9
          ]}>
            <sphereGeometry args={[0.2 + Math.random() * 0.1, 12, 12]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#22c55e' : '#4ade80'}
              emissive={i % 2 === 0 ? '#22c55e' : '#4ade80'}
              emissiveIntensity={0.3}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Enhanced common factor extractor machine
function CommonFactorMachine({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const machineRef = useRef<THREE.Group>(null);
  const [isActive, setIsActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (machineRef.current) {
      if (isActive) {
        machineRef.current.rotation.y = state.clock.elapsedTime * 3;
      } else if (hovered) {
        machineRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      }
    }
    if (ringRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.1 + 1;
      ringRef.current.scale.setScalar(pulse);
    }
  });

  const handleClick = () => {
    setIsActive(!isActive);
    onClick();
  };

  return (
    <group 
      ref={machineRef} 
      position={position} 
      onClick={handleClick}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* Base with metallic sheen */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.9, 1.1, 0.35, 20]} />
        <meshStandardMaterial 
          color={hovered ? '#64748b' : '#475569'} 
          metalness={0.9} 
          roughness={0.15}
          emissive="#475569"
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>
      
      {/* Extraction funnel with glow */}
      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[0.7, 1.1, 20, 1, true]} />
        <meshStandardMaterial 
          color={isActive ? '#60a5fa' : '#3b82f6'}
          transparent
          opacity={isActive ? 0.8 : 0.6}
          side={THREE.DoubleSide}
          emissive="#3b82f6"
          emissiveIntensity={isActive ? 0.5 : 0.2}
        />
      </mesh>
      
      {/* Output tubes with enhanced effects */}
      {[-0.5, 0.5].map((x, i) => (
        <group key={i}>
          <mesh position={[x, -0.2, 0]} rotation={[0, 0, x > 0 ? 0.3 : -0.3]}>
            <cylinderGeometry args={[0.12, 0.18, 0.7, 12]} />
            <meshStandardMaterial 
              color={i === 0 ? '#a855f7' : '#ec4899'}
              emissive={i === 0 ? '#a855f7' : '#ec4899'}
              emissiveIntensity={isActive ? 0.8 : 0.3}
              metalness={0.8}
            />
          </mesh>
          {isActive && (
            <Float speed={5} floatIntensity={0.5}>
              <mesh position={[x * 1.2, -0.5, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial 
                  color={i === 0 ? '#a855f7' : '#ec4899'}
                  emissive={i === 0 ? '#a855f7' : '#ec4899'}
                  emissiveIntensity={1}
                />
              </mesh>
            </Float>
          )}
        </group>
      ))}
      
      {/* Pulsing glow ring */}
      <mesh ref={ringRef} position={[0, 1.35, 0]}>
        <torusGeometry args={[0.55, 0.06, 12, 32]} />
        <meshStandardMaterial 
          color={isActive ? '#4ade80' : '#22c55e'}
          emissive={isActive ? '#4ade80' : '#22c55e'}
          emissiveIntensity={isActive ? 1.2 : 0.4}
        />
      </mesh>

      {/* Hover indicator */}
      {hovered && !isActive && (
        <mesh position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
        </mesh>
      )}
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

  // Auto-trigger question every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentQuestion && usedQuestions.length < factorQuestions.length) {
        const available = factorQuestions.filter((_, i) => !usedQuestions.includes(i));
        if (available.length > 0) {
          const randomIdx = Math.floor(Math.random() * available.length);
          const originalIdx = factorQuestions.indexOf(available[randomIdx]);
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
      const available = factorQuestions.filter((_, i) => !usedQuestions.includes(i));
      if (available.length > 0) {
        const randomIdx = Math.floor(Math.random() * available.length);
        const originalIdx = factorQuestions.indexOf(available[randomIdx]);
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
          emoji="🌲"
          title="Factoring Quiz"
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

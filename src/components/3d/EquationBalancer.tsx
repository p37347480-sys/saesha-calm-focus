import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const equationQuestions: Question[] = [
  { question: "If 2x = 10, what is x?", options: ["2", "5", "10", "20"], correctAnswer: 1 },
  { question: "To solve x + 5 = 12, what operation do we use?", options: ["Add 5", "Subtract 5", "Multiply by 5", "Divide by 5"], correctAnswer: 1 },
  { question: "If 3x + 2 = 14, what is x?", options: ["2", "3", "4", "6"], correctAnswer: 2 },
  { question: "An equation is balanced when?", options: ["Left side is bigger", "Right side is bigger", "Both sides are equal", "One side is zero"], correctAnswer: 2 },
  { question: "If x - 7 = 3, what is x?", options: ["4", "7", "10", "-4"], correctAnswer: 2 },
  { question: "To isolate x in 4x = 20, we?", options: ["Add 4", "Subtract 4", "Multiply by 4", "Divide by 4"], correctAnswer: 3 },
  { question: "In 2x + 3 = x + 7, x equals?", options: ["2", "3", "4", "7"], correctAnswer: 2 },
  { question: "Whatever we do to one side of an equation, we must?", options: ["Do the opposite to the other", "Do the same to the other", "Leave the other alone", "Double the other"], correctAnswer: 1 },
  { question: "Solve: x/3 = 6", options: ["x = 2", "x = 9", "x = 18", "x = 3"], correctAnswer: 2 },
  { question: "If 5x - 10 = 15, what is x?", options: ["1", "3", "5", "25"], correctAnswer: 2 },
  { question: "What is the inverse of addition?", options: ["Multiplication", "Division", "Subtraction", "Exponent"], correctAnswer: 2 },
  { question: "Solve: 2(x + 3) = 10", options: ["x = 1", "x = 2", "x = 3", "x = 5"], correctAnswer: 1 },
  { question: "If -x = 5, what is x?", options: ["5", "-5", "0", "1/5"], correctAnswer: 1 },
  { question: "Solve: x + x + x = 15", options: ["x = 3", "x = 5", "x = 15", "x = 45"], correctAnswer: 1 },
  { question: "In the equation 7x = 49, x equals?", options: ["6", "7", "8", "42"], correctAnswer: 1 }
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
        <span className="text-sm font-medium text-primary">⚖️ Equation Quiz</span>
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

// Draggable weight
function Weight({ 
  value, 
  position, 
  color, 
  type,
  onClick 
}: {
  value: number;
  position: [number, number, number];
  color: string;
  type: 'x' | 'number';
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <Float speed={2} floatIntensity={0.2}>
      <mesh ref={meshRef} position={position} onClick={onClick}>
        {type === 'x' ? (
          <boxGeometry args={[0.5, 0.5, 0.5]} />
        ) : (
          <sphereGeometry args={[0.2 + value * 0.05, 16, 16]} />
        )}
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

// Balance scale
function BalanceScale({ 
  leftWeight, 
  rightWeight,
  onLeftClick,
  onRightClick
}: {
  leftWeight: number;
  rightWeight: number;
  onLeftClick: () => void;
  onRightClick: () => void;
}) {
  const beamRef = useRef<THREE.Mesh>(null);
  const leftPanRef = useRef<THREE.Group>(null);
  const rightPanRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Mesh>(null);
  
  const tiltAngle = Math.max(-0.3, Math.min(0.3, (leftWeight - rightWeight) * 0.05));
  
  useFrame((state) => {
    if (beamRef.current) {
      beamRef.current.rotation.z = THREE.MathUtils.lerp(
        beamRef.current.rotation.z,
        tiltAngle,
        0.05
      );
    }
    
    if (leftPanRef.current) {
      leftPanRef.current.position.y = -1.5 - tiltAngle * 2;
    }
    if (rightPanRef.current) {
      rightPanRef.current.position.y = -1.5 + tiltAngle * 2;
    }
    
    if (pivotRef.current) {
      const intensity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      (pivotRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 
        Math.abs(leftWeight - rightWeight) < 0.5 ? 0.8 : intensity;
    }
  });

  const isBalanced = Math.abs(leftWeight - rightWeight) < 0.5;

  return (
    <group>
      {/* Pivot/fulcrum */}
      <mesh ref={pivotRef} position={[0, 0, 0]}>
        <coneGeometry args={[0.5, 1.5, 4]} />
        <meshStandardMaterial
          color={isBalanced ? '#22c55e' : '#f59e0b'}
          metalness={0.9}
          roughness={0.1}
          emissive={isBalanced ? '#22c55e' : '#f59e0b'}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Balance beam */}
      <mesh ref={beamRef} position={[0, 0.8, 0]}>
        <boxGeometry args={[5, 0.15, 0.3]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Left pan */}
      <group ref={leftPanRef} position={[-2, -1.5, 0]} onClick={onLeftClick}>
        {/* Chains */}
        {[-0.3, 0.3].map((z, i) => (
          <mesh key={i} position={[0, 0.7, z]}>
            <cylinderGeometry args={[0.02, 0.02, 1.4, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        {/* Pan */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.7, 0.1, 32]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      
      {/* Right pan */}
      <group ref={rightPanRef} position={[2, -1.5, 0]} onClick={onRightClick}>
        {/* Chains */}
        {[-0.3, 0.3].map((z, i) => (
          <mesh key={i} position={[0, 0.7, z]}>
            <cylinderGeometry args={[0.02, 0.02, 1.4, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
        {/* Pan */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.7, 0.1, 32]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      
      {/* Balance indicator ring */}
      <mesh position={[0, 1.2, 0]}>
        <torusGeometry args={[0.3, 0.05, 8, 32]} />
        <meshStandardMaterial 
          color={isBalanced ? '#22c55e' : '#ef4444'}
          emissive={isBalanced ? '#22c55e' : '#ef4444'}
          emissiveIntensity={isBalanced ? 1 : 0.3}
        />
      </mesh>
    </group>
  );
}

// Operation button
function OperationButton({ 
  operation, 
  position, 
  onClick 
}: {
  operation: '+' | '-' | '×' | '÷';
  position: [number, number, number];
  onClick: () => void;
}) {
  const colors: Record<string, string> = {
    '+': '#22c55e',
    '-': '#ef4444',
    '×': '#3b82f6',
    '÷': '#f59e0b'
  };

  return (
    <Float speed={2} floatIntensity={0.3}>
      <mesh position={position} onClick={onClick}>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 32]} />
        <meshStandardMaterial 
          color={colors[operation]}
          emissive={colors[operation]}
          emissiveIntensity={0.4}
          metalness={0.7}
        />
      </mesh>
    </Float>
  );
}

export function EquationBalancer() {
  const [leftWeight, setLeftWeight] = useState(5);
  const [rightWeight, setRightWeight] = useState(3);
  const [interactionCount, setInteractionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);

  const handleAddLeft = () => {
    setLeftWeight(prev => prev + 1);
    setInteractionCount(prev => prev + 1);
  };

  const handleAddRight = () => {
    setRightWeight(prev => prev + 1);
    setInteractionCount(prev => prev + 1);
  };

  const handleSubtractBoth = () => {
    setLeftWeight(prev => Math.max(0, prev - 1));
    setRightWeight(prev => Math.max(0, prev - 1));
    setInteractionCount(prev => prev + 1);
  };

  const handleAddBoth = () => {
    setLeftWeight(prev => prev + 1);
    setRightWeight(prev => prev + 1);
    setInteractionCount(prev => prev + 1);
  };

  useEffect(() => {
    if (interactionCount > 0 && interactionCount % 3 === 0 && !currentQuestion) {
      const available = equationQuestions.filter((_, i) => !usedQuestions.includes(i));
      if (available.length > 0) {
        const randomIdx = Math.floor(Math.random() * available.length);
        const originalIdx = equationQuestions.indexOf(available[randomIdx]);
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

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} />
      <pointLight position={[-3, 2, 2]} intensity={0.5} color="#3b82f6" />
      <pointLight position={[3, 2, 2]} intensity={0.5} color="#f59e0b" />
      <fog attach="fog" args={['#0c4a6e', 8, 25]} />

      <Html fullscreen>
        <QuizPanel 
          currentQuestion={currentQuestion}
          onAnswer={handleAnswer}
          score={score}
          totalQuestions={questionsAnswered}
        />
      </Html>

      {/* Arena floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[14, 14, 28, 28]} />
        <meshStandardMaterial color="#0c4a6e" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Main balance */}
      <BalanceScale 
        leftWeight={leftWeight}
        rightWeight={rightWeight}
        onLeftClick={handleAddLeft}
        onRightClick={handleAddRight}
      />

      {/* Weights on left pan */}
      <group position={[-2, -1.2, 0]}>
        {/* X cube (variable) */}
        <Weight 
          value={1}
          position={[0, 0.3, 0]}
          color="#3b82f6"
          type="x"
          onClick={handleAddLeft}
        />
        {/* Number weights */}
        {Array.from({ length: Math.min(leftWeight, 5) }).map((_, i) => (
          <Weight
            key={i}
            value={1}
            position={[(i % 3 - 1) * 0.35, 0.3 + Math.floor(i / 3) * 0.4, (Math.floor(i / 3) - 0.5) * 0.3]}
            color="#3b82f6"
            type="number"
            onClick={handleAddLeft}
          />
        ))}
      </group>

      {/* Weights on right pan */}
      <group position={[2, -1.2, 0]}>
        {Array.from({ length: Math.min(rightWeight, 6) }).map((_, i) => (
          <Weight
            key={i}
            value={1}
            position={[(i % 3 - 1) * 0.35, 0.3 + Math.floor(i / 3) * 0.4, (Math.floor(i / 3) - 0.5) * 0.3]}
            color="#f59e0b"
            type="number"
            onClick={handleAddRight}
          />
        ))}
      </group>

      {/* Operation buttons */}
      <group position={[0, -2.5, 3]}>
        <OperationButton operation="+" position={[-1.5, 0, 0]} onClick={handleAddBoth} />
        <OperationButton operation="-" position={[-0.5, 0, 0]} onClick={handleSubtractBoth} />
        <OperationButton operation="×" position={[0.5, 0, 0]} onClick={() => setInteractionCount(prev => prev + 1)} />
        <OperationButton operation="÷" position={[1.5, 0, 0]} onClick={() => setInteractionCount(prev => prev + 1)} />
      </group>

      {/* Floating equation symbol */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh position={[0, 2.5, -2]}>
          <torusGeometry args={[0.3, 0.08, 16, 32]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
        </mesh>
      </Float>

      {/* Anti-gravity negative weight floating nearby */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
        <mesh position={[-3.5, 1, 1]}>
          <octahedronGeometry args={[0.3]} />
          <meshStandardMaterial
            color="#ef4444"
            metalness={0.8}
            roughness={0.1}
            emissive="#ef4444"
            emissiveIntensity={0.4}
          />
        </mesh>
      </Float>

      {/* Arena pillars */}
      {[-5, 5].map((x, i) => (
        <mesh key={i} position={[x, -1, -3]}>
          <cylinderGeometry args={[0.2, 0.25, 4, 8]} />
          <meshStandardMaterial
            color="#1e3a5f"
            metalness={0.6}
            roughness={0.4}
            emissive="#3b82f6"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <Float key={i} speed={0.5 + Math.random()} floatIntensity={0.5}>
          <mesh position={[
            (Math.random() - 0.5) * 10,
            Math.random() * 5 - 1,
            (Math.random() - 0.5) * 8
          ]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? '#3b82f6' : '#f59e0b'}
              emissive={i % 2 === 0 ? '#3b82f6' : '#f59e0b'}
              emissiveIntensity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

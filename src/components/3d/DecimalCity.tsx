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

const decimalQuestions: Question[] = [
  { question: "What decimal is the same as 1/2?", options: ["0.2", "0.5", "0.25", "0.75"], correctAnswer: 1 },
  { question: "In 3.45, what does the 4 represent?", options: ["4 ones", "4 tenths", "4 hundredths", "4 tens"], correctAnswer: 1 },
  { question: "Which is larger: 0.3 or 0.25?", options: ["0.3", "0.25", "They're equal", "Cannot compare"], correctAnswer: 0 },
  { question: "What is 0.1 + 0.1 + 0.1?", options: ["0.111", "0.3", "1.11", "0.03"], correctAnswer: 1 },
  { question: "1/4 as a decimal is?", options: ["0.14", "0.4", "0.25", "0.75"], correctAnswer: 2 },
  { question: "How many tenths are in one whole?", options: ["5", "10", "100", "1"], correctAnswer: 1 },
  { question: "0.75 as a fraction is?", options: ["7/5", "3/4", "75/10", "7/50"], correctAnswer: 1 },
  { question: "What is 0.5 × 2?", options: ["0.1", "0.25", "1", "2.5"], correctAnswer: 2 },
  { question: "What is 1.5 + 0.5?", options: ["1.0", "2.0", "1.55", "2.5"], correctAnswer: 1 },
  { question: "Which is smaller: 0.09 or 0.1?", options: ["0.09", "0.1", "They're equal", "Cannot tell"], correctAnswer: 0 },
  { question: "In 2.375, the 7 is in which place?", options: ["Tenths", "Hundredths", "Thousandths", "Ones"], correctAnswer: 1 },
  { question: "What is 0.6 + 0.4?", options: ["0.10", "1.0", "0.64", "10"], correctAnswer: 1 },
  { question: "3/5 as a decimal is?", options: ["0.35", "0.6", "0.53", "0.3"], correctAnswer: 1 },
  { question: "What is 2.5 - 1.5?", options: ["0.5", "1.0", "1.5", "3.0"], correctAnswer: 1 },
  { question: "Round 3.67 to the nearest tenth:", options: ["3.6", "3.7", "4.0", "3.0"], correctAnswer: 1 }
];

// Using shared QuizPanel component from ./QuizPanel

// Neon building representing decimal value
function DecimalBuilding({ 
  value, 
  position, 
  color,
  onClick
}: {
  value: number;
  position: [number, number, number];
  color: string;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const height = Math.max(0.3, value * 4);
  
  // Break down value into floors
  const ones = Math.floor(value);
  const tenths = Math.floor((value * 10) % 10);
  const hundredths = Math.floor((value * 100) % 10);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime + position[0]) * 0.05;
    }
  });

  return (
    <group ref={meshRef} position={position} onClick={onClick}>
      {/* Building base */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Ones floors (large) */}
      {Array.from({ length: ones }).map((_, i) => (
        <mesh key={`one-${i}`} position={[0, 0.3 + i * 0.8, 0]}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.6}
          />
        </mesh>
      ))}

      {/* Tenths floors (medium) */}
      {Array.from({ length: tenths }).map((_, i) => (
        <mesh key={`tenth-${i}`} position={[0, 0.3 + ones * 0.8 + i * 0.3, 0]}>
          <boxGeometry args={[0.5, 0.25, 0.5]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={0.7}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      {/* Hundredths (tiny lights) */}
      {Array.from({ length: hundredths }).map((_, i) => (
        <mesh 
          key={`hundredth-${i}`} 
          position={[
            (i % 3 - 1) * 0.15,
            0.3 + ones * 0.8 + tenths * 0.3 + 0.15,
            Math.floor(i / 3) * 0.15 - 0.15
          ]}
        >
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
          />
        </mesh>
      ))}

      {/* Neon glow ring at top */}
      <mesh position={[0, height + 0.1, 0]}>
        <torusGeometry args={[0.3, 0.02, 8, 32]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
}

// Flying drone camera
function Drone({ position }: { position: [number, number, number] }) {
  const droneRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (droneRef.current) {
      droneRef.current.rotation.y = state.clock.elapsedTime * 2;
      droneRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <group ref={droneRef} position={position}>
      <mesh>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial color="#4b5563" metalness={0.9} />
      </mesh>
      {/* Propellers */}
      {[[-0.2, 0, -0.2], [0.2, 0, -0.2], [-0.2, 0, 0.2], [0.2, 0, 0.2]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 8]} />
          <meshStandardMaterial color="#94a3b8" emissive="#06b6d4" emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Light */}
      <pointLight position={[0, -0.2, 0]} intensity={0.5} color="#06b6d4" distance={3} />
    </group>
  );
}

// Energy cube collectible
function EnergyCube({ position, value, color }: {
  position: [number, number, number];
  value: number;
  color: string;
}) {
  const cubeRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x = state.clock.elapsedTime;
      cubeRef.current.rotation.y = state.clock.elapsedTime * 1.5;
    }
  });

  return (
    <Float speed={2} floatIntensity={0.5}>
      <mesh ref={cubeRef} position={position}>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
}

export function DecimalCity() {
  const [interactionCount, setInteractionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);
  const [buildingValues, setBuildingValues] = useState([
    { value: 1.5, color: '#06b6d4' },
    { value: 0.75, color: '#8b5cf6' },
    { value: 2.25, color: '#ec4899' },
    { value: 0.5, color: '#f59e0b' },
    { value: 1.0, color: '#22c55e' },
    { value: 0.33, color: '#ef4444' },
  ]);

  const handleBuildingClick = (index: number) => {
    setBuildingValues(prev => {
      const newValues = [...prev];
      newValues[index] = {
        ...newValues[index],
        value: Math.min(3, newValues[index].value + 0.1)
      };
      return newValues;
    });
    setInteractionCount(prev => prev + 1);
  };

  // Auto-trigger question every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentQuestion && usedQuestions.length < decimalQuestions.length) {
        const available = decimalQuestions.filter((_, i) => !usedQuestions.includes(i));
        if (available.length > 0) {
          const randomIdx = Math.floor(Math.random() * available.length);
          const originalIdx = decimalQuestions.indexOf(available[randomIdx]);
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
      const available = decimalQuestions.filter((_, i) => !usedQuestions.includes(i));
      if (available.length > 0) {
        const randomIdx = Math.floor(Math.random() * available.length);
        const originalIdx = decimalQuestions.indexOf(available[randomIdx]);
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

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 15, 5]} intensity={0.4} color="#c4b5fd" />
      <pointLight position={[0, 8, 0]} intensity={0.5} color="#06b6d4" />
      <pointLight position={[-5, 3, 5]} intensity={0.4} color="#ec4899" />
      <pointLight position={[5, 3, -5]} intensity={0.4} color="#8b5cf6" />
      <fog attach="fog" args={['#0f172a', 5, 25]} />

      <Html fullscreen>
        <QuizPanel 
          currentQuestion={currentQuestion}
          onAnswer={handleAnswer}
          score={score}
          totalQuestions={questionsAnswered}
          emoji="🏙️"
          title="Decimal Quiz"
        />
      </Html>

      {/* City ground - neon grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[20, 20, 40, 40]} />
        <meshStandardMaterial 
          color="#0f172a"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#020617" />
      </mesh>

      {/* Neon road lines */}
      {[-3, 0, 3].map((z, i) => (
        <mesh key={i} position={[0, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 0.1]} />
          <meshStandardMaterial 
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Buildings */}
      <DecimalBuilding 
        value={buildingValues[0].value} 
        position={[-4, 0, -2]} 
        color={buildingValues[0].color}
        onClick={() => handleBuildingClick(0)}
      />
      <DecimalBuilding 
        value={buildingValues[1].value} 
        position={[-2, 0, 1]} 
        color={buildingValues[1].color}
        onClick={() => handleBuildingClick(1)}
      />
      <DecimalBuilding 
        value={buildingValues[2].value} 
        position={[0, 0, -2]} 
        color={buildingValues[2].color}
        onClick={() => handleBuildingClick(2)}
      />
      <DecimalBuilding 
        value={buildingValues[3].value} 
        position={[2, 0, 1]} 
        color={buildingValues[3].color}
        onClick={() => handleBuildingClick(3)}
      />
      <DecimalBuilding 
        value={buildingValues[4].value} 
        position={[4, 0, -2]} 
        color={buildingValues[4].color}
        onClick={() => handleBuildingClick(4)}
      />
      <DecimalBuilding 
        value={buildingValues[5].value} 
        position={[0, 0, 3]} 
        color={buildingValues[5].color}
        onClick={() => handleBuildingClick(5)}
      />

      {/* Floating drone */}
      <Drone position={[0, 5, 0]} />

      {/* Energy cubes */}
      <EnergyCube position={[-3, 1.5, 0]} value={0.1} color="#f59e0b" />
      <EnergyCube position={[3, 2, 2]} value={0.01} color="#22c55e" />
      <EnergyCube position={[1, 1, -3]} value={0.5} color="#8b5cf6" />
      <EnergyCube position={[-1, 2.5, 2]} value={1} color="#ec4899" />

      {/* Atmospheric particles */}
      {[...Array(50)].map((_, i) => (
        <Float key={i} speed={0.5 + Math.random()} floatIntensity={0.3}>
          <mesh position={[
            (Math.random() - 0.5) * 15,
            Math.random() * 8,
            (Math.random() - 0.5) * 15
          ]}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshStandardMaterial 
              color={['#06b6d4', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 3)]}
              emissive={['#06b6d4', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 3)]}
              emissiveIntensity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const percentageQuestions: Question[] = [
  { question: "What is 50% of 100?", options: ["25", "50", "75", "100"], correctAnswer: 1 },
  { question: "If a $100 item is 25% off, how much do you save?", options: ["$10", "$25", "$50", "$75"], correctAnswer: 1 },
  { question: "What percentage is 3/4?", options: ["25%", "50%", "75%", "100%"], correctAnswer: 2 },
  { question: "A tank is 40% full. What percentage is empty?", options: ["40%", "50%", "60%", "80%"], correctAnswer: 2 },
  { question: "If you score 8 out of 10, what's your percentage?", options: ["70%", "80%", "85%", "90%"], correctAnswer: 1 },
  { question: "10% of 200 is?", options: ["10", "20", "50", "100"], correctAnswer: 1 },
  { question: "If price increases by 50%, a $20 item becomes?", options: ["$25", "$30", "$35", "$40"], correctAnswer: 1 },
  { question: "What's bigger: 1/3 or 30%?", options: ["1/3 (≈33%)", "30%", "They're equal", "Cannot compare"], correctAnswer: 0 },
  { question: "25% of 80 equals?", options: ["15", "20", "25", "40"], correctAnswer: 1 },
  { question: "A shirt costs $40, now 20% off. Final price?", options: ["$20", "$28", "$32", "$36"], correctAnswer: 2 },
  { question: "If 30 out of 50 students passed, what percentage passed?", options: ["30%", "50%", "60%", "70%"], correctAnswer: 2 },
  { question: "What is 100% of any number?", options: ["0", "Half of it", "The number itself", "Double it"], correctAnswer: 2 },
  { question: "15% tip on a $60 meal is?", options: ["$6", "$9", "$12", "$15"], correctAnswer: 1 },
  { question: "A price dropped from $50 to $40. What % decrease?", options: ["10%", "15%", "20%", "25%"], correctAnswer: 2 },
  { question: "What percentage is 1/5?", options: ["15%", "20%", "25%", "50%"], correctAnswer: 1 }
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
        <span className="text-sm font-medium text-primary">🏆 Percentage Quiz</span>
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

// Water tank showing percentage fill
function WaterTank({ 
  percentage, 
  position, 
  onClick,
  label
}: {
  percentage: number;
  position: [number, number, number];
  onClick: () => void;
  label: string;
}) {
  const waterRef = useRef<THREE.Mesh>(null);
  const height = 2;
  const waterHeight = height * (percentage / 100);
  
  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.position.y = -height / 2 + waterHeight / 2 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      {/* Glass container */}
      <mesh>
        <boxGeometry args={[1, height, 0.8]} />
        <meshStandardMaterial 
          color="#67e8f9"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Water */}
      <mesh ref={waterRef} position={[0, -height / 2 + waterHeight / 2, 0]}>
        <boxGeometry args={[0.95, waterHeight, 0.75]} />
        <meshStandardMaterial 
          color="#0ea5e9"
          emissive="#0ea5e9"
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Percentage marks */}
      {[25, 50, 75, 100].map((mark) => (
        <mesh key={mark} position={[0.55, -height / 2 + (mark / 100) * height, 0]}>
          <boxGeometry args={[0.1, 0.02, 0.02]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      ))}
      
      {/* Frame */}
      <mesh position={[0, height / 2 + 0.05, 0]}>
        <boxGeometry args={[1.1, 0.1, 0.9]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>
      <mesh position={[0, -height / 2 - 0.05, 0]}>
        <boxGeometry args={[1.1, 0.1, 0.9]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>
    </group>
  );
}

// Price tag with discount
function DiscountTag({ 
  originalPrice, 
  discount, 
  position,
  onClick 
}: {
  originalPrice: number;
  discount: number;
  position: [number, number, number];
  onClick: () => void;
}) {
  const finalPrice = originalPrice * (1 - discount / 100);
  const tagRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (tagRef.current) {
      tagRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <Float speed={2} floatIntensity={0.3}>
      <group ref={tagRef} position={position} onClick={onClick}>
        {/* Tag body */}
        <mesh>
          <boxGeometry args={[1.2, 0.8, 0.1]} />
          <meshStandardMaterial 
            color="#fef3c7"
            emissive="#fef3c7"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Discount badge */}
        <mesh position={[0.4, 0.3, 0.06]}>
          <circleGeometry args={[0.25, 16]} />
          <meshStandardMaterial 
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* String hole */}
        <mesh position={[-0.45, 0.3, 0]}>
          <torusGeometry args={[0.08, 0.02, 8, 16]} />
          <meshStandardMaterial color="#d97706" />
        </mesh>
      </group>
    </Float>
  );
}

// Sports performance meter
function PerformanceMeter({ 
  percentage, 
  position, 
  color,
  onClick 
}: {
  percentage: number;
  position: [number, number, number];
  color: string;
  onClick: () => void;
}) {
  const meterRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meterRef.current) {
      meterRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={meterRef} position={position} onClick={onClick}>
      {/* Meter background */}
      <mesh>
        <boxGeometry args={[0.3, 3, 0.15]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      {/* Meter fill */}
      <mesh position={[0, -1.5 + (percentage / 100) * 1.5, 0.08]}>
        <boxGeometry args={[0.25, (percentage / 100) * 3, 0.05]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>
      
      {/* Top glow */}
      <mesh position={[0, -1.5 + (percentage / 100) * 3, 0.1]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
}

// Pie chart showing percentage
function PieChart({ 
  percentage, 
  position, 
  color,
  onClick 
}: {
  percentage: number;
  position: [number, number, number];
  color: string;
  onClick: () => void;
}) {
  const pieRef = useRef<THREE.Group>(null);
  const angle = (percentage / 100) * Math.PI * 2;
  
  useFrame((state) => {
    if (pieRef.current) {
      pieRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  const filledShape = new THREE.Shape();
  filledShape.moveTo(0, 0);
  filledShape.arc(0, 0, 1, 0, angle, false);
  filledShape.lineTo(0, 0);

  const emptyShape = new THREE.Shape();
  emptyShape.moveTo(0, 0);
  emptyShape.arc(0, 0, 1, angle, Math.PI * 2, false);
  emptyShape.lineTo(0, 0);

  return (
    <group ref={pieRef} position={position} onClick={onClick}>
      {/* Filled portion */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[filledShape, { depth: 0.2, bevelEnabled: false }]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Empty portion */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[emptyShape, { depth: 0.2, bevelEnabled: false }]} />
        <meshStandardMaterial 
          color="#334155"
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

export function PercentageQuestArena() {
  const [waterLevel, setWaterLevel] = useState(60);
  const [discount, setDiscount] = useState(25);
  const [performance, setPerformance] = useState(75);
  const [pieValue, setPieValue] = useState(40);
  const [interactionCount, setInteractionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);

  const handleInteraction = (setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(prev => (prev + 10) % 110);
    setInteractionCount(prev => prev + 1);
  };

  // Auto-trigger question every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentQuestion && usedQuestions.length < percentageQuestions.length) {
        const available = percentageQuestions.filter((_, i) => !usedQuestions.includes(i));
        if (available.length > 0) {
          const randomIdx = Math.floor(Math.random() * available.length);
          const originalIdx = percentageQuestions.indexOf(available[randomIdx]);
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
      const available = percentageQuestions.filter((_, i) => !usedQuestions.includes(i));
      if (available.length > 0) {
        const randomIdx = Math.floor(Math.random() * available.length);
        const originalIdx = percentageQuestions.indexOf(available[randomIdx]);
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
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.7} />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#f59e0b" />
      <pointLight position={[5, 3, -5]} intensity={0.5} color="#8b5cf6" />
      <fog attach="fog" args={['#1e293b', 8, 25]} />

      <Html fullscreen>
        <QuizPanel 
          currentQuestion={currentQuestion}
          onAnswer={handleAnswer}
          score={score}
          totalQuestions={questionsAnswered}
        />
      </Html>

      {/* Arena floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <circleGeometry args={[10, 64]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      
      {/* Arena rings */}
      {[3, 5, 7, 9].map((radius, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
          <ringGeometry args={[radius - 0.05, radius, 64]} />
          <meshStandardMaterial 
            color={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'][i]}
            emissive={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'][i]}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* Water tanks section */}
      <group position={[-4, 1, 0]}>
        <WaterTank 
          percentage={waterLevel}
          position={[0, 0, 0]}
          onClick={() => handleInteraction(setWaterLevel)}
          label="Tank A"
        />
        <WaterTank 
          percentage={75}
          position={[1.5, 0, 0]}
          onClick={() => handleInteraction(setWaterLevel)}
          label="Tank B"
        />
        <WaterTank 
          percentage={25}
          position={[3, 0, 0]}
          onClick={() => handleInteraction(setWaterLevel)}
          label="Tank C"
        />
      </group>

      {/* Shopping discount area */}
      <group position={[0, 2, -3]}>
        <DiscountTag 
          originalPrice={100}
          discount={discount}
          position={[-2, 0, 0]}
          onClick={() => handleInteraction(setDiscount)}
        />
        <DiscountTag 
          originalPrice={50}
          discount={30}
          position={[0, 0, 0]}
          onClick={() => handleInteraction(setDiscount)}
        />
        <DiscountTag 
          originalPrice={200}
          discount={50}
          position={[2, 0, 0]}
          onClick={() => handleInteraction(setDiscount)}
        />
      </group>

      {/* Performance meters (sports) */}
      <group position={[4, 1, 0]}>
        <PerformanceMeter 
          percentage={performance}
          position={[0, 0, 0]}
          color="#22c55e"
          onClick={() => handleInteraction(setPerformance)}
        />
        <PerformanceMeter 
          percentage={85}
          position={[0.8, 0, 0]}
          color="#f59e0b"
          onClick={() => handleInteraction(setPerformance)}
        />
        <PerformanceMeter 
          percentage={60}
          position={[1.6, 0, 0]}
          color="#ef4444"
          onClick={() => handleInteraction(setPerformance)}
        />
      </group>

      {/* Pie charts */}
      <group position={[0, 0.5, 2]}>
        <PieChart 
          percentage={pieValue}
          position={[-2, 0, 0]}
          color="#8b5cf6"
          onClick={() => handleInteraction(setPieValue)}
        />
        <PieChart 
          percentage={65}
          position={[0, 0, 0]}
          color="#ec4899"
          onClick={() => handleInteraction(setPieValue)}
        />
        <PieChart 
          percentage={90}
          position={[2, 0, 0]}
          color="#06b6d4"
          onClick={() => handleInteraction(setPieValue)}
        />
      </group>

      {/* Floating percentage symbols */}
      {[...Array(15)].map((_, i) => (
        <Float key={i} speed={1 + Math.random()} floatIntensity={0.5}>
          <mesh position={[
            (Math.random() - 0.5) * 12,
            Math.random() * 5 + 1,
            (Math.random() - 0.5) * 12
          ]}>
            <torusGeometry args={[0.15, 0.04, 8, 16]} />
            <meshStandardMaterial 
              color={['#f59e0b', '#8b5cf6', '#22c55e', '#ec4899'][Math.floor(Math.random() * 4)]}
              emissive={['#f59e0b', '#8b5cf6', '#22c55e', '#ec4899'][Math.floor(Math.random() * 4)]}
              emissiveIntensity={0.6}
            />
          </mesh>
        </Float>
      ))}

      {/* Arena pillars */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(angle) * 8, 0, Math.sin(angle) * 8]}>
            <mesh position={[0, 2, 0]}>
              <cylinderGeometry args={[0.2, 0.3, 4, 8]} />
              <meshStandardMaterial 
                color="#475569"
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            <pointLight 
              position={[0, 4, 0]} 
              intensity={0.3} 
              color={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'][i % 4]}
              distance={5}
            />
          </group>
        );
      })}
    </>
  );
}

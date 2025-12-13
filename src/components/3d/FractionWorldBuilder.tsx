import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const fractionQuestions: Question[] = [
  { question: "If a pizza is cut into 8 equal slices and you eat 2, what fraction did you eat?", options: ["1/4", "2/8", "1/2", "Both 1/4 and 2/8"], correctAnswer: 3 },
  { question: "Which fraction is equivalent to 1/2?", options: ["2/3", "3/6", "1/3", "4/6"], correctAnswer: 1 },
  { question: "If you have 3/4 of a pie, how much more do you need to have a whole pie?", options: ["1/2", "1/3", "1/4", "2/4"], correctAnswer: 2 },
  { question: "Which is bigger: 1/3 or 1/4?", options: ["1/3", "1/4", "They're equal", "Cannot compare"], correctAnswer: 0 },
  { question: "What do you get when you combine 1/4 + 1/4?", options: ["2/8", "1/2", "1/4", "2/4"], correctAnswer: 1 },
  { question: "A shape divided into 6 equal parts with 2 shaded represents?", options: ["2/6 or 1/3", "2/3", "1/2", "4/6"], correctAnswer: 0 },
  { question: "If you split 1/2 into two equal parts, each part is?", options: ["1/3", "1/4", "1/2", "2/4"], correctAnswer: 1 },
  { question: "3/3 equals how much of a whole?", options: ["Half", "One third", "One whole", "Three wholes"], correctAnswer: 2 },
  { question: "What is 1/4 + 2/4?", options: ["3/8", "3/4", "1/2", "2/4"], correctAnswer: 1 },
  { question: "Which fraction is smallest: 1/2, 1/3, or 1/4?", options: ["1/2", "1/3", "1/4", "All equal"], correctAnswer: 2 },
  { question: "5/8 of a pizza is eaten. What fraction remains?", options: ["3/8", "2/8", "5/8", "1/8"], correctAnswer: 0 },
  { question: "How many sixths equal one half?", options: ["2/6", "3/6", "4/6", "1/6"], correctAnswer: 1 },
  { question: "What is 2/5 + 2/5?", options: ["4/10", "4/5", "2/5", "1/5"], correctAnswer: 1 },
  { question: "Which is larger: 2/3 or 3/4?", options: ["2/3", "3/4", "They're equal", "Cannot tell"], correctAnswer: 1 },
  { question: "A bar is divided into 10 parts, 7 are shaded. What fraction is unshaded?", options: ["7/10", "3/10", "3/7", "7/3"], correctAnswer: 1 }
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
        <span className="text-sm font-medium text-primary">🍕 Fraction Quiz</span>
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

// Circular pizza/pie slice component
function PizzaSlice({ 
  sliceIndex, 
  totalSlices, 
  isHighlighted,
  onClick,
  color 
}: { 
  sliceIndex: number; 
  totalSlices: number; 
  isHighlighted: boolean;
  onClick: () => void;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angle = (2 * Math.PI) / totalSlices;
  const startAngle = sliceIndex * angle;
  
  useFrame((state) => {
    if (meshRef.current && isHighlighted) {
      meshRef.current.position.y = 0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.arc(0, 0, 1.2, startAngle, startAngle + angle - 0.02, false);
  shape.lineTo(0, 0);

  return (
    <Float speed={isHighlighted ? 3 : 1} floatIntensity={isHighlighted ? 0.3 : 0.1}>
      <mesh 
        ref={meshRef}
        onClick={onClick}
        position={[0, isHighlighted ? 0.3 : 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <extrudeGeometry args={[shape, { depth: 0.15, bevelEnabled: false }]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={isHighlighted ? 0.4 : 0.1}
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>
    </Float>
  );
}

// Fraction bar component
function FractionBar({ 
  parts, 
  filledParts,
  position,
  color
}: {
  parts: number;
  filledParts: number;
  position: [number, number, number];
  color: string;
}) {
  const partWidth = 2 / parts;
  
  return (
    <group position={position}>
      {Array.from({ length: parts }).map((_, i) => (
        <Float key={i} speed={1.5} floatIntensity={0.1}>
          <mesh position={[(i - parts / 2 + 0.5) * partWidth, 0, 0]}>
            <boxGeometry args={[partWidth - 0.05, 0.3, 0.4]} />
            <meshStandardMaterial 
              color={i < filledParts ? color : '#4b5563'}
              emissive={i < filledParts ? color : '#1f2937'}
              emissiveIntensity={i < filledParts ? 0.3 : 0.05}
              transparent
              opacity={i < filledParts ? 1 : 0.4}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Liquid container showing fractions
function LiquidTank({ 
  fillLevel, 
  position,
  color 
}: {
  fillLevel: number; // 0 to 1
  position: [number, number, number];
  color: string;
}) {
  const height = 2;
  const liquidHeight = height * fillLevel;
  
  return (
    <group position={position}>
      {/* Glass container */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, height, 32, 1, true]} />
        <meshStandardMaterial 
          color="#67e8f9"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Liquid */}
      <mesh position={[0, -height / 2 + liquidHeight / 2, 0]}>
        <cylinderGeometry args={[0.48, 0.48, liquidHeight, 32]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Bottom cap */}
      <mesh position={[0, -height / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}

export function FractionWorldBuilder() {
  const groupRef = useRef<THREE.Group>(null);
  const [pizzaSlices] = useState(8);
  const [selectedSlices, setSelectedSlices] = useState<number[]>([0, 1]);
  const [barParts] = useState(4);
  const [filledBar] = useState(3);
  const [liquidLevel, setLiquidLevel] = useState(0.5);
  const [interactionCount, setInteractionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate liquid level
    setLiquidLevel(0.5 + Math.sin(time * 0.5) * 0.3);
    
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.1;
    }
  });

  const toggleSlice = (index: number) => {
    setSelectedSlices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
    setInteractionCount(prev => prev + 1);
  };

  // Auto-trigger question every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentQuestion && usedQuestions.length < fractionQuestions.length) {
        const available = fractionQuestions.filter((_, i) => !usedQuestions.includes(i));
        if (available.length > 0) {
          const randomIdx = Math.floor(Math.random() * available.length);
          const originalIdx = fractionQuestions.indexOf(available[randomIdx]);
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
      const available = fractionQuestions.filter((_, i) => !usedQuestions.includes(i));
      if (available.length > 0) {
        const randomIdx = Math.floor(Math.random() * available.length);
        const originalIdx = fractionQuestions.indexOf(available[randomIdx]);
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

  const pizzaColors = ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'];

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} color="#fef3c7" />
      <pointLight position={[-3, 3, 3]} intensity={0.6} color="#f59e0b" />
      <pointLight position={[3, -2, 2]} intensity={0.5} color="#22c55e" />
      <fog attach="fog" args={['#1e293b', 8, 25]} />

      <Html fullscreen>
        <QuizPanel 
          currentQuestion={currentQuestion}
          onAnswer={handleAnswer}
          score={score}
          totalQuestions={questionsAnswered}
        />
      </Html>

      <group ref={groupRef}>
        {/* Floating island base */}
        <mesh position={[0, -2, 0]}>
          <cylinderGeometry args={[5, 4, 1, 32]} />
          <meshStandardMaterial color="#22c55e" roughness={0.8} />
        </mesh>
        <mesh position={[0, -2.6, 0]}>
          <cylinderGeometry args={[4, 3, 0.5, 32]} />
          <meshStandardMaterial color="#713f12" roughness={0.9} />
        </mesh>

        {/* Pizza/Pie (main fraction visual) */}
        <group position={[-2, 0, 0]}>
          {/* Pizza plate */}
          <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.5, 32]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.3} />
          </mesh>
          
          {/* Pizza slices */}
          {Array.from({ length: pizzaSlices }).map((_, i) => (
            <PizzaSlice
              key={i}
              sliceIndex={i}
              totalSlices={pizzaSlices}
              isHighlighted={selectedSlices.includes(i)}
              onClick={() => toggleSlice(i)}
              color={pizzaColors[i % pizzaColors.length]}
            />
          ))}
          
          {/* Center topping */}
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.3} />
          </mesh>
        </group>

        {/* Fraction bar */}
        <FractionBar 
          parts={barParts} 
          filledParts={filledBar}
          position={[2, 0, 0]}
          color="#8b5cf6"
        />

        {/* Second fraction bar for equivalence */}
        <FractionBar 
          parts={8} 
          filledParts={6}
          position={[2, -0.6, 0]}
          color="#8b5cf6"
        />

        {/* Liquid tanks showing fractions */}
        <LiquidTank 
          fillLevel={liquidLevel}
          position={[0, 0.5, 2]}
          color="#3b82f6"
        />
        
        <LiquidTank 
          fillLevel={0.25}
          position={[1.5, 0.5, 2]}
          color="#10b981"
        />
        
        <LiquidTank 
          fillLevel={0.75}
          position={[-1.5, 0.5, 2]}
          color="#f59e0b"
        />

        {/* Floating fraction cubes */}
        {[
          { pos: [-3, 1.5, -1], fraction: '1/2', color: '#ec4899' },
          { pos: [3, 2, -1], fraction: '3/4', color: '#8b5cf6' },
          { pos: [0, 2.5, -2], fraction: '2/3', color: '#06b6d4' },
        ].map((item, i) => (
          <Float key={i} speed={2} floatIntensity={0.4}>
            <mesh position={item.pos as [number, number, number]}>
              <boxGeometry args={[0.6, 0.6, 0.6]} />
              <meshStandardMaterial 
                color={item.color}
                emissive={item.color}
                emissiveIntensity={0.4}
                metalness={0.7}
                roughness={0.2}
              />
            </mesh>
          </Float>
        ))}

        {/* Decorative particles */}
        {[...Array(20)].map((_, i) => (
          <Float key={i} speed={1 + Math.random()} floatIntensity={0.5}>
            <mesh position={[
              (Math.random() - 0.5) * 10,
              Math.random() * 4,
              (Math.random() - 0.5) * 8
            ]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial 
                color="#fcd34d"
                emissive="#fcd34d"
                emissiveIntensity={0.8}
              />
            </mesh>
          </Float>
        ))}
      </group>
    </>
  );
}

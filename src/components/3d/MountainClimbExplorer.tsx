import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const trigQuestions: Question[] = [
  {
    question: "In a right triangle, sin(θ) equals which ratio?",
    options: ["Opposite / Hypotenuse", "Adjacent / Hypotenuse", "Opposite / Adjacent", "Hypotenuse / Opposite"],
    correctAnswer: 0
  },
  {
    question: "If the angle increases, what happens to the height (opposite side)?",
    options: ["It decreases", "It increases", "Stays the same", "Becomes negative"],
    correctAnswer: 1
  },
  {
    question: "What is cos(θ) in a right triangle?",
    options: ["Opposite / Hypotenuse", "Adjacent / Hypotenuse", "Opposite / Adjacent", "Adjacent / Opposite"],
    correctAnswer: 1
  },
  {
    question: "The hypotenuse is always the...",
    options: ["Shortest side", "Longest side", "Vertical side", "Horizontal side"],
    correctAnswer: 1
  },
  {
    question: "tan(θ) = sin(θ) / cos(θ). What's another way to express tan(θ)?",
    options: ["Adjacent / Opposite", "Hypotenuse / Adjacent", "Opposite / Adjacent", "Opposite / Hypotenuse"],
    correctAnswer: 2
  },
  {
    question: "At 45°, what is the relationship between sin and cos?",
    options: ["sin > cos", "sin < cos", "sin = cos", "sin × cos = 1"],
    correctAnswer: 2
  },
  {
    question: "As the angle approaches 90°, what happens to tan(θ)?",
    options: ["Approaches 0", "Approaches 1", "Approaches infinity", "Becomes negative"],
    correctAnswer: 2
  }
];

function QuizPanel({ 
  currentQuestion, 
  onAnswer, 
  score, 
  totalQuestions 
}: { 
  currentQuestion: Question | null;
  onAnswer: (index: number) => void;
  score: number;
  totalQuestions: number;
}) {
  if (!currentQuestion) return null;

  return (
    <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm p-4 rounded-xl shadow-lg max-w-sm border border-border">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-primary">Trigonometry Quiz</span>
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

export function MountainClimbExplorer() {
  const triangleRef = useRef<THREE.Group>(null);
  const [angle, setAngle] = useState(45);
  const ropeRef = useRef<THREE.Mesh>(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);
  
  // Calculate triangle dimensions based on angle
  const baseLength = 3;
  const height = baseLength * Math.tan((angle * Math.PI) / 180);
  const hypotenuse = Math.sqrt(baseLength * baseLength + height * height);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Gentle floating animation
    if (triangleRef.current) {
      triangleRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;
    }
    
    // Animate angle over time for visual learning
    const newAngle = 30 + Math.sin(time * 0.3) * 25;
    setAngle(newAngle);
  });

  // Trigger question every few seconds of viewing
  useEffect(() => {
    const interval = setInterval(() => {
      setInteractionCount(prev => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (interactionCount > 0 && interactionCount % 2 === 0 && !currentQuestion) {
      const availableQuestions = trigQuestions.filter((_, i) => !usedQuestions.includes(i));
      if (availableQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const originalIndex = trigQuestions.indexOf(availableQuestions[randomIndex]);
        setCurrentQuestion(availableQuestions[randomIndex]);
        setUsedQuestions(prev => [...prev, originalIndex]);
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

  // Create mountain terrain
  const mountainShape = new THREE.Shape();
  mountainShape.moveTo(-5, -2);
  mountainShape.lineTo(-3, -2);
  mountainShape.lineTo(-1, 1);
  mountainShape.lineTo(1, -0.5);
  mountainShape.lineTo(3, 2);
  mountainShape.lineTo(5, -2);
  mountainShape.lineTo(-5, -2);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#fcd34d" />
      <pointLight position={[0, 5, 0]} intensity={0.6} color="#10b981" />
      <fog attach="fog" args={['#1a1a2e', 5, 20]} />
      
      {/* Quiz Panel */}
      <Html fullscreen>
        <QuizPanel 
          currentQuestion={currentQuestion}
          onAnswer={handleAnswer}
          score={score}
          totalQuestions={questionsAnswered}
        />
      </Html>
      
      {/* Mountain backdrop */}
      <mesh position={[-2, -1, -5]}>
        <coneGeometry args={[2, 4, 4]} />
        <meshStandardMaterial color="#4b5563" roughness={0.9} />
      </mesh>
      <mesh position={[2, -0.5, -4]}>
        <coneGeometry args={[1.5, 5, 4]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, -6]}>
        <coneGeometry args={[2.5, 6, 4]} />
        <meshStandardMaterial color="#6b7280" roughness={0.9} />
      </mesh>
      
      {/* Interactive Triangle Group */}
      <group ref={triangleRef} position={[0, -1, 0]}>
        {/* Base (adjacent) - Glows with cos */}
        <mesh position={[baseLength / 2, 0, 0]}>
          <boxGeometry args={[baseLength, 0.08, 0.08]} />
          <meshStandardMaterial 
            color="#3b82f6" 
            emissive="#3b82f6" 
            emissiveIntensity={0.3 + Math.cos((angle * Math.PI) / 180) * 0.5}
          />
        </mesh>
        
        {/* Height (opposite) - Glows with sin */}
        <mesh position={[baseLength, height / 2, 0]}>
          <boxGeometry args={[0.08, height, 0.08]} />
          <meshStandardMaterial 
            color="#10b981" 
            emissive="#10b981" 
            emissiveIntensity={0.3 + Math.sin((angle * Math.PI) / 180) * 0.5}
          />
        </mesh>
        
        {/* Hypotenuse (climbing rope) */}
        <Float speed={1} rotationIntensity={0} floatIntensity={0.1}>
          <mesh 
            ref={ropeRef}
            position={[baseLength / 2, height / 2, 0]}
            rotation={[0, 0, Math.atan2(height, baseLength)]}
          >
            <boxGeometry args={[hypotenuse, 0.1, 0.1]} />
            <meshStandardMaterial 
              color="#f59e0b" 
              emissive="#f59e0b" 
              emissiveIntensity={0.6}
              metalness={0.3}
            />
          </mesh>
        </Float>
        
        {/* Angle arc indicator */}
        <mesh position={[0.5, 0.1, 0]} rotation={[0, 0, (angle * Math.PI) / 360]}>
          <torusGeometry args={[0.4, 0.02, 8, 32, (angle * Math.PI) / 180]} />
          <meshStandardMaterial 
            color="#8b5cf6" 
            emissive="#8b5cf6" 
            emissiveIntensity={0.8}
          />
        </mesh>
        
        {/* Vertex points */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[baseLength, 0, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[baseLength, height, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
      </group>
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1f2937" transparent opacity={0.5} />
      </mesh>
      
      {/* Floating particles for atmosphere */}
      {[...Array(20)].map((_, i) => (
        <Float key={i} speed={0.5 + Math.random()} floatIntensity={0.5}>
          <mesh position={[
            (Math.random() - 0.5) * 10,
            Math.random() * 5 - 1,
            (Math.random() - 0.5) * 10 - 3
          ]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff" 
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

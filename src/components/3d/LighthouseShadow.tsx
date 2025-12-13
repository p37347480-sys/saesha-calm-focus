import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const shadowQuestions: Question[] = [
  { question: "As the sun gets higher, what happens to the shadow length?", options: ["Gets longer", "Gets shorter", "Stays same", "Disappears completely"], correctAnswer: 1 },
  { question: "If you know the height and shadow length, you can find the sun's angle using?", options: ["sin", "cos", "tan", "cot"], correctAnswer: 2 },
  { question: "At noon (sun directly overhead), what is the shadow length?", options: ["Maximum", "Minimum (nearly zero)", "Equal to height", "Double the height"], correctAnswer: 1 },
  { question: "tan(angle) = height / shadow. If angle = 45°, then height equals?", options: ["Shadow × 2", "Shadow", "Shadow / 2", "Shadow²"], correctAnswer: 1 },
  { question: "The angle of elevation is measured from?", options: ["Top of object", "The sun", "The horizontal ground", "Vertical line"], correctAnswer: 2 },
  { question: "If shadow = height, what is the angle of elevation?", options: ["30°", "45°", "60°", "90°"], correctAnswer: 1 },
  { question: "Shadow length = height / tan(angle). If angle is very small, shadow is?", options: ["Very short", "Very long", "Equal to height", "Zero"], correctAnswer: 1 },
  { question: "At sunset, the sun is low. What happens to shadows?", options: ["Shortest", "Longest", "Disappear", "Same as noon"], correctAnswer: 1 },
  { question: "A 10m pole casts a 10m shadow. What's the angle of elevation?", options: ["30°", "45°", "60°", "90°"], correctAnswer: 1 },
  { question: "tan(60°) ≈ 1.73. If shadow = 5m, height is approximately?", options: ["2.9m", "5m", "8.65m", "10m"], correctAnswer: 2 },
  { question: "The angle of depression is measured from?", options: ["Ground up", "Horizontal down", "Vertical line", "The shadow"], correctAnswer: 1 },
  { question: "If height = 20m and shadow = 20m, the sun's angle is?", options: ["30°", "45°", "60°", "90°"], correctAnswer: 1 },
  { question: "cot(angle) is the same as?", options: ["1/sin", "1/cos", "1/tan", "tan²"], correctAnswer: 2 },
  { question: "Shadow gets longer when angle is?", options: ["Increasing", "Decreasing", "Constant", "90°"], correctAnswer: 1 },
  { question: "A 5m tree casts a shadow of 2.5m. What's tan of the angle?", options: ["0.5", "1", "2", "2.5"], correctAnswer: 2 }
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
        <span className="text-sm font-medium text-primary">Shadow & Angles Quiz</span>
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

export function LighthouseShadow() {
  const sunRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const triangleGroupRef = useRef<THREE.Group>(null);
  const [sunAngle, setSunAngle] = useState(45);
  const [interactionCount, setInteractionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);
  
  const lighthouseHeight = 3;
  const shadowLength = lighthouseHeight / Math.tan((sunAngle * Math.PI) / 180);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate sun position across the sky
    const newAngle = 20 + (Math.sin(time * 0.2) + 1) * 35; // 20 to 90 degrees
    setSunAngle(newAngle);
    
    // Update sun position
    if (sunRef.current) {
      const radius = 6;
      sunRef.current.position.x = -Math.cos((sunAngle * Math.PI) / 180) * radius;
      sunRef.current.position.y = Math.sin((sunAngle * Math.PI) / 180) * radius;
    }
  });

  // Trigger question periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setInteractionCount(prev => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (interactionCount > 0 && interactionCount % 2 === 0 && !currentQuestion) {
      const availableQuestions = shadowQuestions.filter((_, i) => !usedQuestions.includes(i));
      if (availableQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const originalIndex = shadowQuestions.indexOf(availableQuestions[randomIndex]);
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

  // Create ocean waves geometry
  const wavePoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 50; i++) {
    const x = (i / 50) * 10 - 5;
    wavePoints.push(new THREE.Vector3(x, 0, 0));
  }

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 8, 0]} intensity={0.4} color="#fef3c7" />
      
      {/* Quiz Panel */}
      <Html fullscreen>
        <QuizPanel 
          currentQuestion={currentQuestion}
          onAnswer={handleAnswer}
          score={score}
          totalQuestions={questionsAnswered}
        />
      </Html>
      
      {/* Dynamic sun light */}
      <directionalLight 
        position={[
          -Math.cos((sunAngle * Math.PI) / 180) * 6,
          Math.sin((sunAngle * Math.PI) / 180) * 6,
          0
        ]} 
        intensity={1.2} 
        color="#fcd34d"
        castShadow
      />
      
      {/* Sky gradient background */}
      <mesh position={[0, 3, -8]}>
        <planeGeometry args={[20, 12]} />
        <meshBasicMaterial color="#1e3a5f" />
      </mesh>
      
      {/* Sun */}
      <Float speed={0.5} floatIntensity={0.2}>
        <mesh ref={sunRef} position={[-4, 4, -2]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial 
            color="#fcd34d" 
            emissive="#fcd34d" 
            emissiveIntensity={2}
          />
        </mesh>
      </Float>
      
      {/* Sun rays */}
      {[...Array(8)].map((_, i) => (
        <mesh 
          key={i}
          position={[
            -Math.cos((sunAngle * Math.PI) / 180) * 6,
            Math.sin((sunAngle * Math.PI) / 180) * 6,
            -2
          ]}
          rotation={[0, 0, (i * Math.PI) / 4]}
        >
          <boxGeometry args={[1.5, 0.05, 0.01]} />
          <meshStandardMaterial 
            color="#fcd34d" 
            emissive="#fcd34d" 
            emissiveIntensity={1}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
      
      {/* Lighthouse */}
      <group position={[0, -1, 0]}>
        {/* Main tower */}
        <mesh position={[0, lighthouseHeight / 2, 0]}>
          <cylinderGeometry args={[0.25, 0.35, lighthouseHeight, 16]} />
          <meshStandardMaterial color="#f5f5f4" roughness={0.3} />
        </mesh>
        
        {/* Red stripes */}
        {[0.5, 1.5, 2.5].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <cylinderGeometry args={[0.27, 0.32 - i * 0.02, 0.3, 16]} />
            <meshStandardMaterial color="#ef4444" roughness={0.4} />
          </mesh>
        ))}
        
        {/* Lighthouse top */}
        <mesh position={[0, lighthouseHeight + 0.3, 0]}>
          <cylinderGeometry args={[0.35, 0.3, 0.6, 16]} />
          <meshStandardMaterial color="#1f2937" metalness={0.5} />
        </mesh>
        
        {/* Light beacon */}
        <mesh position={[0, lighthouseHeight + 0.3, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial 
            color="#fef08a" 
            emissive="#fef08a" 
            emissiveIntensity={1.5}
          />
        </mesh>
      </group>
      
      {/* Dynamic shadow */}
      <group ref={triangleGroupRef} position={[0, -1, 0]}>
        <mesh 
          ref={shadowRef}
          position={[shadowLength / 2, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[shadowLength, 0.8]} />
          <meshStandardMaterial 
            color="#1f2937" 
            transparent 
            opacity={0.6}
          />
        </mesh>
        
        {/* Glowing triangle overlay */}
        {/* Height line */}
        <mesh position={[0, lighthouseHeight / 2, 0.1]}>
          <boxGeometry args={[0.05, lighthouseHeight, 0.05]} />
          <meshStandardMaterial 
            color="#10b981" 
            emissive="#10b981" 
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Shadow line */}
        <mesh position={[shadowLength / 2, 0.05, 0.1]}>
          <boxGeometry args={[shadowLength, 0.05, 0.05]} />
          <meshStandardMaterial 
            color="#3b82f6" 
            emissive="#3b82f6" 
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Sun ray line (hypotenuse) */}
        <mesh 
          position={[shadowLength / 2, lighthouseHeight / 2, 0.1]}
          rotation={[0, 0, Math.atan2(lighthouseHeight, shadowLength)]}
        >
          <boxGeometry args={[Math.sqrt(shadowLength * shadowLength + lighthouseHeight * lighthouseHeight), 0.05, 0.05]} />
          <meshStandardMaterial 
            color="#f59e0b" 
            emissive="#f59e0b" 
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>
      
      {/* Ocean */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 2]}>
        <planeGeometry args={[15, 8]} />
        <meshStandardMaterial 
          color="#0ea5e9" 
          transparent 
          opacity={0.7}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
      
      {/* Coastal ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -2]}>
        <planeGeometry args={[15, 6]} />
        <meshStandardMaterial color="#a3a3a3" roughness={0.9} />
      </mesh>
      
      {/* Ocean wave particles */}
      {[...Array(15)].map((_, i) => (
        <Float key={i} speed={1 + Math.random()} floatIntensity={0.3}>
          <mesh position={[
            (Math.random() - 0.5) * 12,
            -1.4,
            2 + Math.random() * 3
          ]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              color="#ffffff" 
              transparent
              opacity={0.4}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

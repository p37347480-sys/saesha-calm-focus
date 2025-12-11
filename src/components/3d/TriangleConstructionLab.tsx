import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const triangleQuestions: Question[] = [
  {
    question: "What is the sum of all angles in a triangle?",
    options: ["90°", "180°", "270°", "360°"],
    correctAnswer: 1
  },
  {
    question: "In a right triangle, which angle is always 90°?",
    options: ["The smallest angle", "The right angle", "The largest angle", "All angles"],
    correctAnswer: 1
  },
  {
    question: "The longest side of a right triangle is called?",
    options: ["Base", "Height", "Hypotenuse", "Adjacent"],
    correctAnswer: 2
  },
  {
    question: "If two sides of a triangle are equal, it's called?",
    options: ["Equilateral", "Isosceles", "Scalene", "Right"],
    correctAnswer: 1
  },
  {
    question: "The Pythagorean theorem states that a² + b² = ?",
    options: ["c", "c²", "2c", "c/2"],
    correctAnswer: 1
  },
  {
    question: "What type of triangle has all sides different?",
    options: ["Equilateral", "Isosceles", "Scalene", "Right"],
    correctAnswer: 2
  },
  {
    question: "An angle greater than 90° is called?",
    options: ["Acute", "Right", "Obtuse", "Reflex"],
    correctAnswer: 2
  },
  {
    question: "The side opposite to an angle in a triangle is used to calculate?",
    options: ["Only area", "Sine of that angle", "Perimeter", "Nothing specific"],
    correctAnswer: 1
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
        <span className="text-sm font-medium text-primary">Triangle Quiz</span>
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

export function TriangleConstructionLab() {
  const groupRef = useRef<THREE.Group>(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);
  
  // Animated vertices
  const [vertices, setVertices] = useState({
    a: { x: -2, y: -1, z: 0 },
    b: { x: 2, y: -1, z: 0 },
    c: { x: 0, y: 2, z: 0 }
  });
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate vertices to show triangle morphing
    setVertices({
      a: { 
        x: -2 + Math.sin(time * 0.3) * 0.5, 
        y: -1 + Math.cos(time * 0.4) * 0.3, 
        z: Math.sin(time * 0.2) * 0.3 
      },
      b: { 
        x: 2 + Math.cos(time * 0.35) * 0.5, 
        y: -1 + Math.sin(time * 0.45) * 0.3, 
        z: Math.cos(time * 0.25) * 0.3 
      },
      c: { 
        x: Math.sin(time * 0.25) * 0.8, 
        y: 2 + Math.cos(time * 0.3) * 0.4, 
        z: Math.sin(time * 0.35) * 0.3 
      }
    });
    
    // Rotate the whole scene slowly
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.3;
    }
  });

  // Trigger question periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setInteractionCount(prev => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (interactionCount > 0 && !currentQuestion) {
      const availableQuestions = triangleQuestions.filter((_, i) => !usedQuestions.includes(i));
      if (availableQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const originalIndex = triangleQuestions.indexOf(availableQuestions[randomIndex]);
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
  
  // Calculate side lengths
  const sideAB = Math.sqrt(
    Math.pow(vertices.b.x - vertices.a.x, 2) + 
    Math.pow(vertices.b.y - vertices.a.y, 2) +
    Math.pow(vertices.b.z - vertices.a.z, 2)
  );
  const sideBC = Math.sqrt(
    Math.pow(vertices.c.x - vertices.b.x, 2) + 
    Math.pow(vertices.c.y - vertices.b.y, 2) +
    Math.pow(vertices.c.z - vertices.b.z, 2)
  );
  const sideCA = Math.sqrt(
    Math.pow(vertices.a.x - vertices.c.x, 2) + 
    Math.pow(vertices.a.y - vertices.c.y, 2) +
    Math.pow(vertices.a.z - vertices.c.z, 2)
  );
  
  // Find longest side (potential hypotenuse)
  const maxSide = Math.max(sideAB, sideBC, sideCA);
  
  // Calculate angles using law of cosines
  const angleA = Math.acos((sideAB * sideAB + sideCA * sideCA - sideBC * sideBC) / (2 * sideAB * sideCA));
  const angleB = Math.acos((sideAB * sideAB + sideBC * sideBC - sideCA * sideCA) / (2 * sideAB * sideBC));
  const angleC = Math.PI - angleA - angleB;
  
  // Create edge helpers
  const createEdge = (start: typeof vertices.a, end: typeof vertices.a, color: string, isLongest: boolean) => {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const midZ = (start.z + end.z) / 2;
    const length = Math.sqrt(
      Math.pow(end.x - start.x, 2) + 
      Math.pow(end.y - start.y, 2) +
      Math.pow(end.z - start.z, 2)
    );
    
    // Calculate rotation to align with edge
    const direction = new THREE.Vector3(end.x - start.x, end.y - start.y, end.z - start.z).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction);
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    
    return {
      position: [midX, midY, midZ] as [number, number, number],
      rotation: [euler.x, euler.y, euler.z] as [number, number, number],
      length,
      color,
      intensity: isLongest ? 1 : 0.5
    };
  };
  
  const edgeAB = createEdge(vertices.a, vertices.b, '#3b82f6', sideAB === maxSide);
  const edgeBC = createEdge(vertices.b, vertices.c, '#10b981', sideBC === maxSide);
  const edgeCA = createEdge(vertices.c, vertices.a, '#f59e0b', sideCA === maxSide);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-3, 3, 3]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[3, -2, 2]} intensity={0.4} color="#06b6d4" />
      
      {/* Quiz Panel */}
      <Html fullscreen>
        <QuizPanel 
          currentQuestion={currentQuestion}
          onAnswer={handleAnswer}
          score={score}
          totalQuestions={questionsAnswered}
        />
      </Html>
      
      {/* Grid background */}
      <gridHelper args={[10, 20, '#334155', '#1e293b']} position={[0, -2, 0]} />
      
      <group ref={groupRef}>
        {/* Triangle face with transparency */}
        <mesh>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={3}
              array={new Float32Array([
                vertices.a.x, vertices.a.y, vertices.a.z,
                vertices.b.x, vertices.b.y, vertices.b.z,
                vertices.c.x, vertices.c.y, vertices.c.z,
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <meshStandardMaterial 
            color="#8b5cf6" 
            transparent 
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Edges */}
        <mesh position={edgeAB.position} rotation={edgeAB.rotation}>
          <boxGeometry args={[edgeAB.length, 0.08, 0.08]} />
          <meshStandardMaterial 
            color={edgeAB.color} 
            emissive={edgeAB.color} 
            emissiveIntensity={edgeAB.intensity}
          />
        </mesh>
        
        <mesh position={edgeBC.position} rotation={edgeBC.rotation}>
          <boxGeometry args={[edgeBC.length, 0.08, 0.08]} />
          <meshStandardMaterial 
            color={edgeBC.color} 
            emissive={edgeBC.color} 
            emissiveIntensity={edgeBC.intensity}
          />
        </mesh>
        
        <mesh position={edgeCA.position} rotation={edgeCA.rotation}>
          <boxGeometry args={[edgeCA.length, 0.08, 0.08]} />
          <meshStandardMaterial 
            color={edgeCA.color} 
            emissive={edgeCA.color} 
            emissiveIntensity={edgeCA.intensity}
          />
        </mesh>
        
        {/* Vertices with glow based on angle size */}
        <Float speed={2} floatIntensity={0.2}>
          <mesh position={[vertices.a.x, vertices.a.y, vertices.a.z]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial 
              color="#ef4444" 
              emissive="#ef4444" 
              emissiveIntensity={0.3 + angleA / Math.PI}
            />
          </mesh>
        </Float>
        
        <Float speed={2} floatIntensity={0.2}>
          <mesh position={[vertices.b.x, vertices.b.y, vertices.b.z]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial 
              color="#22c55e" 
              emissive="#22c55e" 
              emissiveIntensity={0.3 + angleB / Math.PI}
            />
          </mesh>
        </Float>
        
        <Float speed={2} floatIntensity={0.2}>
          <mesh position={[vertices.c.x, vertices.c.y, vertices.c.z]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial 
              color="#a855f7" 
              emissive="#a855f7" 
              emissiveIntensity={0.3 + angleC / Math.PI}
            />
          </mesh>
        </Float>
        
        {/* Angle arcs at vertices */}
        <mesh position={[vertices.a.x + 0.3, vertices.a.y + 0.1, vertices.a.z]}>
          <torusGeometry args={[0.25, 0.02, 8, 16, angleA]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
        
        <mesh position={[vertices.b.x - 0.3, vertices.b.y + 0.1, vertices.b.z]}>
          <torusGeometry args={[0.25, 0.02, 8, 16, angleB]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
        </mesh>
        
        <mesh position={[vertices.c.x, vertices.c.y - 0.3, vertices.c.z]}>
          <torusGeometry args={[0.25, 0.02, 8, 16, angleC]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
        </mesh>
      </group>
      
      {/* Ambient particles */}
      {[...Array(30)].map((_, i) => (
        <Float key={i} speed={0.3 + Math.random() * 0.5} floatIntensity={0.3}>
          <mesh position={[
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6 - 2
          ]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#8b5cf6" 
              emissiveIntensity={0.3}
              transparent
              opacity={0.5}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

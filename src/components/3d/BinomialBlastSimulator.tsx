import { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Trial {
  id: number;
  success: boolean;
  position: [number, number, number];
  velocity: [number, number, number];
  landed: boolean;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function QuizPanel({ position, question, onAnswer, score, total }: {
  position: [number, number, number];
  question: Question | null;
  onAnswer: (correct: boolean) => void;
  score: number;
  total: number;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (index: number) => {
    if (showResult || !question) return;
    setSelectedAnswer(index);
    setShowResult(true);
    const isCorrect = index === question.correctIndex;
    setTimeout(() => {
      onAnswer(isCorrect);
      setSelectedAnswer(null);
      setShowResult(false);
    }, 2000);
  };

  if (!question) return null;

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[4, 3, 0.1]} />
        <meshStandardMaterial color="#1e293b" transparent opacity={0.9} />
      </mesh>

      <Text position={[0, 1.1, 0.1]} fontSize={0.15} color="#fbbf24" anchorX="center" maxWidth={3.5}>
        Question {total}
      </Text>

      <Text position={[0, 0.7, 0.1]} fontSize={0.12} color="white" anchorX="center" maxWidth={3.5}>
        {question.question}
      </Text>

      {question.options.map((opt, i) => {
        const isSelected = selectedAnswer === i;
        const isCorrect = i === question.correctIndex;
        const bgColor = showResult 
          ? (isCorrect ? '#22c55e' : isSelected ? '#ef4444' : '#374151')
          : '#374151';
        
        return (
          <group key={i} position={[-0.8 + (i % 2) * 1.6, 0.1 - Math.floor(i / 2) * 0.5, 0.1]}>
            <mesh onClick={() => handleAnswer(i)}>
              <boxGeometry args={[1.4, 0.35, 0.05]} />
              <meshStandardMaterial color={bgColor} />
            </mesh>
            <Text position={[0, 0, 0.05]} fontSize={0.1} color="white" anchorX="center" maxWidth={1.3}>
              {opt}
            </Text>
          </group>
        );
      })}

      {showResult && (
        <Text position={[0, -0.9, 0.1]} fontSize={0.1} color={selectedAnswer === question.correctIndex ? '#22c55e' : '#ef4444'} anchorX="center" maxWidth={3.5}>
          {selectedAnswer === question.correctIndex ? 'Correct!' : question.explanation}
        </Text>
      )}

      <Text position={[1.5, 1.1, 0.1]} fontSize={0.12} color="#22c55e" anchorX="center">
        Score: {score}/{total - 1}
      </Text>
    </group>
  );
}

function CoinFlipper({ position, onTrialComplete }: { 
  position: [number, number, number];
  onTrialComplete: (success: boolean) => void;
}) {
  const coinRef = useRef<THREE.Mesh>(null);
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const flipSpeedRef = useRef(0);
  const rotationRef = useRef(0);

  const flipCoin = () => {
    if (flipping) return;
    setFlipping(true);
    setResult(null);
    flipSpeedRef.current = 0.8 + Math.random() * 0.4;
    rotationRef.current = 0;
  };

  useFrame(() => {
    if (coinRef.current && flipping) {
      rotationRef.current += flipSpeedRef.current;
      coinRef.current.rotation.x = rotationRef.current;
      coinRef.current.position.y = Math.sin(rotationRef.current * 0.5) * 0.5 + 0.5;
      
      flipSpeedRef.current *= 0.98;
      
      if (flipSpeedRef.current < 0.01) {
        setFlipping(false);
        const isHeads = Math.random() > 0.5;
        setResult(isHeads ? 'heads' : 'tails');
        coinRef.current.rotation.x = isHeads ? 0 : Math.PI;
        coinRef.current.position.y = 0;
        onTrialComplete(isHeads);
      }
    }
  });

  return (
    <group position={position}>
      <mesh 
        ref={coinRef} 
        onClick={flipCoin}
        rotation={[0, 0, 0]}
      >
        <cylinderGeometry args={[0.4, 0.4, 0.05, 32]} />
        <meshStandardMaterial 
          color={result === 'heads' ? '#fbbf24' : result === 'tails' ? '#94a3b8' : '#fbbf24'}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <Text
        position={[0, -1, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
      >
        {flipping ? 'Flipping...' : result ? result.toUpperCase() : 'Tap to flip!'}
      </Text>

      <Text
        position={[0, 1.2, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        Coin Flipper
      </Text>
    </group>
  );
}

function DistributionDisplay({ position, trials }: { 
  position: [number, number, number];
  trials: { success: boolean }[];
}) {
  const successCount = trials.filter(t => t.success).length;
  const totalTrials = trials.length;
  const successRate = totalTrials > 0 ? successCount / totalTrials : 0;

  // Create distribution bars for different success counts in groups of 10
  const groupSize = 10;
  const groups = Math.ceil(totalTrials / groupSize);
  const distribution: number[] = [];
  
  for (let i = 0; i < Math.min(groups, 10); i++) {
    const groupTrials = trials.slice(i * groupSize, (i + 1) * groupSize);
    const groupSuccesses = groupTrials.filter(t => t.success).length;
    distribution.push(groupSuccesses);
  }

  return (
    <group position={position}>
      {/* Distribution bars */}
      {distribution.map((count, i) => (
        <mesh key={i} position={[(i - distribution.length / 2) * 0.5, count * 0.2 - 1, 0]}>
          <boxGeometry args={[0.4, count * 0.4 + 0.1, 0.3]} />
          <meshStandardMaterial 
            color={`hsl(${120 * (count / groupSize)}, 70%, 50%)`}
            emissive={`hsl(${120 * (count / groupSize)}, 70%, 30%)`}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* Stats display */}
      <Text position={[0, 2.5, 0]} fontSize={0.25} color="white" anchorX="center">
        Distribution
      </Text>
      <Text position={[0, 2, 0]} fontSize={0.15} color="#22c55e" anchorX="center">
        Successes: {successCount} / {totalTrials}
      </Text>
      <Text position={[0, 1.7, 0]} fontSize={0.15} color="#3b82f6" anchorX="center">
        Rate: {(successRate * 100).toFixed(1)}%
      </Text>
    </group>
  );
}

function BallLauncher({ position, onTrialComplete }: {
  position: [number, number, number];
  onTrialComplete: (success: boolean) => void;
}) {
  const [balls, setBalls] = useState<Trial[]>([]);
  const nextIdRef = useRef(0);

  const launchBall = () => {
    const success = Math.random() > 0.5;
    const newBall: Trial = {
      id: nextIdRef.current++,
      success,
      position: [0, 0, 0],
      velocity: [
        (Math.random() - 0.5) * 0.1,
        0.15 + Math.random() * 0.05,
        (Math.random() - 0.5) * 0.05
      ],
      landed: false,
    };
    setBalls(prev => [...prev.slice(-20), newBall]);
    
    setTimeout(() => {
      onTrialComplete(success);
    }, 1000);
  };

  const launchMany = (count: number) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => launchBall(), i * 100);
    }
  };

  useFrame(() => {
    setBalls(prev => prev.map(ball => {
      if (ball.landed) return ball;
      
      const newPos: [number, number, number] = [
        ball.position[0] + ball.velocity[0],
        ball.position[1] + ball.velocity[1],
        ball.position[2] + ball.velocity[2],
      ];
      
      const newVel: [number, number, number] = [
        ball.velocity[0],
        ball.velocity[1] - 0.008,
        ball.velocity[2],
      ];

      const landed = newPos[1] < -1.5;
      
      return {
        ...ball,
        position: landed ? [newPos[0], -1.5, newPos[2]] : newPos,
        velocity: newVel,
        landed,
      };
    }));
  });

  return (
    <group position={position}>
      {/* Launcher base */}
      <mesh onClick={launchBall}>
        <cylinderGeometry args={[0.3, 0.4, 0.5, 16]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>

      {/* Launched balls */}
      {balls.map(ball => (
        <mesh key={ball.id} position={ball.position}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial 
            color={ball.success ? '#22c55e' : '#ef4444'}
            emissive={ball.success ? '#22c55e' : '#ef4444'}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Target zones */}
      <mesh position={[-0.8, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial color="#22c55e" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.8, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial color="#ef4444" transparent opacity={0.5} />
      </mesh>

      <Text position={[0, 1, 0]} fontSize={0.2} color="white" anchorX="center">
        Ball Launcher
      </Text>

      {/* Multi-launch buttons */}
      <group position={[0, -2.5, 0]}>
        <mesh position={[-1, 0, 0]} onClick={() => launchMany(10)}>
          <boxGeometry args={[0.6, 0.3, 0.2]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        <Text position={[-1, 0, 0.15]} fontSize={0.1} color="white" anchorX="center">
          ×10
        </Text>
        
        <mesh position={[0, 0, 0]} onClick={() => launchMany(50)}>
          <boxGeometry args={[0.6, 0.3, 0.2]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        <Text position={[0, 0, 0.15]} fontSize={0.1} color="white" anchorX="center">
          ×50
        </Text>

        <mesh position={[1, 0, 0]} onClick={() => launchMany(100)}>
          <boxGeometry args={[0.6, 0.3, 0.2]} />
          <meshStandardMaterial color="#ec4899" />
        </mesh>
        <Text position={[1, 0, 0.15]} fontSize={0.1} color="white" anchorX="center">
          ×100
        </Text>
      </group>
    </group>
  );
}

const binomialQuestions: Question[] = [
  { id: 1, question: "After 10 coin flips with 6 heads, what is the observed success rate?", options: ["40%", "50%", "60%", "70%"], correctIndex: 2, explanation: "6 heads out of 10 = 60%" },
  { id: 2, question: "As you run more trials, what happens to the success rate?", options: ["Gets random", "Stabilizes", "Always increases", "Always decreases"], correctIndex: 1, explanation: "Law of large numbers - rate stabilizes toward true probability" },
  { id: 3, question: "What shape does the distribution form with many trials?", options: ["Flat line", "Bell curve", "Zigzag", "Circle"], correctIndex: 1, explanation: "Binomial distribution forms a bell-shaped curve" },
  { id: 4, question: "If coin is fair, what is the expected heads in 100 flips?", options: ["25", "50", "75", "100"], correctIndex: 1, explanation: "Fair coin = 50% chance, so 50 out of 100 expected" },
  { id: 5, question: "Why do we run many trials in probability experiments?", options: ["More fun", "Better accuracy", "Faster results", "Smaller numbers"], correctIndex: 1, explanation: "More trials give more accurate probability estimates" },
];

export function BinomialBlastSimulator() {
  const [trials, setTrials] = useState<{ success: boolean }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const lastQuizTrialRef = useRef(0);

  const handleTrialComplete = useCallback((success: boolean) => {
    setTrials(prev => {
      const newTrials = [...prev, { success }];
      // Trigger question every 10 trials
      if (newTrials.length >= lastQuizTrialRef.current + 10 && questionCount < binomialQuestions.length) {
        lastQuizTrialRef.current = newTrials.length;
        setCurrentQuestion(binomialQuestions[questionCount]);
        setShowQuiz(true);
      }
      return newTrials;
    });
  }, [questionCount]);

  const handleAnswer = (correct: boolean) => {
    if (correct) setScore(prev => prev + 1);
    setQuestionCount(prev => prev + 1);
    setShowQuiz(false);
    setCurrentQuestion(null);
  };

  const resetTrials = () => {
    setTrials([]);
    lastQuizTrialRef.current = 0;
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <pointLight position={[-3, 2, 0]} intensity={0.6} color="#22c55e" />
      <pointLight position={[3, 2, 0]} intensity={0.6} color="#ef4444" />

      <CoinFlipper position={[-4, 0, -2]} onTrialComplete={handleTrialComplete} />
      <BallLauncher position={[0, 0, -2]} onTrialComplete={handleTrialComplete} />
      <DistributionDisplay position={[4.5, 0, -2]} trials={trials} />

      {showQuiz && (
        <QuizPanel 
          position={[0, 1.5, 2]} 
          question={currentQuestion} 
          onAnswer={handleAnswer}
          score={score}
          total={questionCount + 1}
        />
      )}

      <mesh position={[4.5, -2.5, -2]} onClick={resetTrials}>
        <boxGeometry args={[1, 0.4, 0.2]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <Text position={[4.5, -2.5, -1.85]} fontSize={0.12} color="white" anchorX="center">
        Reset
      </Text>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, -2]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.4} />
      </mesh>

      <Text position={[0, 4, -2]} fontSize={0.4} color="white" anchorX="center" fontWeight="bold">
        Binomial Blast Simulator
      </Text>
      <Text position={[0, 3.5, -2]} fontSize={0.15} color="#94a3b8" anchorX="center">
        Run trials and answer questions! Score: {score}/{questionCount}
      </Text>
    </>
  );
}

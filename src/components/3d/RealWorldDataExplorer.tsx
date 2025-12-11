import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';

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

function BusStop({ position, onBusArrive }: { position: [number, number, number]; onBusArrive?: () => void }) {
  const [busVisible, setBusVisible] = useState(false);
  const [waitTime, setWaitTime] = useState(0);
  const [arrivals, setArrivals] = useState<number[]>([]);
  const busRef = useRef<THREE.Group>(null);
  const busPositionRef = useRef(-8);

  useEffect(() => {
    const scheduleBus = () => {
      const delay = 3000 + Math.random() * 7000;
      setTimeout(() => {
        setBusVisible(true);
        setArrivals(prev => [...prev.slice(-9), waitTime]);
        busPositionRef.current = -8;
        onBusArrive?.();
      }, delay);
    };
    
    if (!busVisible) {
      scheduleBus();
    }
  }, [busVisible, waitTime]);

  useFrame((state, delta) => {
    if (!busVisible) {
      setWaitTime(prev => prev + delta);
    }
    
    if (busRef.current && busVisible) {
      busPositionRef.current += delta * 3;
      busRef.current.position.x = busPositionRef.current;
      
      if (busPositionRef.current > 8) {
        setBusVisible(false);
        setWaitTime(0);
      }
    }
  });

  const avgWait = arrivals.length > 0 
    ? arrivals.reduce((a, b) => a + b, 0) / arrivals.length 
    : 0;

  return (
    <group position={position}>
      {/* Bus stop shelter */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[1.5, 1.6, 0.5]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[2, 0.1, 0.8]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>

      {/* Bus */}
      <group ref={busRef} position={[busPositionRef.current, 0.5, 1]}>
        <mesh>
          <boxGeometry args={[2, 0.8, 0.8]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        <mesh position={[-0.5, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.5, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Road */}
      <mesh position={[0, 0, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 2]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Wait time display */}
      <Text position={[0, 2.3, 0]} fontSize={0.2} color="white" anchorX="center">
        Bus Stop
      </Text>
      <Text position={[0, 2, 0]} fontSize={0.12} color="#94a3b8" anchorX="center">
        Wait: {waitTime.toFixed(1)}s | Avg: {avgWait.toFixed(1)}s
      </Text>
      <Text position={[0, 1.75, 0]} fontSize={0.1} color="#22c55e" anchorX="center">
        Arrivals: {arrivals.length}
      </Text>
    </group>
  );
}

function WeatherDome({ position, onWeatherChange }: { position: [number, number, number]; onWeatherChange?: () => void }) {
  const [weather, setWeather] = useState<'sun' | 'rain' | 'cloud'>('sun');
  const [history, setHistory] = useState<string[]>([]);
  const particlesRef = useRef<THREE.Points>(null);

  const changeWeather = () => {
    const weathers: ('sun' | 'rain' | 'cloud')[] = ['sun', 'rain', 'cloud'];
    const weights = [0.5, 0.3, 0.2];
    const random = Math.random();
    let cumulative = 0;
    let newWeather: 'sun' | 'rain' | 'cloud' = 'sun';
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        newWeather = weathers[i];
        break;
      }
    }
    
    setWeather(newWeather);
    setHistory(prev => [...prev.slice(-19), newWeather]);
    onWeatherChange?.();
  };

  useFrame((state) => {
    if (particlesRef.current && weather === 'rain') {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const sunCount = history.filter(w => w === 'sun').length;
  const rainCount = history.filter(w => w === 'rain').length;
  const cloudCount = history.filter(w => w === 'cloud').length;
  const total = history.length || 1;

  // Rain particles
  const rainPositions = new Float32Array(300);
  for (let i = 0; i < 300; i += 3) {
    rainPositions[i] = (Math.random() - 0.5) * 3;
    rainPositions[i + 1] = Math.random() * 2;
    rainPositions[i + 2] = (Math.random() - 0.5) * 3;
  }

  return (
    <group position={position}>
      {/* Dome */}
      <mesh onClick={changeWeather}>
        <sphereGeometry args={[1.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color={weather === 'sun' ? '#fbbf24' : weather === 'rain' ? '#3b82f6' : '#94a3b8'}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Weather icons */}
      {weather === 'sun' && (
        <Float speed={2} floatIntensity={0.2}>
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
          </mesh>
        </Float>
      )}
      
      {weather === 'rain' && (
        <points ref={particlesRef} position={[0, 0.5, 0]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[rainPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#3b82f6" size={0.05} />
        </points>
      )}

      {weather === 'cloud' && (
        <Float speed={1} floatIntensity={0.3}>
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0.3, 0.9, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[-0.3, 0.85, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        </Float>
      )}

      {/* Stats */}
      <Text position={[0, 2.2, 0]} fontSize={0.2} color="white" anchorX="center">
        Weather Dome
      </Text>
      <Text position={[0, 1.9, 0]} fontSize={0.1} color="#fbbf24" anchorX="center">
        ☀️ {(sunCount / total * 100).toFixed(0)}%
      </Text>
      <Text position={[0, 1.7, 0]} fontSize={0.1} color="#3b82f6" anchorX="center">
        🌧️ {(rainCount / total * 100).toFixed(0)}%
      </Text>
      <Text position={[0, 1.5, 0]} fontSize={0.1} color="#94a3b8" anchorX="center">
        ☁️ {(cloudCount / total * 100).toFixed(0)}%
      </Text>
      <Text position={[0, -0.3, 0]} fontSize={0.1} color="#64748b" anchorX="center">
        Tap to change weather!
      </Text>
    </group>
  );
}

function TrafficLight({ position }: { position: [number, number, number] }) {
  const [light, setLight] = useState<'red' | 'yellow' | 'green'>('green');
  const [timings, setTimings] = useState<{ color: string; duration: number }[]>([]);
  const timeRef = useRef(0);
  const currentDurationRef = useRef(0);

  useFrame((state, delta) => {
    timeRef.current += delta;
    currentDurationRef.current += delta;

    // Random timing for lights (simulating real traffic patterns)
    const greenTime = 4 + Math.random() * 2;
    const yellowTime = 1 + Math.random() * 0.5;
    const redTime = 3 + Math.random() * 2;

    if (light === 'green' && currentDurationRef.current > greenTime) {
      setTimings(prev => [...prev.slice(-9), { color: 'green', duration: currentDurationRef.current }]);
      currentDurationRef.current = 0;
      setLight('yellow');
    } else if (light === 'yellow' && currentDurationRef.current > yellowTime) {
      setTimings(prev => [...prev.slice(-9), { color: 'yellow', duration: currentDurationRef.current }]);
      currentDurationRef.current = 0;
      setLight('red');
    } else if (light === 'red' && currentDurationRef.current > redTime) {
      setTimings(prev => [...prev.slice(-9), { color: 'red', duration: currentDurationRef.current }]);
      currentDurationRef.current = 0;
      setLight('green');
    }
  });

  const avgGreen = timings.filter(t => t.color === 'green').reduce((a, b) => a + b.duration, 0) / 
    (timings.filter(t => t.color === 'green').length || 1);
  const avgRed = timings.filter(t => t.color === 'red').reduce((a, b) => a + b.duration, 0) / 
    (timings.filter(t => t.color === 'red').length || 1);

  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 3, 16]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Light box */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.4, 1, 0.3]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Red light */}
      <mesh position={[0, 2.8, 0.16]}>
        <circleGeometry args={[0.12, 32]} />
        <meshStandardMaterial 
          color="#ef4444" 
          emissive={light === 'red' ? '#ef4444' : '#000000'}
          emissiveIntensity={light === 'red' ? 1 : 0}
        />
      </mesh>

      {/* Yellow light */}
      <mesh position={[0, 2.5, 0.16]}>
        <circleGeometry args={[0.12, 32]} />
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive={light === 'yellow' ? '#fbbf24' : '#000000'}
          emissiveIntensity={light === 'yellow' ? 1 : 0}
        />
      </mesh>

      {/* Green light */}
      <mesh position={[0, 2.2, 0.16]}>
        <circleGeometry args={[0.12, 32]} />
        <meshStandardMaterial 
          color="#22c55e" 
          emissive={light === 'green' ? '#22c55e' : '#000000'}
          emissiveIntensity={light === 'green' ? 1 : 0}
        />
      </mesh>

      {/* Stats */}
      <Text position={[0, 3.5, 0]} fontSize={0.18} color="white" anchorX="center">
        Traffic Light
      </Text>
      <Text position={[0, 3.2, 0]} fontSize={0.1} color="#22c55e" anchorX="center">
        Avg Green: {avgGreen.toFixed(1)}s
      </Text>
      <Text position={[0, 3, 0]} fontSize={0.1} color="#ef4444" anchorX="center">
        Avg Red: {avgRed.toFixed(1)}s
      </Text>
      <Text position={[0, -0.3, 0]} fontSize={0.1} color="#64748b" anchorX="center">
        Watch the pattern!
      </Text>
    </group>
  );
}

function SportsScoreboard({ position, onGamePlay }: { position: [number, number, number]; onGamePlay?: () => void }) {
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [games, setGames] = useState<{ winner: 'A' | 'B' }[]>([]);

  const playGame = () => {
    const teamAWins = Math.random() < 0.55;
    if (teamAWins) {
      setTeamAScore(prev => prev + 1);
      setGames(prev => [...prev.slice(-19), { winner: 'A' }]);
    } else {
      setTeamBScore(prev => prev + 1);
      setGames(prev => [...prev.slice(-19), { winner: 'B' }]);
    }
    onGamePlay?.();
  };

  const playMany = (count: number) => {
    for (let i = 0; i < count; i++) {
      setTimeout(playGame, i * 100);
    }
  };

  const totalGames = games.length || 1;
  const teamAWinRate = games.filter(g => g.winner === 'A').length / totalGames;

  return (
    <group position={position}>
      {/* Scoreboard */}
      <mesh>
        <boxGeometry args={[3, 2, 0.2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Team A */}
      <mesh position={[-0.8, 0.3, 0.11]} onClick={playGame}>
        <boxGeometry args={[1, 0.8, 0.02]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <Text position={[-0.8, 0.5, 0.15]} fontSize={0.15} color="white" anchorX="center">
        Team A
      </Text>
      <Text position={[-0.8, 0.1, 0.15]} fontSize={0.3} color="white" anchorX="center">
        {teamAScore}
      </Text>

      {/* Team B */}
      <mesh position={[0.8, 0.3, 0.11]}>
        <boxGeometry args={[1, 0.8, 0.02]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <Text position={[0.8, 0.5, 0.15]} fontSize={0.15} color="white" anchorX="center">
        Team B
      </Text>
      <Text position={[0.8, 0.1, 0.15]} fontSize={0.3} color="white" anchorX="center">
        {teamBScore}
      </Text>

      {/* Win rate bar */}
      <mesh position={[teamAWinRate * 2 - 1, -0.5, 0.11]}>
        <boxGeometry args={[teamAWinRate * 2, 0.2, 0.02]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[(1 - teamAWinRate) + teamAWinRate * 2 - 1, -0.5, 0.11]}>
        <boxGeometry args={[(1 - teamAWinRate) * 2, 0.2, 0.02]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>

      <Text position={[0, 1.3, 0]} fontSize={0.2} color="white" anchorX="center">
        Sports Arena
      </Text>
      <Text position={[0, -0.85, 0.15]} fontSize={0.1} color="#94a3b8" anchorX="center">
        A: {(teamAWinRate * 100).toFixed(0)}% | B: {((1 - teamAWinRate) * 100).toFixed(0)}%
      </Text>

      {/* Play buttons */}
      <group position={[0, -1.5, 0]}>
        <mesh position={[-0.8, 0, 0]} onClick={() => playMany(10)}>
          <boxGeometry args={[0.6, 0.3, 0.2]} />
          <meshStandardMaterial color="#6366f1" />
        </mesh>
        <Text position={[-0.8, 0, 0.15]} fontSize={0.1} color="white" anchorX="center">
          ×10
        </Text>

        <mesh position={[0, 0, 0]} onClick={() => playMany(50)}>
          <boxGeometry args={[0.6, 0.3, 0.2]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        <Text position={[0, 0, 0.15]} fontSize={0.1} color="white" anchorX="center">
          ×50
        </Text>

        <mesh position={[0.8, 0, 0]} onClick={() => playMany(100)}>
          <boxGeometry args={[0.6, 0.3, 0.2]} />
          <meshStandardMaterial color="#ec4899" />
        </mesh>
        <Text position={[0.8, 0, 0.15]} fontSize={0.1} color="white" anchorX="center">
          ×100
        </Text>
      </group>
    </group>
  );
}

const realWorldQuestions: Question[] = [
  { id: 1, question: "If buses arrive randomly every 3-10 seconds, is next arrival predictable?", options: ["Yes, exactly", "No, random", "Always 5s", "Never arrives"], correctIndex: 1, explanation: "Random intervals mean we cannot predict exact arrival times" },
  { id: 2, question: "If sun appears 50% of days, what does this probability tell us?", options: ["Always sunny", "Long-term pattern", "Tomorrow sunny", "Never rains"], correctIndex: 1, explanation: "Probability describes long-term frequency, not individual events" },
  { id: 3, question: "A team with 55% win rate plays 100 games. About how many wins?", options: ["25", "40", "55", "75"], correctIndex: 2, explanation: "55% of 100 games = about 55 wins expected" },
  { id: 4, question: "Traffic lights have patterns. Is the timing truly random?", options: ["Yes, fully random", "No, programmed", "Changes daily", "No pattern"], correctIndex: 1, explanation: "Traffic lights follow programmed cycles with some variation" },
  { id: 5, question: "Why do we collect data over time to understand probability?", options: ["For fun", "Patterns emerge", "To guess", "No reason"], correctIndex: 1, explanation: "More observations reveal underlying probability patterns" },
];

export function RealWorldDataExplorer() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);

  const triggerQuestion = () => {
    setInteractionCount(prev => {
      const newCount = prev + 1;
      if (newCount % 3 === 0 && questionCount < realWorldQuestions.length) {
        setCurrentQuestion(realWorldQuestions[questionCount]);
        setShowQuiz(true);
      }
      return newCount;
    });
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) setScore(prev => prev + 1);
    setQuestionCount(prev => prev + 1);
    setShowQuiz(false);
    setCurrentQuestion(null);
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <pointLight position={[-4, 2, 0]} intensity={0.6} color="#f59e0b" />
      <pointLight position={[4, 2, 0]} intensity={0.6} color="#3b82f6" />

      <BusStop position={[-5, -1.5, -3]} onBusArrive={triggerQuestion} />
      <WeatherDome position={[-1.5, -1.5, -2]} onWeatherChange={triggerQuestion} />
      <TrafficLight position={[1.5, -1.5, -2]} />
      <SportsScoreboard position={[5, 0, -3]} onGamePlay={triggerQuestion} />

      {showQuiz && (
        <QuizPanel 
          position={[0, 1.5, 2]} 
          question={currentQuestion} 
          onAnswer={handleAnswer}
          score={score}
          total={questionCount + 1}
        />
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, -2]}>
        <planeGeometry args={[25, 15]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3, -2.49, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial color="#166534" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, -2.49, -1]}>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color="#166534" />
      </mesh>

      <Text position={[0, 4, -2]} fontSize={0.4} color="white" anchorX="center" fontWeight="bold">
        Real-World Data Explorer
      </Text>
      <Text position={[0, 3.5, -2]} fontSize={0.15} color="#94a3b8" anchorX="center">
        Explore and learn! Score: {score}/{questionCount}
      </Text>
    </>
  );
}

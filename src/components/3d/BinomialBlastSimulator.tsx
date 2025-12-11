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

export function BinomialBlastSimulator() {
  const [trials, setTrials] = useState<{ success: boolean }[]>([]);

  const handleTrialComplete = useCallback((success: boolean) => {
    setTrials(prev => [...prev, { success }]);
  }, []);

  const resetTrials = () => setTrials([]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <pointLight position={[-3, 2, 0]} intensity={0.6} color="#22c55e" />
      <pointLight position={[3, 2, 0]} intensity={0.6} color="#ef4444" />

      {/* Coin Flipper */}
      <CoinFlipper position={[-4, 0, -2]} onTrialComplete={handleTrialComplete} />

      {/* Ball Launcher */}
      <BallLauncher position={[0, 0, -2]} onTrialComplete={handleTrialComplete} />

      {/* Distribution Display */}
      <DistributionDisplay position={[4.5, 0, -2]} trials={trials} />

      {/* Reset button */}
      <mesh position={[4.5, -2.5, -2]} onClick={resetTrials}>
        <boxGeometry args={[1, 0.4, 0.2]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <Text position={[4.5, -2.5, -1.85]} fontSize={0.12} color="white" anchorX="center">
        Reset
      </Text>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, -2]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.4} />
      </mesh>

      {/* Title */}
      <Text
        position={[0, 4, -2]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        fontWeight="bold"
      >
        Binomial Blast Simulator
      </Text>

      <Text
        position={[0, 3.5, -2]}
        fontSize={0.15}
        color="#94a3b8"
        anchorX="center"
      >
        Run trials and watch the distribution form!
      </Text>
    </>
  );
}

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Ball {
  id: number;
  color: string;
  position: [number, number, number];
  drawn: boolean;
}

interface WheelSegment {
  color: string;
  startAngle: number;
  endAngle: number;
}

function BallTubeMachine({ position }: { position: [number, number, number] }) {
  const [balls, setBalls] = useState<Ball[]>([
    { id: 1, color: '#ef4444', position: [0, 0.8, 0], drawn: false },
    { id: 2, color: '#ef4444', position: [0.2, 0.5, 0], drawn: false },
    { id: 3, color: '#3b82f6', position: [-0.2, 0.2, 0], drawn: false },
    { id: 4, color: '#3b82f6', position: [0, -0.1, 0], drawn: false },
    { id: 5, color: '#22c55e', position: [0.1, -0.4, 0], drawn: false },
  ]);
  const [drawnBall, setDrawnBall] = useState<Ball | null>(null);
  const tubeRef = useRef<THREE.Mesh>(null);
  const leverRef = useRef<THREE.Mesh>(null);
  const [leverPulled, setLeverPulled] = useState(false);

  const remainingBalls = balls.filter(b => !b.drawn);
  const probabilities = ['#ef4444', '#3b82f6', '#22c55e'].map(color => {
    const count = remainingBalls.filter(b => b.color === color).length;
    return { color, probability: remainingBalls.length > 0 ? count / remainingBalls.length : 0 };
  });

  const drawBall = () => {
    if (remainingBalls.length === 0 || leverPulled) return;
    
    setLeverPulled(true);
    const randomIndex = Math.floor(Math.random() * remainingBalls.length);
    const selectedBall = remainingBalls[randomIndex];
    
    setTimeout(() => {
      setBalls(prev => prev.map(b => 
        b.id === selectedBall.id ? { ...b, drawn: true } : b
      ));
      setDrawnBall(selectedBall);
      setLeverPulled(false);
    }, 500);
  };

  const resetBalls = () => {
    setBalls(prev => prev.map(b => ({ ...b, drawn: false })));
    setDrawnBall(null);
  };

  useFrame((state) => {
    if (leverRef.current) {
      const targetRotation = leverPulled ? -0.5 : 0;
      leverRef.current.rotation.x = THREE.MathUtils.lerp(
        leverRef.current.rotation.x,
        targetRotation,
        0.1
      );
    }
  });

  return (
    <group position={position}>
      {/* Tube */}
      <mesh ref={tubeRef}>
        <cylinderGeometry args={[0.6, 0.6, 2, 32, 1, true]} />
        <meshStandardMaterial color="#1e293b" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Balls inside */}
      {balls.filter(b => !b.drawn).map((ball) => (
        <Float key={ball.id} speed={2} floatIntensity={0.1}>
          <mesh position={ball.position}>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshStandardMaterial 
              color={ball.color} 
              emissive={ball.color}
              emissiveIntensity={0.3}
            />
          </mesh>
        </Float>
      ))}

      {/* Drawn ball display */}
      {drawnBall && (
        <Float speed={3} floatIntensity={0.5}>
          <mesh position={[1.2, 0.5, 0]}>
            <sphereGeometry args={[0.25, 32, 32]} />
            <meshStandardMaterial 
              color={drawnBall.color}
              emissive={drawnBall.color}
              emissiveIntensity={0.5}
            />
          </mesh>
        </Float>
      )}

      {/* Lever */}
      <group position={[0.8, -0.5, 0]}>
        <mesh ref={leverRef} onClick={drawBall} onPointerOver={(e) => e.stopPropagation()}>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          <meshStandardMaterial color={leverPulled ? '#22c55e' : '#f59e0b'} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Probability bars */}
      <group position={[-1.5, 0, 0]}>
        {probabilities.map((p, i) => (
          <group key={p.color} position={[0, -0.6 + i * 0.5, 0]}>
            <mesh>
              <boxGeometry args={[0.8 * p.probability + 0.1, 0.3, 0.1]} />
              <meshStandardMaterial 
                color={p.color}
                emissive={p.color}
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Reset button */}
      <mesh position={[0, -1.5, 0]} onClick={resetBalls}>
        <boxGeometry args={[0.8, 0.3, 0.2]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        Ball Machine
      </Text>
    </group>
  );
}

function SpinningWheel({ position }: { position: [number, number, number] }) {
  const wheelRef = useRef<THREE.Group>(null);
  const [spinning, setSpinning] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);

  const segments: WheelSegment[] = [
    { color: '#ef4444', startAngle: 0, endAngle: Math.PI / 2 },
    { color: '#3b82f6', startAngle: Math.PI / 2, endAngle: Math.PI },
    { color: '#22c55e', startAngle: Math.PI, endAngle: (3 * Math.PI) / 2 },
    { color: '#f59e0b', startAngle: (3 * Math.PI) / 2, endAngle: 2 * Math.PI },
  ];

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    setSpinSpeed(0.5 + Math.random() * 0.3);
    setSelectedSegment(null);
  };

  useFrame(() => {
    if (wheelRef.current && spinning) {
      wheelRef.current.rotation.z += spinSpeed;
      setSpinSpeed(prev => prev * 0.995);
      
      if (spinSpeed < 0.001) {
        setSpinning(false);
        setSpinSpeed(0);
        const angle = wheelRef.current.rotation.z % (2 * Math.PI);
        const segmentIndex = Math.floor(((2 * Math.PI - angle) % (2 * Math.PI)) / (Math.PI / 2));
        setSelectedSegment(segmentIndex);
      }
    }
  });

  return (
    <group position={position}>
      <group ref={wheelRef} onClick={spinWheel}>
        {segments.map((seg, i) => (
          <mesh key={i} rotation={[0, 0, seg.startAngle]}>
            <circleGeometry args={[1, 32, 0, Math.PI / 2]} />
            <meshStandardMaterial 
              color={seg.color}
              emissive={selectedSegment === i ? seg.color : '#000000'}
              emissiveIntensity={selectedSegment === i ? 0.5 : 0}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        
        {/* Center */}
        <mesh>
          <circleGeometry args={[0.15, 32]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Pointer */}
      <mesh position={[0, 1.2, 0.1]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.15, 0.3, 3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <Text
        position={[0, 1.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        Spin Wheel
      </Text>

      <Text
        position={[0, -1.5, 0]}
        fontSize={0.15}
        color="#94a3b8"
        anchorX="center"
      >
        {spinning ? 'Spinning...' : 'Tap to spin!'}
      </Text>
    </group>
  );
}

function ConditionalRevealBox({ position }: { position: [number, number, number] }) {
  const [revealed, setRevealed] = useState<number[]>([]);
  const [blocks] = useState([
    { id: 0, color: '#ef4444' },
    { id: 1, color: '#ef4444' },
    { id: 2, color: '#3b82f6' },
    { id: 3, color: '#22c55e' },
  ]);

  const revealNext = () => {
    if (revealed.length >= blocks.length) {
      setRevealed([]);
      return;
    }
    const unrevealed = blocks.filter(b => !revealed.includes(b.id));
    const randomBlock = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    setRevealed(prev => [...prev, randomBlock.id]);
  };

  const hiddenBlocks = blocks.filter(b => !revealed.includes(b.id));
  const redCount = hiddenBlocks.filter(b => b.color === '#ef4444').length;
  const blueCount = hiddenBlocks.filter(b => b.color === '#3b82f6').length;
  const greenCount = hiddenBlocks.filter(b => b.color === '#22c55e').length;
  const total = hiddenBlocks.length;

  return (
    <group position={position}>
      {/* Mystery box */}
      <mesh onClick={revealNext}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#1e293b" transparent opacity={0.4} />
      </mesh>

      {/* Hidden blocks inside */}
      {blocks.map((block, i) => {
        const isRevealed = revealed.includes(block.id);
        const x = (i % 2) * 0.4 - 0.2;
        const y = Math.floor(i / 2) * 0.4 - 0.2;
        
        return (
          <Float key={block.id} speed={2} floatIntensity={isRevealed ? 0.3 : 0.05}>
            <mesh position={[isRevealed ? 2 : x, isRevealed ? y : y, isRevealed ? 0 : 0]}>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshStandardMaterial 
                color={isRevealed ? block.color : '#64748b'}
                emissive={isRevealed ? block.color : '#000000'}
                emissiveIntensity={isRevealed ? 0.4 : 0}
              />
            </mesh>
          </Float>
        );
      })}

      {/* Probability display */}
      <group position={[-1.5, 0, 0]}>
        <Text position={[0, 0.6, 0]} fontSize={0.12} color="#ef4444" anchorX="center">
          Red: {total > 0 ? Math.round((redCount / total) * 100) : 0}%
        </Text>
        <Text position={[0, 0.3, 0]} fontSize={0.12} color="#3b82f6" anchorX="center">
          Blue: {total > 0 ? Math.round((blueCount / total) * 100) : 0}%
        </Text>
        <Text position={[0, 0, 0]} fontSize={0.12} color="#22c55e" anchorX="center">
          Green: {total > 0 ? Math.round((greenCount / total) * 100) : 0}%
        </Text>
      </group>

      <Text
        position={[0, 1.3, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        Mystery Box
      </Text>

      <Text
        position={[0, -1.2, 0]}
        fontSize={0.12}
        color="#94a3b8"
        anchorX="center"
      >
        Tap to reveal!
      </Text>
    </group>
  );
}

export function ProbabilityPlayground() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      <pointLight position={[-3, 2, 0]} intensity={0.6} color="#ef4444" />
      <pointLight position={[3, 2, 0]} intensity={0.6} color="#3b82f6" />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#22c55e" />

      {/* Ball Tube Machine */}
      <BallTubeMachine position={[-4, 0, -2]} />

      {/* Spinning Wheel */}
      <SpinningWheel position={[0, 0, -2]} />

      {/* Conditional Reveal Box */}
      <ConditionalRevealBox position={[4, 0, -2]} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, -2]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.4} />
      </mesh>

      {/* Title */}
      <Text
        position={[0, 3.5, -2]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        fontWeight="bold"
      >
        Probability Playground
      </Text>

      <Text
        position={[0, 3, -2]}
        fontSize={0.15}
        color="#94a3b8"
        anchorX="center"
      >
        Interact with machines to see probability in action!
      </Text>
    </>
  );
}

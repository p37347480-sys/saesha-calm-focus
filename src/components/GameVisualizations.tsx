import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { useEffect, useState } from 'react';
import { Sparkles, Droplets, Zap, Wind } from 'lucide-react';

interface GameVisualizationProps {
  gameTitle: string;
  isCorrect?: boolean;
  trigger?: boolean;
}

export function GameVisualization({ gameTitle, isCorrect, trigger }: GameVisualizationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (trigger && isCorrect) {
      // Create particle burst
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setParticles(newParticles);

      setTimeout(() => setParticles([]), 2000);
    }
  }, [trigger, isCorrect]);

  // Game-specific visualizations
  const renderGameSpecificEffect = () => {
    if (!trigger) return null;

    switch (gameTitle) {
      case 'Skyline Surveyor':
        return <BuildingEffect isCorrect={isCorrect} />;
      case 'Wave Lab':
        return <WaveEffect isCorrect={isCorrect} />;
      case 'Mountain Rescue Drone':
        return <DroneEffect isCorrect={isCorrect} />;
      case 'Clock Tower Challenge':
        return <ClockEffect isCorrect={isCorrect} />;
      case 'Break the Lock':
        return <LockEffect isCorrect={isCorrect} />;
      default:
        return <GenericEffect isCorrect={isCorrect} />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Particle effects */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: `${particle.x}%`, 
            y: '50%', 
            scale: 1, 
            opacity: 1 
          }}
          animate={{ 
            y: `${particle.y}%`, 
            scale: 0, 
            opacity: 0 
          }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className={`absolute w-3 h-3 rounded-full ${
            isCorrect ? 'bg-success' : 'bg-primary'
          }`}
        />
      ))}

      {/* Game-specific effects */}
      {renderGameSpecificEffect()}
    </div>
  );
}

function BuildingEffect({ isCorrect }: { isCorrect?: boolean }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: isCorrect ? 1 : 0.5 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-40"
    >
      <svg viewBox="0 0 100 150" className="w-full h-full">
        <motion.rect
          x="20" y="50" width="60" height="100"
          className={isCorrect ? 'fill-success/20' : 'fill-primary/20'}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5 }}
          style={{ transformOrigin: 'bottom' }}
        />
        <motion.polygon
          points="50,10 90,50 10,50"
          className={isCorrect ? 'fill-success/30' : 'fill-primary/30'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        />
      </svg>
    </motion.div>
  );
}

function WaveEffect({ isCorrect }: { isCorrect?: boolean }) {
  const [waveOffset, setWaveOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveOffset(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: isCorrect ? 0.6 : 0.3 }}
    >
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full">
        <motion.path
          d={`M 0,50 Q 250,${30 + Math.sin(waveOffset * 0.1) * 20} 500,50 T 1000,50 L 1000,100 L 0,100 Z`}
          className={isCorrect ? 'fill-success/20' : 'fill-primary/20'}
          animate={{
            d: `M 0,50 Q 250,${30 + Math.sin((waveOffset + 50) * 0.1) * 20} 500,50 T 1000,50 L 1000,100 L 0,100 Z`
          }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </svg>
      {isCorrect && (
        <motion.div
          className="absolute top-2 left-1/2 -translate-x-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <Droplets className="w-6 h-6 text-success" />
        </motion.div>
      )}
    </motion.div>
  );
}

function DroneEffect({ isCorrect }: { isCorrect?: boolean }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isCorrect) {
      setPosition({ x: 100, y: -50 });
    }
  }, [isCorrect]);

  return (
    <motion.div
      className="absolute top-1/2 left-0"
      animate={{ x: position.x, y: position.y }}
      transition={{ duration: 1, ease: 'easeInOut' }}
    >
      <div className={`relative ${isCorrect ? 'text-success' : 'text-primary'}`}>
        <Zap className="w-8 h-8" />
        <motion.div
          className="absolute -top-1 -left-1 w-10 h-10 rounded-full border-2 border-current"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}

function ClockEffect({ isCorrect }: { isCorrect?: boolean }) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isCorrect) {
      setRotation(360);
    }
  }, [isCorrect]);

  return (
    <motion.div className="absolute top-1/4 right-8">
      <svg width="60" height="60" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          className={isCorrect ? 'stroke-success' : 'stroke-primary'}
          strokeWidth="3"
        />
        <motion.line
          x1="50" y1="50" x2="50" y2="20"
          className={isCorrect ? 'stroke-success' : 'stroke-primary'}
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ rotate: rotation }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 50px' }}
        />
      </svg>
    </motion.div>
  );
}

function LockEffect({ isCorrect }: { isCorrect?: boolean }) {
  return (
    <motion.div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ scale: 1 }}
      animate={{ 
        scale: isCorrect ? [1, 1.2, 0] : [1, 1.1, 1],
        rotate: isCorrect ? [0, 10, -10, 0] : 0
      }}
      transition={{ duration: 0.5 }}
    >
      <svg width="80" height="80" viewBox="0 0 100 100">
        <rect
          x="25" y="45" width="50" height="40" rx="5"
          className={isCorrect ? 'fill-success/30' : 'fill-primary/30'}
        />
        <path
          d="M 35,45 L 35,30 Q 35,15 50,15 Q 65,15 65,30 L 65,45"
          fill="none"
          className={isCorrect ? 'stroke-success' : 'stroke-primary'}
          strokeWidth="4"
        />
        {isCorrect && (
          <motion.circle
            cx="50" cy="65" r="8"
            className="fill-success"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
        )}
      </svg>
    </motion.div>
  );
}

function GenericEffect({ isCorrect }: { isCorrect?: boolean }) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: isCorrect ? 1 : 0.5 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      <Sparkles className={`w-12 h-12 ${isCorrect ? 'text-success' : 'text-primary'}`} />
    </motion.div>
  );
}

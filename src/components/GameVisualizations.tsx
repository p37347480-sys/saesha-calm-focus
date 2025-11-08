import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { useEffect, useState } from 'react';
import { Sparkles, Droplets, Zap, Wind, Clock, Lock, Building2, Mountain, Waves } from 'lucide-react';

interface GameVisualizationProps {
  gameTitle: string;
  isCorrect?: boolean;
  trigger?: boolean;
}

interface BackgroundAnimationProps {
  gameTitle: string;
}

// Background animation that's always visible
export function BackgroundAnimation({ gameTitle }: BackgroundAnimationProps) {
  switch (gameTitle) {
    case 'Skyline Surveyor':
      return <SkylineBackground />;
    case 'Wave Lab':
      return <WaveBackground />;
    case 'Mountain Rescue Drone':
      return <MountainBackground />;
    case 'Clock Tower Challenge':
      return <ClockBackground />;
    case 'Break the Lock':
      return <LockBackground />;
    default:
      return <GenericBackground />;
  }
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

// Background animations (always visible)
function SkylineBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around gap-4 px-8">
        {[120, 160, 100, 140, 180, 110].map((height, i) => (
          <motion.div
            key={i}
            className="relative bg-gradient-to-t from-primary/30 to-primary/10 rounded-t-lg"
            style={{ width: '12%', height: `${height}px` }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
          >
            {/* Windows */}
            <div className="absolute inset-2 grid grid-cols-2 gap-1">
              {Array.from({ length: 6 }).map((_, j) => (
                <motion.div
                  key={j}
                  className="bg-accent/40 rounded-sm"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, delay: j * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      <Building2 className="absolute top-8 right-8 w-16 h-16 text-primary/20" />
    </div>
  );
}

function WaveBackground() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
      <svg className="absolute bottom-0 left-0 right-0 h-1/2" preserveAspectRatio="none" viewBox="0 0 1000 400">
        <motion.path
          d={`M0,200 Q250,${150 + Math.sin(offset * 0.02) * 50} 500,200 T1000,200 L1000,400 L0,400 Z`}
          className="fill-primary/20"
        />
        <motion.path
          d={`M0,250 Q250,${200 + Math.sin((offset + 90) * 0.02) * 40} 500,250 T1000,250 L1000,400 L0,400 Z`}
          className="fill-primary/10"
        />
      </svg>
      <Waves className="absolute top-8 left-8 w-16 h-16 text-primary/20" />
    </div>
  );
}

function MountainBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
      <svg className="absolute bottom-0 left-0 right-0 h-2/3" preserveAspectRatio="none" viewBox="0 0 1000 600">
        <motion.polygon
          points="0,600 200,300 400,600"
          className="fill-primary/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.polygon
          points="300,600 500,200 700,600"
          className="fill-primary/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        <motion.polygon
          points="600,600 800,250 1000,600"
          className="fill-primary/15"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        />
      </svg>
      <Mountain className="absolute top-8 right-8 w-16 h-16 text-primary/20" />
    </div>
  );
}

function ClockBackground() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 6) % 360);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 flex items-center justify-center">
      <svg width="300" height="300" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill="none" className="stroke-primary/10" strokeWidth="4" />
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="100"
            y1="20"
            x2="100"
            y2="30"
            className="stroke-primary/20"
            strokeWidth="3"
            transform={`rotate(${i * 30} 100 100)`}
          />
        ))}
        <motion.line
          x1="100"
          y1="100"
          x2="100"
          y2="50"
          className="stroke-primary/30"
          strokeWidth="4"
          strokeLinecap="round"
          animate={{ rotate: rotation }}
          style={{ transformOrigin: '100px 100px' }}
        />
      </svg>
      <Clock className="absolute top-8 right-8 w-16 h-16 text-primary/20" />
    </div>
  );
}

function LockBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg width="200" height="200" viewBox="0 0 100 100">
          <rect x="25" y="45" width="50" height="40" rx="5" className="fill-primary/10" />
          <path
            d="M 35,45 L 35,30 Q 35,15 50,15 Q 65,15 65,30 L 65,45"
            fill="none"
            className="stroke-primary/20"
            strokeWidth="4"
          />
          <circle cx="50" cy="65" r="6" className="fill-primary/30" />
        </svg>
      </motion.div>
      <Lock className="absolute top-8 left-8 w-16 h-16 text-primary/20" />
    </div>
  );
}

function GenericBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <Sparkles className="w-32 h-32 text-primary/20" />
      </motion.div>
    </div>
  );
}

// Feedback effects (triggered on answer)
function BuildingEffect({ isCorrect }: { isCorrect?: boolean }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: isCorrect ? 1 : 0.5 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-64 z-10"
    >
      <svg viewBox="0 0 100 150" className="w-full h-full drop-shadow-2xl">
        <motion.rect
          x="20" y="50" width="60" height="100"
          className={isCorrect ? 'fill-success/40 stroke-success' : 'fill-primary/40 stroke-primary'}
          strokeWidth="2"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5 }}
          style={{ transformOrigin: 'bottom' }}
        />
        <motion.polygon
          points="50,10 90,50 10,50"
          className={isCorrect ? 'fill-success/50' : 'fill-primary/50'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        />
        {/* Windows */}
        {[...Array(8)].map((_, i) => (
          <motion.rect
            key={i}
            x={30 + (i % 2) * 20}
            y={60 + Math.floor(i / 2) * 15}
            width="8"
            height="8"
            className="fill-accent/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 0.5 + i * 0.1, duration: 1, repeat: Infinity }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

function WaveEffect({ isCorrect }: { isCorrect?: boolean }) {
  const [waveOffset, setWaveOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveOffset(prev => (prev + 5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="w-full h-full">
        <motion.path
          d={`M 0,300 Q 250,${250 + Math.sin(waveOffset * 0.05) * 60} 500,300 T 1000,300 L 1000,600 L 0,600 Z`}
          className={isCorrect ? 'fill-success/30 stroke-success' : 'fill-primary/30 stroke-primary'}
          strokeWidth="3"
        />
        <motion.path
          d={`M 0,350 Q 250,${300 + Math.sin((waveOffset + 90) * 0.05) * 50} 500,350 T 1000,350 L 1000,600 L 0,600 Z`}
          className={isCorrect ? 'fill-success/20' : 'fill-primary/20'}
        />
      </svg>
      {isCorrect && (
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2"
          initial={{ scale: 0, y: 0 }}
          animate={{ scale: [1, 1.5, 0], y: [-20, -40, -60] }}
          transition={{ duration: 1.5 }}
        >
          <Droplets className="w-12 h-12 text-success drop-shadow-lg" />
        </motion.div>
      )}
    </motion.div>
  );
}

function DroneEffect({ isCorrect }: { isCorrect?: boolean }) {
  return (
    <motion.div
      className="absolute top-1/4 left-0 z-10"
      initial={{ x: -100, y: 0 }}
      animate={{ 
        x: isCorrect ? window.innerWidth : window.innerWidth * 0.7,
        y: isCorrect ? -100 : 0
      }}
      transition={{ duration: 2, ease: 'easeInOut' }}
    >
      <div className={`relative ${isCorrect ? 'text-success' : 'text-primary'}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
        >
          <Zap className="w-16 h-16 drop-shadow-lg" strokeWidth={2.5} />
        </motion.div>
        <motion.div
          className="absolute -top-2 -left-2 w-20 h-20 rounded-full border-4 border-current"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        {/* Trail */}
        <motion.div
          className="absolute top-1/2 right-full w-32 h-1 bg-gradient-to-l from-current to-transparent"
          animate={{ opacity: [0.8, 0.3, 0.8] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}

function ClockEffect({ isCorrect }: { isCorrect?: boolean }) {
  return (
    <motion.div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <svg width="200" height="200" viewBox="0 0 100 100">
        <motion.circle
          cx="50" cy="50" r="45"
          fill="none"
          className={isCorrect ? 'stroke-success' : 'stroke-primary'}
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        {/* Gears */}
        {[...Array(8)].map((_, i) => (
          <motion.rect
            key={i}
            x="48" y="8" width="4" height="12"
            className={isCorrect ? 'fill-success/60' : 'fill-primary/60'}
            style={{ transformOrigin: '50px 50px' }}
            animate={{ rotate: isCorrect ? 360 + i * 45 : i * 45 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        ))}
        {/* Hour hand */}
        <motion.line
          x1="50" y1="50" x2="50" y2="30"
          className={isCorrect ? 'stroke-success' : 'stroke-primary'}
          strokeWidth="4"
          strokeLinecap="round"
          animate={{ rotate: isCorrect ? 720 : 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 50px' }}
        />
        {/* Minute hand */}
        <motion.line
          x1="50" y1="50" x2="50" y2="20"
          className={isCorrect ? 'stroke-success' : 'stroke-primary'}
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ rotate: isCorrect ? 1080 : 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          style={{ transformOrigin: '50px 50px' }}
        />
        <circle cx="50" cy="50" r="4" className={isCorrect ? 'fill-success' : 'fill-primary'} />
      </svg>
    </motion.div>
  );
}

function LockEffect({ isCorrect }: { isCorrect?: boolean }) {
  return (
    <motion.div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ 
        scale: 1,
        opacity: 1,
        rotate: isCorrect ? [0, -10, 10, -5, 5, 0] : 0
      }}
      transition={{ duration: 0.8 }}
    >
      <svg width="180" height="180" viewBox="0 0 100 100" className="drop-shadow-2xl">
        <motion.rect
          x="25" y="45" width="50" height="40" rx="5"
          className={isCorrect ? 'fill-success/40 stroke-success' : 'fill-primary/40 stroke-primary'}
          strokeWidth="3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.path
          d={isCorrect ? "M 35,45 L 35,35 Q 35,15 20,25" : "M 35,45 L 35,30 Q 35,15 50,15 Q 65,15 65,30 L 65,45"}
          fill="none"
          className={isCorrect ? 'stroke-success' : 'stroke-primary'}
          strokeWidth="5"
          strokeLinecap="round"
          animate={{
            d: isCorrect ? "M 35,45 L 35,35 Q 35,15 20,25" : "M 35,45 L 35,30 Q 35,15 50,15 Q 65,15 65,30 L 65,45"
          }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
        {isCorrect ? (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <circle cx="50" cy="65" r="10" className="fill-success" />
            <motion.line
              x1="50" y1="65" x2="50" y2="75"
              className="stroke-background"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.6 }}
            />
          </motion.g>
        ) : (
          <circle cx="50" cy="65" r="8" className="fill-primary/50" />
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

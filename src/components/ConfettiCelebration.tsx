import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function ConfettiCelebration({ trigger, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; color: string }>>([]);

  useEffect(() => {
    if (trigger) {
      const colors = ['#b4a7d6', '#a8d5ba', '#f5c4a8', '#f5b5c4', '#a8d5f5'];
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setParticles(newParticles);

      setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 2000);
    }
  }, [trigger, onComplete]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: `${particle.x}vw`,
              y: '-10vh',
              rotate: 0,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              y: '110vh',
              rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
              scale: 0.5,
              opacity: 0,
            }}
            transition={{
              duration: 2,
              ease: 'easeIn',
            }}
            className="absolute h-3 w-3 rounded-full"
            style={{
              backgroundColor: particle.color,
              left: 0,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

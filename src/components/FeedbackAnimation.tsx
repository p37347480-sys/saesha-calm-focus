import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FeedbackAnimationProps {
  type: 'correct' | 'incorrect' | 'hint' | 'star';
  show: boolean;
  message?: string;
  onComplete?: () => void;
}

export function FeedbackAnimation({ type, show, message, onComplete }: FeedbackAnimationProps) {
  const [stars, setStars] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    if (show && type === 'correct') {
      // Create star burst
      const newStars = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: (i * 45) - 180,
        delay: i * 0.05,
      }));
      setStars(newStars);

      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, type, onComplete]);

  const icons = {
    correct: CheckCircle2,
    incorrect: XCircle,
    hint: Lightbulb,
    star: Star,
  };

  const Icon = icons[type];

  const colors = {
    correct: {
      bg: 'bg-success/20',
      border: 'border-success',
      text: 'text-success',
      glow: 'shadow-success/50',
    },
    incorrect: {
      bg: 'bg-destructive/20',
      border: 'border-destructive',
      text: 'text-destructive',
      glow: 'shadow-destructive/50',
    },
    hint: {
      bg: 'bg-accent/20',
      border: 'border-accent',
      text: 'text-accent-foreground',
      glow: 'shadow-accent/50',
    },
    star: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500',
      text: 'text-yellow-500',
      glow: 'shadow-yellow-500/50',
    },
  };

  const style = colors[type];

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Main feedback overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none`}
          >
            <motion.div
              className={`${style.bg} ${style.border} border-4 rounded-3xl p-8 shadow-2xl ${style.glow} backdrop-blur-sm`}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: type === 'correct' ? 2 : 0,
              }}
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: type === 'correct' ? 360 : 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <Icon className={`w-24 h-24 ${style.text}`} strokeWidth={3} />
              </motion.div>
              
              {message && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`mt-4 text-2xl font-bold ${style.text} text-center`}
                >
                  {message}
                </motion.p>
              )}
            </motion.div>
          </motion.div>

          {/* Star burst for correct answers */}
          {type === 'correct' && stars.map((star) => (
            <motion.div
              key={star.id}
              initial={{ 
                opacity: 1, 
                scale: 0,
                x: '50vw',
                y: '50vh',
              }}
              animate={{ 
                opacity: 0,
                scale: 1.5,
                x: `calc(50vw + ${star.x}px)`,
                y: `calc(50vh - 200px)`,
              }}
              transition={{ 
                delay: star.delay,
                duration: 1,
                ease: 'easeOut',
              }}
              className="fixed z-50 pointer-events-none"
            >
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            </motion.div>
          ))}

          {/* Ripple effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 ${style.border} z-40 pointer-events-none`}
          />
        </>
      )}
    </AnimatePresence>
  );
}

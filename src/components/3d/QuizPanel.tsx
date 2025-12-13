import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizPanelProps {
  currentQuestion: Question | null;
  onAnswer: (index: number, isCorrect: boolean) => void;
  score: number;
  totalQuestions: number;
  emoji?: string;
  title?: string;
}

// Confetti particle component
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  return (
    <motion.div
      initial={{ 
        opacity: 1, 
        y: 0, 
        x: 0,
        scale: 1,
        rotate: 0
      }}
      animate={{ 
        opacity: 0, 
        y: -100 + Math.random() * 50,
        x: (Math.random() - 0.5) * 200,
        scale: 0,
        rotate: 360 * (Math.random() > 0.5 ? 1 : -1)
      }}
      transition={{ 
        duration: 1.5, 
        delay,
        ease: "easeOut"
      }}
      className="absolute"
      style={{
        width: 8 + Math.random() * 8,
        height: 8 + Math.random() * 8,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        left: '50%',
        top: '50%',
      }}
    />
  );
}

// Celebration animation
function CelebrationEffect() {
  const colors = ['#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ec4899', '#3b82f6'];
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.3
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <ConfettiParticle key={p.id} delay={p.delay} color={p.color} />
      ))}
    </div>
  );
}

export function QuizPanel({ 
  currentQuestion, 
  onAnswer, 
  score, 
  totalQuestions,
  emoji = '📝',
  title = 'Quiz'
}: QuizPanelProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowCelebration(false);
  }, [currentQuestion]);

  if (!currentQuestion) return null;

  const handleAnswerClick = (index: number) => {
    if (showFeedback) return; // Prevent double-clicking

    const correct = index === currentQuestion.correctAnswer;
    setSelectedAnswer(index);
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setShowCelebration(true);
      // Play celebration sound via browser audio
      playCelebrationSound();
    } else {
      playWrongSound();
    }

    // Auto-dismiss after feedback
    setTimeout(() => {
      onAnswer(index, correct);
      setShowFeedback(false);
      setSelectedAnswer(null);
      setShowCelebration(false);
    }, 1500);
  };

  const playCelebrationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Play a happy chord
      const playNote = (freq: number, delay: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.4);
        
        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + 0.5);
      };

      // C major arpeggio
      playNote(523.25, 0);    // C5
      playNote(659.25, 0.1);  // E5
      playNote(783.99, 0.2);  // G5
      playNote(1046.50, 0.3); // C6
    } catch (e) {
      // Audio context not available
    }
  };

  const playWrongSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 200;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Audio context not available
    }
  };

  const getButtonStyle = (index: number) => {
    if (!showFeedback) {
      return 'bg-muted hover:bg-primary/20';
    }
    
    if (index === currentQuestion.correctAnswer) {
      return 'bg-green-500/30 border-green-500 text-green-400';
    }
    
    if (index === selectedAnswer && !isCorrect) {
      return 'bg-red-500/30 border-red-500 text-red-400';
    }
    
    return 'bg-muted/50 opacity-50';
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm p-4 rounded-xl shadow-lg max-w-sm border border-border overflow-hidden"
      >
        {/* Celebration effect */}
        {showCelebration && <CelebrationEffect />}
        
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-primary flex items-center gap-1">
            {emoji} {title}
          </span>
          <span className="text-sm text-muted-foreground">
            Score: <span className="text-primary font-bold">{score}</span>/{totalQuestions}
          </span>
        </div>

        {/* Question */}
        <p className="text-foreground font-medium mb-3">{currentQuestion.question}</p>

        {/* Options */}
        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleAnswerClick(index)}
              disabled={showFeedback}
              whileHover={!showFeedback ? { scale: 1.02 } : {}}
              whileTap={!showFeedback ? { scale: 0.98 } : {}}
              className={`w-full text-left p-2 rounded-lg border border-transparent transition-all text-sm text-foreground flex items-center gap-2 ${getButtonStyle(index)}`}
            >
              {showFeedback && index === currentQuestion.correctAnswer && (
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              )}
              {showFeedback && index === selectedAnswer && !isCorrect && index !== currentQuestion.correctAnswer && (
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
              )}
              <span>{option}</span>
            </motion.button>
          ))}
        </div>

        {/* Feedback message */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-3 p-2 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2 ${
                isCorrect 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {isCorrect ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Excellent! Well done!
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Keep trying! You'll get it!
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

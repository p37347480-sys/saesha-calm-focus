import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Lightbulb, Sparkles } from 'lucide-react';
import { EnhancedButton } from './ui/enhanced-button';
import { Card } from './ui/card';
import { MathText } from './MathText';
import { FloatingShapes } from './3d/FloatingShapes';
import { GameVisualization } from './GameVisualizations';
import { FeedbackAnimation } from './FeedbackAnimation';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  hint?: string;
  topic?: string;
  difficulty?: string | number;
}

interface EnhancedQuestionCardProps {
  question: Question;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  showResult: boolean;
  showHint: boolean;
  onToggleHint: () => void;
  onSubmit: () => void;
  onSkip?: () => void;
  submitting?: boolean;
  gameTitle?: string;
}

export function EnhancedQuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  showResult,
  showHint,
  onToggleHint,
  onSubmit,
  onSkip,
  submitting = false,
  gameTitle,
}: EnhancedQuestionCardProps) {
  const { play } = useSoundEffects();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect'>('correct');

  // Handle answer submission feedback
  useEffect(() => {
    if (showResult && selectedAnswer !== null) {
      const isCorrect = selectedAnswer === question.correctAnswer;
      setFeedbackType(isCorrect ? 'correct' : 'incorrect');
      setShowFeedback(true);
      play(isCorrect ? 'correct' : 'incorrect');

      setTimeout(() => setShowFeedback(false), 2000);
    }
  }, [showResult, selectedAnswer, question.correctAnswer, play]);

  const handleAnswerClick = (index: number) => {
    if (!showResult) {
      play('click');
      onSelectAnswer(index);
    }
  };

  const handleHintClick = () => {
    play('hint');
    onToggleHint();
  };

  const handleSubmitClick = () => {
    play('whoosh');
    onSubmit();
  };

  return (
    <div className="relative">
      {/* Feedback Animation */}
      <FeedbackAnimation
        type={feedbackType}
        show={showFeedback}
        message={feedbackType === 'correct' ? 'Excellent!' : 'Try Again'}
      />

      {/* Game-specific visualization */}
      <GameVisualization
        gameTitle={gameTitle || question.topic || 'General'}
        isCorrect={showResult && selectedAnswer === question.correctAnswer}
        trigger={showResult}
      />

      {/* 3D Background Animation */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl opacity-30">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <FloatingShapes />
          </Suspense>
        </Canvas>
      </div>

      <Card className="relative border-2 border-border/50 bg-gradient-card/95 p-8 shadow-xl backdrop-blur-sm">
        {/* Question Header - High Contrast */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 visual-chunk bg-gradient-hero/10 border-2 border-primary/20"
        >
          {question.topic && (
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-base font-bold text-primary">
                  {question.topic}
                </span>
              </div>
              {question.difficulty && (
                <span className="rounded-full bg-primary/20 px-4 py-1.5 text-sm font-bold text-primary border-2 border-primary/30">
                  Level: {question.difficulty}
                </span>
              )}
            </div>
          )}
          <h2 className="text-2xl md:text-3xl font-bold leading-relaxed text-high-contrast">
            <MathText text={question.question} />
          </h2>
        </motion.div>

        {/* Options - Enhanced Visual Feedback */}
        <div className="mb-8 space-y-4">
          {question.options?.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correctAnswer;
            const showCorrectness = showResult;

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: showResult ? 1 : 1.03, x: showResult ? 0 : 8 }}
                whileTap={{ scale: showResult ? 1 : 0.97 }}
                onClick={() => handleAnswerClick(index)}
                disabled={showResult}
                className={`w-full rounded-2xl border-3 p-6 text-left transition-all duration-200 ${
                  showCorrectness
                    ? isCorrect
                      ? 'border-success bg-success/20 shadow-lg shadow-success/30 scale-105'
                      : isSelected
                        ? 'border-destructive bg-destructive/20 shadow-lg shadow-destructive/30'
                        : 'border-border bg-muted/30 opacity-60'
                    : isSelected
                      ? 'border-primary bg-gradient-calm shadow-xl shadow-primary/30 scale-105'
                      : 'border-border/70 bg-card/50 hover:border-primary/70 hover:bg-muted/50 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-base font-extrabold shadow-md ${
                        showCorrectness
                          ? isCorrect
                            ? 'bg-success text-success-foreground'
                            : isSelected
                              ? 'bg-destructive text-destructive-foreground'
                              : 'bg-muted text-muted-foreground'
                          : isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 text-lg font-semibold leading-relaxed">
                      <MathText text={option} />
                    </span>
                  </div>
                  {showCorrectness && isCorrect && (
                    <CheckCircle className="h-7 w-7 flex-shrink-0 text-success" />
                  )}
                  {showCorrectness && isSelected && !isCorrect && (
                    <XCircle className="h-7 w-7 flex-shrink-0 text-destructive" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Hint - Clear Visual Chunk */}
        {showHint && !showResult && question.hint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 visual-chunk border-2 border-accent bg-accent/10 backdrop-blur-sm"
          >
            <div className="flex gap-4">
              <Lightbulb className="h-7 w-7 flex-shrink-0 text-accent-foreground" />
              <div>
                <h4 className="mb-2 text-lg font-bold text-accent-foreground">💡 Hint</h4>
                <p className="text-base leading-relaxed text-foreground font-medium">
                  <MathText text={question.hint} />
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Explanation - Clear Visual Chunk */}
        {showResult && question.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 visual-chunk border-2 border-primary bg-primary/10 backdrop-blur-sm"
          >
            <h3 className="mb-3 flex items-center gap-2 text-xl font-bold text-foreground">
              <Sparkles className="h-6 w-6 text-primary" />
              ✨ Explanation
            </h3>
            <p className="text-base leading-relaxed text-foreground font-medium">
              <MathText text={question.explanation} />
            </p>
          </motion.div>
        )}

        {/* Actions - Larger Buttons */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {!showResult ? (
            <>
              <div className="flex gap-3">
                {!showHint && question.hint && (
                  <EnhancedButton variant="outline" size="lg" onClick={handleHintClick}>
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Hint
                  </EnhancedButton>
                )}
                {onSkip && (
                  <EnhancedButton variant="ghost" size="lg" onClick={onSkip}>
                    Skip
                  </EnhancedButton>
                )}
              </div>
              <EnhancedButton
                variant="hero"
                size="lg"
                onClick={handleSubmitClick}
                disabled={selectedAnswer === null || submitting}
                className="shadow-xl shadow-primary/40"
              >
                {submitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="mr-2 h-5 w-5 rounded-full border-3 border-white border-t-transparent"
                    />
                    Submitting...
                  </>
                ) : (
                  'Submit Answer'
                )}
              </EnhancedButton>
            </>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

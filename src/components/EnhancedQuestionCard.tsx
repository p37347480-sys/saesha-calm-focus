import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Lightbulb, Sparkles } from 'lucide-react';
import { EnhancedButton } from './ui/enhanced-button';
import { Card } from './ui/card';
import { MathText } from './MathText';
import { FloatingShapes } from './3d/FloatingShapes';

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
}: EnhancedQuestionCardProps) {
  return (
    <div className="relative">
      {/* 3D Background Animation */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl opacity-30">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <FloatingShapes />
          </Suspense>
        </Canvas>
      </div>

      <Card className="relative border-border/50 bg-gradient-card/95 p-8 shadow-lg backdrop-blur-sm">
        {/* Question Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {question.topic && (
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {question.topic}
                </span>
              </div>
              {question.difficulty && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Level: {question.difficulty}
                </span>
              )}
            </div>
          )}
          <h2 className="text-2xl font-bold leading-relaxed text-foreground">
            <MathText text={question.question} />
          </h2>
        </motion.div>

        {/* Options */}
        <div className="mb-6 space-y-3">
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
                whileHover={{ scale: showResult ? 1 : 1.02, x: showResult ? 0 : 5 }}
                whileTap={{ scale: showResult ? 1 : 0.98 }}
                onClick={() => !showResult && onSelectAnswer(index)}
                disabled={showResult}
                className={`w-full rounded-xl border-2 p-5 text-left transition-all ${
                  showCorrectness
                    ? isCorrect
                      ? 'border-success bg-success/20 shadow-md shadow-success/20'
                      : isSelected
                        ? 'border-destructive bg-destructive/20 shadow-md shadow-destructive/20'
                        : 'border-border bg-muted/50'
                    : isSelected
                      ? 'border-primary bg-gradient-calm shadow-md shadow-primary/20'
                      : 'border-border bg-card/50 hover:border-primary/50 hover:bg-muted/50 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
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
                    <span className="flex-1 text-base font-medium">
                      <MathText text={option} />
                    </span>
                  </div>
                  {showCorrectness && isCorrect && (
                    <CheckCircle className="h-6 w-6 flex-shrink-0 text-success" />
                  )}
                  {showCorrectness && isSelected && !isCorrect && (
                    <XCircle className="h-6 w-6 flex-shrink-0 text-destructive" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Hint */}
        {showHint && !showResult && question.hint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 rounded-xl border-2 border-accent/30 bg-accent/10 p-5 backdrop-blur-sm"
          >
            <div className="flex gap-3">
              <Lightbulb className="h-6 w-6 flex-shrink-0 text-accent-foreground" />
              <div>
                <h4 className="mb-1 font-semibold text-accent-foreground">Hint</h4>
                <p className="text-sm leading-relaxed text-foreground">
                  <MathText text={question.hint} />
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Explanation */}
        {showResult && question.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 rounded-xl border-2 border-primary/30 bg-primary/10 p-5 backdrop-blur-sm"
          >
            <h3 className="mb-2 flex items-center gap-2 font-bold text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Explanation
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <MathText text={question.explanation} />
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          {!showResult ? (
            <>
              <div className="flex gap-2">
                {!showHint && question.hint && (
                  <EnhancedButton variant="outline" onClick={onToggleHint}>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Hint
                  </EnhancedButton>
                )}
                {onSkip && (
                  <EnhancedButton variant="ghost" onClick={onSkip}>
                    Skip
                  </EnhancedButton>
                )}
              </div>
              <EnhancedButton
                variant="hero"
                onClick={onSubmit}
                disabled={selectedAnswer === null || submitting}
                className="shadow-lg shadow-primary/30"
              >
                {submitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent"
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

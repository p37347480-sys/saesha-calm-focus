import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { EnhancedButton } from './ui/enhanced-button';
import { Card } from './ui/card';

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

interface QuestionCardProps {
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

export function QuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  showResult,
  showHint,
  onToggleHint,
  onSubmit,
  onSkip,
  submitting = false,
}: QuestionCardProps) {
  return (
    <Card className="border-border/50 bg-gradient-card p-8 shadow-lg">
      {/* Question Header */}
      <div className="mb-6">
        {question.topic && (
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              {question.topic}
            </span>
            {question.difficulty && (
              <span className="text-sm text-muted-foreground">
                Difficulty: {question.difficulty}
              </span>
            )}
          </div>
        )}
        <h2 className="text-2xl font-semibold text-foreground">
          {question.question}
        </h2>
      </div>

      {/* Options */}
      <div className="mb-6 space-y-3">
        {question.options?.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === question.correctAnswer;
          const showCorrectness = showResult;

          return (
            <motion.button
              key={index}
              whileHover={{ scale: showResult ? 1 : 1.02 }}
              whileTap={{ scale: showResult ? 1 : 0.98 }}
              onClick={() => !showResult && onSelectAnswer(index)}
              disabled={showResult}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                showCorrectness
                  ? isCorrect
                    ? 'border-success bg-success/10'
                    : isSelected
                      ? 'border-destructive bg-destructive/10'
                      : 'border-border'
                  : isSelected
                    ? 'border-primary bg-gradient-calm'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex-1">{option}</span>
                {showCorrectness && isCorrect && (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
                {showCorrectness && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 text-destructive" />
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
          className="mb-6 rounded-xl bg-accent/20 p-4"
        >
          <div className="flex gap-3">
            <Lightbulb className="h-5 w-5 flex-shrink-0 text-accent-foreground" />
            <p className="text-sm text-foreground">{question.hint}</p>
          </div>
        </motion.div>
      )}

      {/* Explanation */}
      {showResult && question.explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 rounded-xl bg-primary/10 p-4"
        >
          <h3 className="mb-2 font-semibold text-foreground">Explanation</h3>
          <p className="text-sm text-muted-foreground">{question.explanation}</p>
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
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </EnhancedButton>
          </>
        ) : null}
      </div>
    </Card>
  );
}

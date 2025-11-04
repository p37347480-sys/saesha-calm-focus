import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  CheckCircle,
  XCircle,
  Lightbulb,
  SkipForward,
  Loader2,
} from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CalmWorld } from '@/components/3d/CalmWorld';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  difficulty: number;
}

interface GameData {
  id: string;
  chapter: string;
  title: string;
  concept: string;
}

export default function Session() {
  const navigate = useNavigate();
  const { gameId, difficulty } = useParams<{ gameId: string; difficulty: 'easy' | 'medium' | 'hard' }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    hintsUsed: 0,
  });
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!user || !gameId || !difficulty) {
      navigate('/auth');
      return;
    }
    initializeSession();
  }, [user, gameId, difficulty]);

  const initializeSession = async () => {
    try {
      // Fetch game data
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;

      setGameData({
        id: game.id,
        chapter: game.chapter,
        title: game.game_title,
        concept: game.game_concept,
      });

      // Create session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert([{
          user_id: user!.id,
          game_id: gameId,
          difficulty: difficulty,
          start_time: new Date().toISOString(),
          subject: game.chapter,
        }])
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSessionId(sessionData.id);
      loadNextQuestion(sessionData.id, game);
    } catch (error: any) {
      toast({
        title: 'Failed to start session',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  };

  const loadNextQuestion = async (currentSessionId: string, game?: any) => {
    setLoading(true);
    setShowResult(false);
    setSelectedAnswer(null);
    setShowHint(false);
    setQuestionStartTime(Date.now());

    const gameToUse = game || gameData;
    if (!gameToUse || !difficulty) return;

    try {
      const { data, error } = await supabase.functions.invoke('generate-question', {
        body: {
          chapter: gameToUse.chapter,
          gameTitle: gameToUse.title,
          gameConcept: gameToUse.concept,
          difficulty: difficulty,
        },
      });

      if (error) throw error;

      setCurrentQuestion(data);
    } catch (error: any) {
      toast({
        title: 'Failed to load question',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null || !currentQuestion || !sessionId || !gameId || !difficulty) return;

    setSubmitting(true);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    try {
      const newStats = {
        correct: stats.correct + (isCorrect ? 1 : 0),
        total: stats.total + 1,
        hintsUsed: stats.hintsUsed + (showHint ? 1 : 0),
      };

      setStats(newStats);
      setShowResult(true);

      if (isCorrect) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      // Calculate stars and accuracy for this question
      const accuracy = (newStats.correct / newStats.total) * 100;
      const starsEarned = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

      // Update game progress (will be called at end of session with full stats)
    } catch (error: any) {
      toast({
        title: 'Failed to submit answer',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (sessionId) {
      loadNextQuestion(sessionId);
    }
  };

  const handleSkip = async () => {
    if (!currentQuestion || !sessionId) return;

    setStats((prev) => ({
      ...prev,
      total: prev.total + 1,
      hintsUsed: prev.hintsUsed + (showHint ? 1 : 0),
    }));

    handleNext();
  };

  const endSession = async () => {
    if (!sessionId || !gameId || !difficulty) return;

    try {
      // Update session
      const { error: sessionError } = await supabase
        .from('sessions')
        .update({
          end_time: new Date().toISOString(),
          duration_seconds: Math.floor((Date.now() - startTime) / 1000),
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      // Update game progress
      const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
      const starsEarned = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
      const completed = stats.total >= 5 && accuracy >= 50;

      const { error: progressError } = await supabase.functions.invoke('update-game-progress', {
        body: {
          gameId,
          difficulty,
          starsEarned,
          accuracy: Math.round(accuracy),
          questionsCompleted: stats.total,
          hintsUsed: stats.hintsUsed,
          completed,
        },
      });

      if (progressError) throw progressError;

      navigate('/dashboard');
      toast({
        title: 'Session complete!',
        description: `You answered ${stats.correct} out of ${stats.total} questions correctly (${Math.round(accuracy)}%). Earned ${starsEarned} stars!`,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to end session',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (!user) return null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <CalmWorld />
      {showConfetti && <ConfettiCelebration trigger={showConfetti} />}

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/50 bg-card/80 backdrop-blur-sm"
        >
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero shadow-md">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {gameData?.title || 'Loading...'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {stats.correct}/{stats.total} correct • {difficulty}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <EnhancedButton variant="ghost" size="sm" onClick={endSession}>
                End Session
              </EnhancedButton>
            </div>
          </div>

          <div className="container mx-auto px-4">
            <Progress value={(stats.total / 10) * 100} className="h-1" />
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[400px] items-center justify-center"
              >
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </motion.div>
            ) : currentQuestion ? (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mx-auto max-w-3xl"
              >
                <Card className="border-border/50 bg-gradient-card p-8 shadow-lg">
                  {/* Question */}
                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">
                        {currentQuestion.topic}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Difficulty: {currentQuestion.difficulty}/5
                      </span>
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground">
                      {currentQuestion.question}
                    </h2>
                  </div>

                  {/* Options */}
                  <div className="mb-6 space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedAnswer === index;
                      const isCorrect = index === currentQuestion.correctAnswer;
                      const showCorrectness = showResult;

                      return (
                        <motion.button
                          key={index}
                          whileHover={{ scale: showResult ? 1 : 1.02 }}
                          whileTap={{ scale: showResult ? 1 : 0.98 }}
                          onClick={() => !showResult && setSelectedAnswer(index)}
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
                  {showHint && !showResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-6 rounded-xl bg-accent/20 p-4"
                    >
                      <div className="flex gap-3">
                        <Lightbulb className="h-5 w-5 flex-shrink-0 text-accent-foreground" />
                        <p className="text-sm text-foreground">
                          Consider the fundamental concepts of {currentQuestion.topic}.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Explanation */}
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-6 rounded-xl bg-primary/10 p-4"
                    >
                      <h3 className="mb-2 font-semibold text-foreground">
                        Explanation
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {currentQuestion.explanation}
                      </p>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-4">
                    {!showResult ? (
                      <>
                        <div className="flex gap-2">
                          {!showHint && (
                            <EnhancedButton
                              variant="outline"
                              onClick={() => setShowHint(true)}
                            >
                              <Lightbulb className="mr-2 h-4 w-4" />
                              Hint
                            </EnhancedButton>
                          )}
                          <EnhancedButton variant="ghost" onClick={handleSkip}>
                            <SkipForward className="mr-2 h-4 w-4" />
                            Skip
                          </EnhancedButton>
                        </div>
                        <EnhancedButton
                          variant="hero"
                          onClick={handleSubmit}
                          disabled={selectedAnswer === null || submitting}
                        >
                          {submitting ? 'Submitting...' : 'Submit'}
                        </EnhancedButton>
                      </>
                    ) : (
                      <EnhancedButton
                        variant="hero"
                        onClick={handleNext}
                        className="ml-auto"
                      >
                        Next Question
                      </EnhancedButton>
                    )}
                  </div>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

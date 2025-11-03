import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { CalmWorld } from '@/components/3d/CalmWorld';
import { useNavigate } from 'react-router-dom';
import { useAppStore, Grade, Chapter } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const STEPS = 3;

const chapters: Chapter[] = [
  'Trigonometry',
  'Algebra',
  'Volume & Surface Area',
  'Probability',
  'Fractions/Decimals/Percentages/Interest',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateSettings, completeOnboarding } = useAppStore();
  const [step, setStep] = useState(1);
  const [grade, setGrade] = useState<Grade | undefined>();
  const [favoriteChapters, setFavoriteChapters] = useState<Chapter[]>([]);
  const [useHints, setUseHints] = useState(true);

  const handleComplete = () => {
    updateSettings({
      grade,
      favoriteChapters,
      useHints,
    });
    completeOnboarding();
    navigate('/dashboard');
  };

  const canProgress = () => {
    switch (step) {
      case 1: return grade !== undefined;
      case 2: return true; // Favorite chapters is optional
      case 3: return true;
      default: return false;
    }
  };

  const toggleChapter = (chapter: Chapter) => {
    setFavoriteChapters(prev =>
      prev.includes(chapter)
        ? prev.filter(c => c !== chapter)
        : [...prev, chapter]
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <CalmWorld />
      
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <div className="rounded-3xl border border-border/50 bg-card/95 p-8 shadow-lg backdrop-blur-sm md:p-12">
            {/* Progress */}
            <div className="mb-8 flex gap-2">
              {Array.from({ length: STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-all",
                    i < step ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Grade */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="mb-2 text-3xl font-bold text-foreground">
                      Which grade are you in?
                    </h2>
                    <p className="text-muted-foreground">
                      We'll customize content for your level
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[11, 12].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGrade(g as Grade)}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border-2 p-8 text-center transition-all",
                          grade === g
                            ? "border-primary bg-gradient-calm shadow-md"
                            : "border-border hover:border-primary/50 hover:bg-muted"
                        )}
                      >
                        <span className="text-4xl font-bold">Grade {g}</span>
                        {grade === g && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary"
                          >
                            <Check className="h-5 w-5 text-primary-foreground" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Favorite Chapters */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="mb-2 text-3xl font-bold text-foreground">
                      Any favorite chapters?
                    </h2>
                    <p className="text-muted-foreground">
                      Select your favorites (optional)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {chapters.map((chapter) => (
                      <button
                        key={chapter}
                        onClick={() => toggleChapter(chapter)}
                        className={cn(
                          "relative rounded-xl border-2 p-4 text-left transition-all",
                          favoriteChapters.includes(chapter)
                            ? "border-primary bg-gradient-calm shadow-sm"
                            : "border-border hover:border-primary/50 hover:bg-muted"
                        )}
                      >
                        <span className="font-semibold text-sm">{chapter}</span>
                        {favoriteChapters.includes(chapter) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary"
                          >
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Hints */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="mb-2 text-3xl font-bold text-foreground">
                      How do you like to learn?
                    </h2>
                    <p className="text-muted-foreground">
                      You can always change this later
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <button
                      onClick={() => setUseHints(true)}
                      className={cn(
                        "rounded-2xl border-2 p-6 text-left transition-all",
                        useHints
                          ? "border-primary bg-gradient-calm shadow-md"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      )}
                    >
                      <h3 className="mb-2 font-semibold">More hints</h3>
                      <p className="text-sm text-muted-foreground">
                        I like gradual guidance and scaffolding
                      </p>
                    </button>

                    <button
                      onClick={() => setUseHints(false)}
                      className={cn(
                        "rounded-2xl border-2 p-6 text-left transition-all",
                        !useHints
                          ? "border-primary bg-gradient-calm shadow-md"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      )}
                    >
                      <h3 className="mb-2 font-semibold">Try first</h3>
                      <p className="text-sm text-muted-foreground">
                        I prefer to figure things out on my own
                      </p>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-4">
              {step > 1 ? (
                <EnhancedButton
                  variant="ghost"
                  onClick={() => setStep(step - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </EnhancedButton>
              ) : (
                <div />
              )}

              {step < STEPS ? (
                <EnhancedButton
                  variant="hero"
                  onClick={() => setStep(step + 1)}
                  disabled={!canProgress()}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </EnhancedButton>
              ) : (
                <EnhancedButton
                  variant="hero"
                  onClick={handleComplete}
                >
                  Start Learning
                  <Check className="h-4 w-4" />
                </EnhancedButton>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

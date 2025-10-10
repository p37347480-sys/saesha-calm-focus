import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
  Brain,
  Clock,
  Flame,
  Settings,
  TrendingUp,
  Award,
  PlayCircle,
  BookOpen,
  Target,
  Library,
  Sparkles,
} from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { CalmWorld } from '@/components/3d/CalmWorld';
import { useNavigate } from 'react-router-dom';
import { useAppStore, Subject } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { CurriculumBrowser } from '@/components/CurriculumBrowser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MicroTask } from '@/data/curriculum';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useAppStore();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTask, setSelectedTask] = useState<MicroTask | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Mock stats - in real app, fetch from backend
  const stats = {
    streak: 5,
    minutesToday: 24,
    accuracy: 85,
    tokensEarned: 120,
  };

  const handleStartSession = () => {
    if (!selectedSubject && settings.subjects.length > 1) {
      // Could show a toast asking to select a subject
      return;
    }
    const subject = selectedSubject || settings.subjects[0];
    navigate(`/session?subject=${subject}&length=${settings.sessionLength}`);
  };

  const handleTaskSelect = (task: MicroTask) => {
    setSelectedTask(task);
    console.log('Selected task:', task);
    // TODO: Navigate to task session with task.id
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (!settings.isOnboarded) {
      navigate('/onboarding');
    }
  }, [user, settings.isOnboarded, navigate]);

  if (!user || !settings.isOnboarded) {
    return null;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <CalmWorld />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/50 bg-card/80 backdrop-blur-sm"
        >
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero shadow-md"
              >
                <Brain className="h-7 w-7 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Saesha</h1>
                <p className="text-xs text-muted-foreground">Grade {settings.grade}</p>
              </div>
            </div>

            <EnhancedButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </EnhancedButton>
          </div>
        </motion.header>

        <main className="container mx-auto px-4 py-8">
          {/* Tabs for Dashboard vs Explore */}
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="mb-8 grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="dashboard" className="gap-2">
                <Target className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="explore" className="gap-2">
                <Library className="h-4 w-4" />
                Explore
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-8">
              {/* Greeting */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
                  {greeting}! 👋
                </h2>
                <p className="text-lg text-muted-foreground">
                  Ready for a focused learning session?
                </p>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              >
            <motion.div variants={item}>
              <Card className="group overflow-hidden border-border/50 bg-gradient-card p-6 transition-all hover:scale-105 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-muted-foreground">
                      Streak
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.streak}
                    </p>
                    <p className="text-xs text-muted-foreground">days</p>
                  </div>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                    className="rounded-xl bg-gradient-calm p-3"
                  >
                    <Flame className="h-6 w-6 text-accent" />
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="group overflow-hidden border-border/50 bg-gradient-card p-6 transition-all hover:scale-105 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-muted-foreground">
                      Today
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.minutesToday}
                    </p>
                    <p className="text-xs text-muted-foreground">minutes</p>
                  </div>
                  <div className="rounded-xl bg-gradient-calm p-3">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="group overflow-hidden border-border/50 bg-gradient-card p-6 transition-all hover:scale-105 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-muted-foreground">
                      Accuracy
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.accuracy}%
                    </p>
                    <p className="text-xs text-muted-foreground">average</p>
                  </div>
                  <div className="rounded-xl bg-gradient-calm p-3">
                    <Target className="h-6 w-6 text-success" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="group overflow-hidden border-border/50 bg-gradient-card p-6 transition-all hover:scale-105 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-muted-foreground">
                      Tokens
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.tokensEarned}
                    </p>
                    <p className="text-xs text-muted-foreground">earned</p>
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="rounded-xl bg-gradient-calm p-3"
                  >
                    <Award className="h-6 w-6 text-warning" />
                  </motion.div>
                </div>
              </Card>
              </motion.div>
              </motion.div>

              {/* Subject Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Choose your subject
              </h3>
            </div>

            <div className="flex flex-wrap gap-3">
              {settings.subjects.map((subject, index) => (
                <motion.button
                  key={subject}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setSelectedSubject(
                      selectedSubject === subject ? null : subject
                    )
                  }
                  className={cn(
                    'rounded-2xl border-2 px-6 py-3 font-medium transition-all',
                    selectedSubject === subject
                      ? 'border-primary bg-gradient-calm shadow-md'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-muted'
                  )}
                >
                  {subject}
                </motion.button>
              ))}
            </div>

            {settings.subjects.length > 1 && !selectedSubject && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-sm text-muted-foreground"
              >
                Select a subject or start with any random topic
              </motion.p>
            )}
              </motion.div>

              {/* Start Session CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
            <Card className="overflow-hidden border-primary/20 bg-gradient-calm p-8 shadow-lg">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="text-center md:text-left">
                  <h3 className="mb-2 text-2xl font-bold text-foreground">
                    Start a {settings.sessionLength}-minute session
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedSubject
                      ? `Practice ${selectedSubject} with adaptive questions`
                      : 'Adaptive difficulty, instant feedback, gentle pacing'}
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <EnhancedButton
                    variant="hero"
                    size="lg"
                    onClick={handleStartSession}
                    className="group min-w-[200px]"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <PlayCircle className="h-5 w-5" />
                    </motion.div>
                    Start Session
                  </EnhancedButton>
                </motion.div>
              </div>
            </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Your progress
              </h3>
            </div>

            <Card className="border-border/50 bg-gradient-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    This week
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    3 sessions completed
                  </p>
                </div>
                <div className="rounded-xl bg-gradient-calm p-3">
                  <Award className="h-8 w-8 text-success" />
                </div>
              </div>

              <div className="space-y-3">
                {['Physics', 'Math', 'Chemistry'].map((subject, index) => (
                  <motion.div
                    key={subject}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    className="flex items-center justify-between rounded-xl bg-muted/50 p-3"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {subject}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${70 + index * 10}%` }}
                          transition={{ delay: 1.2 + index * 0.1, duration: 0.8 }}
                          className="h-full rounded-full bg-gradient-hero"
                        />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {70 + index * 10}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
              </motion.div>

              {/* Quick Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
            <Card className="border-accent/30 bg-gradient-card p-6">
              <div className="flex gap-4">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent/20"
                >
                  <Brain className="h-6 w-6 text-accent-foreground" />
                </motion.div>
                <div>
                  <h4 className="mb-2 font-semibold text-foreground">
                    Tip: Take breaks between sessions
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Short 2-5 minute breaks help your brain consolidate learning.
                    Try stretching or looking away from the screen.
                  </p>
                </div>
              </div>
              </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="explore" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden border-primary/20 bg-gradient-calm p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero shadow-md"
                    >
                      <Library className="h-6 w-6 text-primary-foreground" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Explore Curriculum
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Browse all topics and micro-tasks for Class {settings.grade || 11}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    >
                      <Sparkles className="h-5 w-5 text-primary" />
                    </motion.div>
                  </div>
                  <CurriculumBrowser
                    selectedGrade={settings.grade || 11}
                    onTaskSelect={handleTaskSelect}
                  />
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
  Brain,
  Clock,
  Flame,
  Settings,
  Target,
  Trophy,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { CalmWorld } from '@/components/3d/CalmWorld';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { useUserStats } from '@/hooks/useUserStats';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ icon, label, value, loading }: any) => (
  <div className="flex items-center gap-3">
    <div className="rounded-xl bg-secondary p-3">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="h-6 w-16" />
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useAppStore();
  const { stats, chapterStats } = useUserStats();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (!settings.isOnboarded) {
      navigate('/onboarding');
    }
  }, [user, settings.isOnboarded, navigate]);

  const navigateToChapters = () => {
    navigate('/chapters');
  };

  if (!user || !settings.isOnboarded) {
    return null;
  }

  if (stats.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
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
                <p className="text-xs text-muted-foreground">Mathematics Learning</p>
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

        <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
              Welcome back! 👋
            </h2>
            <p className="text-lg text-muted-foreground">
              Ready to master mathematics?
            </p>
          </motion.div>

          {/* Today's Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Your Progress</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    icon={<Flame className="w-5 h-5 text-orange-500" />}
                    label="Streak"
                    value={`${stats.streak} days`}
                    loading={stats.loading}
                  />
                  <StatCard
                    icon={<Clock className="w-5 h-5 text-blue-500" />}
                    label="Minutes Today"
                    value={`${stats.minutesToday} min`}
                    loading={stats.loading}
                  />
                  <StatCard
                    icon={<Target className="w-5 h-5 text-green-500" />}
                    label="Accuracy"
                    value={`${stats.accuracy}%`}
                    loading={stats.loading}
                  />
                  <StatCard
                    icon={<Trophy className="w-5 h-5 text-yellow-500" />}
                    label="Total Stars"
                    value={stats.totalStars}
                    loading={stats.loading}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group"
              onClick={navigateToChapters}
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                      Start Learning
                    </h3>
                    <p className="text-muted-foreground">
                      Choose a chapter and game
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  5 chapters • 20 games • 3 difficulty levels each
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-secondary">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Your Stats</h3>
                    <p className="text-muted-foreground">
                      Track your progress
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Levels Completed</span>
                    <span className="font-semibold">{stats.completedLevels}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tokens Earned</span>
                    <span className="font-semibold">{stats.tokensEarned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Streak</span>
                    <span className="font-semibold">{stats.streak} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

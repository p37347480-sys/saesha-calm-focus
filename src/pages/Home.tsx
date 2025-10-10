import { motion } from 'framer-motion';
import { Brain, Sparkles, Target, Zap } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { CalmWorld } from '@/components/3d/CalmWorld';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

export default function Home() {
  const navigate = useNavigate();
  const { settings } = useAppStore();

  const handleGetStarted = () => {
    if (settings.isOnboarded) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'ADHD-Optimized',
      description: 'Bite-sized 3-10 minute sessions designed for focused learning',
    },
    {
      icon: Target,
      title: 'Adaptive Learning',
      description: 'Difficulty adjusts to your pace, keeping you in the flow state',
    },
    {
      icon: Sparkles,
      title: 'Calm & Beautiful',
      description: 'Gentle animations and soothing design reduce overwhelm',
    },
    {
      icon: Zap,
      title: 'Instant Feedback',
      description: 'Immediate explanations help you learn and stay motivated',
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <CalmWorld />
      
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero shadow-md">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Saesha</h1>
            </div>
            
            <div className="flex gap-2">
              {settings.isOnboarded && (
                <EnhancedButton
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </EnhancedButton>
              )}
              <EnhancedButton
                variant="outline"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </EnhancedButton>
            </div>
          </motion.div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-4xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-calm px-4 py-2 text-sm font-medium text-primary shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              ADHD-Friendly Microlearning
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6 text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl"
            >
              Learn in moments,
              <br />
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                not marathons
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl"
            >
              Designed for Class 11-12 students with ADHD. Short, focused sessions
              that adapt to your pace. Beautiful, calm interface that helps you stay
              in the zone.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <EnhancedButton
                  variant="hero"
                  size="lg"
                  onClick={handleGetStarted}
                  className="min-w-[200px]"
                >
                  Get Started
                </EnhancedButton>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <EnhancedButton
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/about')}
                  className="min-w-[200px]"
                >
                  Learn More
                </EnhancedButton>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-20 grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className="group rounded-2xl border border-border/50 bg-card/80 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-calm"
                >
                  <feature.icon className="h-6 w-6 text-primary" />
                </motion.div>
                <h3 className="mb-2 font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Designed with care for focused learning
          </p>
        </footer>
      </div>
    </div>
  );
}

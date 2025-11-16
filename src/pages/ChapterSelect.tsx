import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Calculator, 
  Box, 
  Dices, 
  Percent,
  ArrowLeft,
  BookOpen,
  Trophy,
  Star
} from 'lucide-react';
import { useUserStats } from '@/hooks/useUserStats';
import { Progress } from '@/components/ui/progress';
import { VolumeControl } from '@/components/VolumeControl';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { SkylineSurveyor } from '@/components/3d/SkylineSurveyor';
import { AlgebraLock } from '@/components/3d/AlgebraLock';
import { AquaTank } from '@/components/3d/AquaTank';
import { ProbabilityCards } from '@/components/3d/ProbabilityCards';
import { FractionPizza } from '@/components/3d/FractionPizza';

const chapters = [
  {
    id: 'Trigonometry',
    title: 'Trigonometry',
    icon: TrendingUp,
    description: 'Heights, distances, graphs & identities',
    color: 'from-blue-500 to-cyan-500',
    animation: SkylineSurveyor,
  },
  {
    id: 'Algebra',
    title: 'Algebra',
    icon: Calculator,
    description: 'Expanding, factorising & equations',
    color: 'from-purple-500 to-pink-500',
    animation: AlgebraLock,
  },
  {
    id: 'Volume & Surface Area',
    title: 'Volume & Surface Area',
    icon: Box,
    description: 'Composite solids & optimization',
    color: 'from-green-500 to-emerald-500',
    animation: AquaTank,
  },
  {
    id: 'Probability',
    title: 'Probability',
    icon: Dices,
    description: 'Conditional, binomial & real-world data',
    color: 'from-orange-500 to-red-500',
    animation: ProbabilityCards,
  },
  {
    id: 'Fractions/Decimals/Percentages/Interest',
    title: 'Numbers & Finance',
    icon: Percent,
    description: 'Fractions, decimals, percentages & interest',
    color: 'from-yellow-500 to-amber-500',
    animation: FractionPizza,
  },
];

export default function ChapterSelect() {
  const navigate = useNavigate();
  const { stats } = useUserStats();
  const { play } = useSoundEffects();

  const getChapterProgress = (chapterId: string) => {
    // Placeholder logic - would be replaced with actual chapter stats from backend
    return { progress: 0, stars: 0, completed: 0, total: 4 };
  };

  const handleChapterClick = (chapterId: string) => {
    play('click');
    navigate(`/games/${encodeURIComponent(chapterId)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Star className="w-5 h-5 text-primary fill-primary" />
              <span className="font-semibold">{stats?.totalStars || 0}</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-semibold">{stats?.completedLevels || 0} Levels</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          >
            Choose Your Chapter
          </motion.h1>
          <p className="text-lg text-muted-foreground">
            Master mathematics through 5 exciting chapters
          </p>
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter, index) => {
            const Icon = chapter.icon;
            const AnimationComponent = chapter.animation;
            const progress = getChapterProgress(chapter.id);

            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary relative"
                  onClick={() => handleChapterClick(chapter.id)}
                >
                  {/* 3D Background Animation */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                      <Suspense fallback={null}>
                        <AnimationComponent />
                      </Suspense>
                    </Canvas>
                  </div>

                  <div className={`h-2 bg-gradient-to-r ${chapter.color} relative z-10`} />
                  
                  <CardContent className="p-6 relative z-10 bg-background/80 backdrop-blur-sm">
                    {/* Icon & Title */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${chapter.color} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary fill-primary" />
                        <span className="font-bold text-sm">{progress.stars}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {chapter.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {chapter.description}
                    </p>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                          {progress.completed}/{progress.total} Games
                        </span>
                      </div>
                      <Progress value={progress.progress} className="h-2" />
                    </div>

                    {/* Status Badge */}
                    <div className="mt-4">
                      {progress.completed === 0 && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          Start learning
                        </div>
                      )}
                      {progress.completed > 0 && progress.completed < progress.total && (
                        <div className="text-xs text-primary flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          In progress
                        </div>
                      )}
                      {progress.completed === progress.total && (
                        <div className="text-xs text-green-600 flex items-center gap-1 font-semibold">
                          <Trophy className="w-3 h-3" />
                          Completed!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Volume Control */}
        <VolumeControl />
      </div>
    </div>
  );
}

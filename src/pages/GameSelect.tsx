import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Lock, 
  Star, 
  Trophy,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface Game {
  id: string;
  chapter: string;
  game_number: number;
  game_title: string;
  game_concept: string;
  progress: {
    easy?: any;
    medium?: any;
    hard?: any;
  };
}

export default function GameSelect() {
  const { chapter } = useParams<{ chapter: string }>();
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chapter) {
      fetchGames();
    }
  }, [chapter]);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-games', {
        body: { chapter: decodeURIComponent(chapter!) }
      });

      if (error) throw error;
      setGames(data.games || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return Lightbulb;
      case 'medium': return Target;
      case 'hard': return Zap;
      default: return Target;
    }
  };

  const isLevelUnlocked = (game: Game, difficulty: 'easy' | 'medium' | 'hard') => {
    // Easy is always unlocked for ALL games
    if (difficulty === 'easy') return true;
    
    const progress = game.progress[difficulty];
    return progress?.unlocked || false;
  };

  const getStars = (game: Game, difficulty: 'easy' | 'medium' | 'hard') => {
    const progress = game.progress[difficulty];
    return progress?.stars_earned || 0;
  };

  const getAccuracy = (game: Game, difficulty: 'easy' | 'medium' | 'hard') => {
    const progress = game.progress[difficulty];
    return progress?.best_accuracy ? Math.round(progress.best_accuracy * 100) : 0;
  };

  const startGame = (game: Game, difficulty: 'easy' | 'medium' | 'hard') => {
    if (!isLevelUnlocked(game, difficulty)) {
      toast.error('Complete previous levels to unlock this one!');
      play('incorrect');
      return;
    }
    
    play('whoosh');
    navigate(`/session/${game.id}/${difficulty}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/chapters')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chapters
          </Button>
        </div>

        {/* Chapter Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {decodeURIComponent(chapter!)}
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose a game and select your difficulty level
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all card-interactive">
                  <motion.div 
                    className="bg-gradient-hero p-6 border-b"
                    whileHover={{ 
                      background: 'linear-gradient(135deg, hsl(262.1 83.3% 60%), hsl(160 45% 70%))',
                    }}
                  >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm text-primary-foreground/80 mb-1 font-medium">
                        Game {game.game_number}
                      </div>
                      <h3 className="text-2xl font-bold text-primary-foreground">{game.game_title}</h3>
                    </div>
                    <div className="bg-background/20 backdrop-blur rounded-full p-3">
                      <Trophy className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                    <p className="text-sm text-primary-foreground/90 leading-relaxed">{game.game_concept}</p>
                  </motion.div>

                <CardContent className="p-6">
                  <div className="space-y-3">
                    {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
                      const unlocked = isLevelUnlocked(game, difficulty);
                      const stars = getStars(game, difficulty);
                      const accuracy = getAccuracy(game, difficulty);
                      const DifficultyIcon = getDifficultyIcon(difficulty);

                      return (
                        <Button
                          key={difficulty}
                          variant="outline"
                          className={`w-full h-auto p-4 justify-between border-2 transition-all ${
                            unlocked 
                              ? 'hover:bg-primary/10 hover:border-primary hover:scale-[1.02]' 
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                          onClick={() => startGame(game, difficulty)}
                          disabled={!unlocked}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg border-2 ${getDifficultyColor(difficulty)}`}>
                              <DifficultyIcon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <div className="font-bold capitalize text-base">{difficulty}</div>
                              {stars > 0 && (
                                <div className="text-xs text-muted-foreground font-medium">
                                  {accuracy}% accuracy
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {unlocked ? (
                              <>
                                {[1, 2, 3].map((n) => (
                                  <Star
                                    key={n}
                                    className={`w-5 h-5 transition-all ${
                                      n <= stars
                                        ? 'text-yellow-500 fill-yellow-500 scale-110'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </>
                            ) : (
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

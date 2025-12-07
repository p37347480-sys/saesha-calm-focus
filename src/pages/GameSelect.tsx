import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap } from 'lucide-react';
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


  const startGame = (game: Game) => {
    play('whoosh');
    // Navigate to visual learning experience (no questions, just 3D)
    navigate(`/learn/${game.id}`);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startGame(game)}
                className="cursor-pointer"
              >
                <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all h-full">
                  <div className="bg-gradient-hero p-6 min-h-[140px] flex flex-col justify-between">
                    <div>
                      <div className="text-sm text-primary-foreground/80 mb-1 font-medium">
                        Game {game.game_number}
                      </div>
                      <h3 className="text-xl font-bold text-primary-foreground">
                        {game.game_title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        3D Visual
                      </Badge>
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        Interactive
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {game.game_concept}
                    </p>
                    <Button className="w-full mt-4 gap-2" variant="default">
                      <Zap className="w-4 h-4" />
                      Start Learning
                    </Button>
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

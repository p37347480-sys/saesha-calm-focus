import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, Target } from 'lucide-react';
import { AlgebraPlayground3D } from '@/components/interactive/AlgebraPlayground3D';
import { SlopeCity } from '@/components/interactive/SlopeCity';
import { ShapeFactory3D } from '@/components/interactive/ShapeFactory3D';
import { PathFinder3D } from '@/components/interactive/PathFinder3D';
import { ChanceArcade } from '@/components/interactive/ChanceArcade';
import { BackgroundAnimation } from '@/components/GameVisualizations';

interface GameData {
  id: string;
  chapter: string;
  title: string;
  concept: string;
}

export default function ExploreSession() {
  const navigate = useNavigate();
  const { gameId, difficulty } = useParams<{ gameId: string; difficulty: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [engagementTime, setEngagementTime] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!user || !gameId) {
      navigate('/auth');
      return;
    }
    initializeSession();

    // Track engagement time
    const timer = setInterval(() => {
      setEngagementTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [user, gameId]);

  const initializeSession = async () => {
    try {
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

      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert([{
          user_id: user!.id,
          game_id: gameId,
          difficulty: difficulty || 'medium',
          start_time: new Date().toISOString(),
          subject: game.chapter,
        }])
        .select()
        .single();

      if (sessionError) throw sessionError;
      setSessionId(sessionData.id);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: 'Failed to start session',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime) / 1000);

      await supabase
        .from('sessions')
        .update({
          end_time: endTime.toISOString(),
          duration_seconds: duration,
        })
        .eq('id', sessionId);

      toast({
        title: 'Exploration Complete!',
        description: `You explored for ${Math.floor(duration / 60)} minutes. Great learning!`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error ending session',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const renderInteractiveGame = () => {
    if (!gameData) return null;

    const title = gameData.title.toLowerCase();
    const concept = gameData.concept.toLowerCase();

    if (title.includes('algebra') || concept.includes('expansion') || concept.includes('factoris')) {
      return <AlgebraPlayground3D />;
    }
    if (title.includes('slope') || title.includes('linear') || concept.includes('graph')) {
      return <SlopeCity />;
    }
    if (title.includes('volume') || title.includes('area') || title.includes('shape')) {
      return <ShapeFactory3D />;
    }
    if (title.includes('pythagoras') || title.includes('path') || concept.includes('triangle')) {
      return <PathFinder3D />;
    }
    if (title.includes('probability') || title.includes('chance') || title.includes('dice')) {
      return <ChanceArcade />;
    }

    return <AlgebraPlayground3D />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-calm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-2xl font-bold text-foreground mb-4">Loading Experience...</div>
        </motion.div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-calm relative">
      <BackgroundAnimation gameTitle={gameData?.title || ''} />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-card/95 backdrop-blur-sm border-2 border-primary/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <EnhancedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </EnhancedButton>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {gameData?.title}
                </h1>
                <p className="text-muted-foreground">{gameData?.concept}</p>
              </div>

              <div className="flex gap-4">
                <Card className="px-4 py-2 bg-background/50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-mono text-lg text-foreground">
                      {formatTime(engagementTime)}
                    </span>
                  </div>
                </Card>
                <Card className="px-4 py-2 bg-background/50">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-secondary" />
                    <span className="text-sm font-semibold text-foreground">
                      Exploration Mode
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Interactive Game Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {renderInteractiveGame()}
        </motion.div>

        {/* End Session Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <EnhancedButton
            onClick={endSession}
            size="lg"
            variant="outline"
            className="min-w-[200px]"
          >
            Complete Exploration
          </EnhancedButton>
        </motion.div>
      </div>
    </div>
  );
}

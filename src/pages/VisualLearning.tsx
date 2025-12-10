import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Play, Pause, Info } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MountainClimbExplorer } from '@/components/3d/MountainClimbExplorer';
import { LighthouseShadow } from '@/components/3d/LighthouseShadow';
import { TriangleConstructionLab } from '@/components/3d/TriangleConstructionLab';
import { AlgebraBlockBuilder } from '@/components/3d/AlgebraBlockBuilder';
import { FactorForest } from '@/components/3d/FactorForest';
import { EquationBalancer } from '@/components/3d/EquationBalancer';
import { ShapeTransformationLab } from '@/components/3d/ShapeTransformationLab';
import { CompositeSolidsBuilder } from '@/components/3d/CompositeSolidsBuilder';
import { OptimizationArena } from '@/components/3d/OptimizationArena';

interface GameData {
  id: string;
  chapter: string;
  game_title: string;
  game_concept: string;
}

export default function VisualLearning() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchGameData();
  }, [user, gameId]);

  const fetchGameData = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) throw error;
      setGameData(data);
    } catch (error) {
      console.error('Error fetching game:', error);
      navigate('/chapters');
    } finally {
      setLoading(false);
    }
  };

  const get3DScene = () => {
    if (!gameData) return null;
    const title = gameData.game_title.toLowerCase();

    // Trigonometry games
    if (title.includes('mountain') || title.includes('climb')) {
      return <MountainClimbExplorer />;
    }
    if (title.includes('lighthouse') || title.includes('shadow')) {
      return <LighthouseShadow />;
    }
    if (title.includes('triangle') || title.includes('construction')) {
      return <TriangleConstructionLab />;
    }

    // Algebra games
    if (title.includes('block builder') || title.includes('expanding')) {
      return <AlgebraBlockBuilder />;
    }
    if (title.includes('factor') || title.includes('forest')) {
      return <FactorForest />;
    }
    if (title.includes('balancer') || title.includes('equation')) {
      return <EquationBalancer />;
    }

    // Volume & Surface Area games
    if (title.includes('transformation') || title.includes('shape lab')) {
      return <ShapeTransformationLab />;
    }
    if (title.includes('composite') || title.includes('builder')) {
      return <CompositeSolidsBuilder />;
    }
    if (title.includes('optimization') || title.includes('arena')) {
      return <OptimizationArena />;
    }

    // Default fallback
    return <MountainClimbExplorer />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Full-screen 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 2, 8], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            autoRotate={!isPaused}
            autoRotateSpeed={0.5}
            minDistance={3}
            maxDistance={15}
          />
          {get3DScene()}
        </Canvas>
      </div>

      {/* Overlay UI */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 flex items-center justify-between"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(`/games/${encodeURIComponent(gameData?.chapter || '')}`)}
            className="gap-2 text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPaused(!isPaused)}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfo(!showInfo)}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <Info className="w-5 h-5" />
            </Button>
          </div>
        </motion.header>

        {/* Game Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center px-4 mt-4"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {gameData?.game_title}
          </h1>
          <p className="text-lg text-white/60">{gameData?.chapter}</p>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Info Panel */}
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 md:p-6"
          >
            <div className="max-w-2xl mx-auto bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-3">How It Works</h2>
              <p className="text-white/80 leading-relaxed mb-4">
                {gameData?.game_concept}
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Base / Adjacent</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Height / Opposite</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Hypotenuse</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Angle</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-white/50">
                  Drag to rotate • Scroll to zoom • Watch how angles affect the triangle sides
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Dices, TrendingUp } from 'lucide-react';
import { ProbabilityCards } from '@/components/3d/ProbabilityCards';

export function ChanceArcade() {
  const [rolls, setRolls] = useState(0);
  const [outcomes, setOutcomes] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
    setTimeout(() => {
      const newRoll = Math.floor(Math.random() * 6) + 1;
      setOutcomes([...outcomes, newRoll]);
      setRolls(rolls + 1);
      setIsRolling(false);
    }, 500);
  };

  const frequency = outcomes.reduce((acc, num) => {
    acc[num] = (acc[num] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const resetGame = () => {
    setRolls(0);
    setOutcomes([]);
  };

  return (
    <div className="w-full h-full space-y-6">
      {/* Concept Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Badge className="mb-4 text-lg px-6 py-2">
          <Dices className="mr-2 h-5 w-5" />
          Chance Arcade
        </Badge>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Probability & Randomness
        </h2>
        <p className="text-muted-foreground text-lg">
          Roll the dice • Watch patterns emerge • See probability in action
        </p>
      </motion.div>

      {/* Interactive 3D Canvas */}
      <Card className="relative h-[400px] bg-gradient-card border-2 border-primary/20 overflow-hidden">
        <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
          <ProbabilityCards />
        </Canvas>

        {/* Stats Display */}
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg border border-primary/20">
          <div className="text-sm font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span>Total Rolls: {rolls}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            More rolls = clearer pattern!
          </div>
        </div>
      </Card>

      {/* Control Panel */}
      <Card className="p-6 bg-gradient-card border-2 border-primary/20">
        <div className="flex gap-4 justify-center">
          <EnhancedButton
            onClick={rollDice}
            disabled={isRolling}
            size="lg"
            className="min-w-[150px]"
          >
            <Dices className="mr-2 h-5 w-5" />
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </EnhancedButton>
          <EnhancedButton
            onClick={resetGame}
            variant="outline"
            size="lg"
          >
            Reset
          </EnhancedButton>
        </div>
      </Card>

      {/* Frequency Chart */}
      {rolls > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-gradient-card border-2 border-primary/20">
            <h3 className="text-lg font-bold mb-4 text-foreground">Frequency Distribution</h3>
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const count = frequency[num] || 0;
                const percentage = rolls > 0 ? (count / rolls * 100).toFixed(1) : 0;
                const height = rolls > 0 ? (count / Math.max(...Object.values(frequency)) * 100) : 0;
                
                return (
                  <div key={num} className="text-center">
                    <div className="h-32 flex flex-col justify-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        className="bg-gradient-to-t from-primary to-primary/50 rounded-t-lg"
                      />
                    </div>
                    <div className="mt-2 text-sm font-semibold text-foreground">{num}</div>
                    <div className="text-xs text-muted-foreground">{count} ({percentage}%)</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Concept Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Card className="p-4 bg-primary/5 border-primary/20">
          <h3 className="font-bold text-primary mb-2">🎲 Probability</h3>
          <p className="text-sm text-foreground">
            Each dice face has a 1/6 chance. With more rolls, you'll see each number appear about 16.7% of the time!
          </p>
        </Card>
        <Card className="p-4 bg-secondary/5 border-secondary/20">
          <h3 className="font-bold text-secondary mb-2">📊 Law of Large Numbers</h3>
          <p className="text-sm text-foreground">
            The more times you roll, the closer your results get to the expected probability. Try 100 rolls!
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

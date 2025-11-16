import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Mountain, Ruler } from 'lucide-react';
import { MountainRescue } from '@/components/3d/MountainRescue';

export function PathFinder3D() {
  const [sideA, setSideA] = useState(3);
  const [sideB, setSideB] = useState(4);

  const hypotenuse = Math.sqrt(sideA ** 2 + sideB ** 2).toFixed(2);
  const directPath = parseFloat(hypotenuse);
  const twoStepPath = sideA + sideB;
  const savings = ((twoStepPath - directPath) / twoStepPath * 100).toFixed(1);

  return (
    <div className="w-full h-full space-y-6">
      {/* Concept Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Badge className="mb-4 text-lg px-6 py-2">
          <Mountain className="mr-2 h-5 w-5" />
          Path Finder 3D
        </Badge>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Pythagoras Theorem
        </h2>
        <p className="text-muted-foreground text-lg">
          Find the shortest path • Discover the diagonal secret
        </p>
      </motion.div>

      {/* Interactive 3D Canvas */}
      <Card className="relative h-[500px] bg-gradient-card border-2 border-primary/20 overflow-hidden">
        <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
          <MountainRescue />
        </Canvas>

        {/* Theorem Display */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-primary/30">
          <div className="text-2xl font-mono text-primary">
            {sideA}² + {sideB}² = {hypotenuse}²
          </div>
        </div>

        {/* Path Comparison */}
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg border border-primary/20 space-y-2">
          <div className="text-sm font-semibold">
            <span className="text-muted-foreground">Direct Path:</span>
            <span className="text-green-500 ml-2">{hypotenuse} units</span>
          </div>
          <div className="text-sm font-semibold">
            <span className="text-muted-foreground">Two-Step Path:</span>
            <span className="text-orange-500 ml-2">{twoStepPath} units</span>
          </div>
          <div className="text-sm font-semibold border-t pt-2">
            <span className="text-muted-foreground">Distance Saved:</span>
            <span className="text-primary ml-2">{savings}%</span>
          </div>
        </div>
      </Card>

      {/* Interactive Controls */}
      <Card className="p-6 bg-gradient-card border-2 border-primary/20">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Side A: {sideA.toFixed(1)} units
              </label>
              <Slider
                value={[sideA]}
                onValueChange={(val) => setSideA(val[0])}
                min={1}
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Side B: {sideB.toFixed(1)} units
              </label>
              <Slider
                value={[sideB]}
                onValueChange={(val) => setSideB(val[0])}
                min={1}
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Concept Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Card className="p-4 bg-primary/5 border-primary/20">
          <h3 className="font-bold text-primary mb-2">⚡ Shortest Path</h3>
          <p className="text-sm text-foreground">
            The diagonal (hypotenuse) is ALWAYS the shortest distance between two points.
            That's why the rescue drone flies diagonal!
          </p>
        </Card>
        <Card className="p-4 bg-secondary/5 border-secondary/20">
          <h3 className="font-bold text-secondary mb-2">🔺 The Formula</h3>
          <p className="text-sm text-foreground">
            a² + b² = c² means: square the two sides, add them, then square root to get the diagonal!
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

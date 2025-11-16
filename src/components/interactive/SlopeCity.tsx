import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MapPin } from 'lucide-react';
import { SkylineSurveyor } from '@/components/3d/SkylineSurveyor';

export function SlopeCity() {
  const [slope, setSlope] = useState(1);
  const [intercept, setIntercept] = useState(0);

  return (
    <div className="w-full h-full space-y-6">
      {/* Concept Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Badge className="mb-4 text-lg px-6 py-2">
          <TrendingUp className="mr-2 h-5 w-5" />
          Slope City
        </Badge>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Linear Graphs & Slopes
        </h2>
        <p className="text-muted-foreground text-lg">
          Tilt roads • Adjust heights • Watch the city transform
        </p>
      </motion.div>

      {/* Interactive 3D Canvas */}
      <Card className="relative h-[500px] bg-gradient-card border-2 border-primary/20 overflow-hidden">
        <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
          <SkylineSurveyor />
        </Canvas>

        {/* Equation Display */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-primary/30">
          <div className="text-2xl font-mono text-primary">
            y = {slope}x {intercept >= 0 ? '+' : ''} {intercept}
          </div>
        </div>

        {/* Visual Guide */}
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border border-primary/20">
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Slope: {slope}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Intercept: {intercept}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Interactive Controls */}
      <Card className="p-6 bg-gradient-card border-2 border-primary/20">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Slope (m): {slope.toFixed(2)}
            </label>
            <Slider
              value={[slope]}
              onValueChange={(val) => setSlope(val[0])}
              min={-3}
              max={3}
              step={0.1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Tilt the road by changing the slope
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Y-Intercept (c): {intercept}
            </label>
            <Slider
              value={[intercept]}
              onValueChange={(val) => setIntercept(val[0])}
              min={-5}
              max={5}
              step={0.5}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Slide the road up or down
            </p>
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
          <h3 className="font-bold text-primary mb-2">📐 Slope</h3>
          <p className="text-sm text-foreground">
            Slope is the steepness of the line. Positive = upward, Negative = downward, Zero = flat road!
          </p>
        </Card>
        <Card className="p-4 bg-secondary/5 border-secondary/20">
          <h3 className="font-bold text-secondary mb-2">📍 Intercept</h3>
          <p className="text-sm text-foreground">
            The y-intercept is where the line crosses the y-axis. It's the starting height of your road!
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

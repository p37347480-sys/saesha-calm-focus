import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Box, Droplets } from 'lucide-react';
import { AquaTank } from '@/components/3d/AquaTank';

export function ShapeFactory3D() {
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(2);
  const [depth, setDepth] = useState(2);
  const [fillLevel, setFillLevel] = useState(50);

  const volume = (width * height * depth).toFixed(2);
  const surfaceArea = (2 * (width * height + height * depth + depth * width)).toFixed(2);

  return (
    <div className="w-full h-full space-y-6">
      {/* Concept Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Badge className="mb-4 text-lg px-6 py-2">
          <Box className="mr-2 h-5 w-5" />
          Shape Factory 3D
        </Badge>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Volume & Surface Area
        </h2>
        <p className="text-muted-foreground text-lg">
          Build shapes • Fill with water • Watch space come alive
        </p>
      </motion.div>

      {/* Interactive 3D Canvas */}
      <Card className="relative h-[500px] bg-gradient-card border-2 border-primary/20 overflow-hidden">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <AquaTank />
        </Canvas>

        {/* Measurements Display */}
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg border border-primary/20 space-y-2">
          <div className="text-sm font-semibold">
            <span className="text-muted-foreground">Volume:</span>
            <span className="text-primary ml-2 text-lg">{volume} units³</span>
          </div>
          <div className="text-sm font-semibold">
            <span className="text-muted-foreground">Surface Area:</span>
            <span className="text-secondary ml-2 text-lg">{surfaceArea} units²</span>
          </div>
          <div className="text-sm font-semibold">
            <span className="text-muted-foreground">Fill:</span>
            <span className="text-accent ml-2 text-lg">{fillLevel}%</span>
          </div>
        </div>
      </Card>

      {/* Interactive Controls */}
      <Card className="p-6 bg-gradient-card border-2 border-primary/20">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-3 text-foreground">
                Width: {width.toFixed(1)}
              </label>
              <Slider
                value={[width]}
                onValueChange={(val) => setWidth(val[0])}
                min={1}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-foreground">
                Height: {height.toFixed(1)}
              </label>
              <Slider
                value={[height]}
                onValueChange={(val) => setHeight(val[0])}
                min={1}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-foreground">
                Depth: {depth.toFixed(1)}
              </label>
              <Slider
                value={[depth]}
                onValueChange={(val) => setDepth(val[0])}
                min={1}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              Water Fill: {fillLevel}%
            </label>
            <Slider
              value={[fillLevel]}
              onValueChange={(val) => setFillLevel(val[0])}
              max={100}
              step={1}
              className="w-full"
            />
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
          <h3 className="font-bold text-primary mb-2">📦 Volume</h3>
          <p className="text-sm text-foreground">
            Volume is the space INSIDE the shape. It's measured in cubic units (units³).
            Formula: Volume = Width × Height × Depth
          </p>
        </Card>
        <Card className="p-4 bg-secondary/5 border-secondary/20">
          <h3 className="font-bold text-secondary mb-2">🎁 Surface Area</h3>
          <p className="text-sm text-foreground">
            Surface area is the total area of all outer faces. It's the "skin" of the shape!
            Formula: SA = 2(wh + hd + dw)
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

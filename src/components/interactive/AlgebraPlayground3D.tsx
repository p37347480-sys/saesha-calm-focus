import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { AlgebraLock } from '@/components/3d/AlgebraLock';

export function AlgebraPlayground3D() {
  const [expansion, setExpansion] = useState(50);
  const [rotation, setRotation] = useState(0);

  return (
    <div className="w-full h-full space-y-6">
      {/* Concept Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Badge className="mb-4 text-lg px-6 py-2">
          <Sparkles className="mr-2 h-5 w-5" />
          Algebra Playground
        </Badge>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Expansion & Factorisation
        </h2>
        <p className="text-muted-foreground text-lg">
          Pull apart blocks to expand • Push together to factorise
        </p>
      </motion.div>

      {/* Interactive 3D Canvas */}
      <Card className="relative h-[500px] bg-gradient-card border-2 border-primary/20 overflow-hidden">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <AlgebraLock />
          <OrbitControls enableZoom={false} />
        </Canvas>

        {/* Visual Formula Display */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-primary/30">
          <div className="text-2xl font-mono text-primary">
            {expansion < 50 ? (
              <span>(a + b)²</span>
            ) : (
              <span>a² + 2ab + b²</span>
            )}
          </div>
        </div>
      </Card>

      {/* Interactive Controls */}
      <Card className="p-6 bg-gradient-card border-2 border-primary/20">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3 text-foreground">
              Expansion Level: {expansion}%
            </label>
            <Slider
              value={[expansion]}
              onValueChange={(val) => setExpansion(val[0])}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Slide right to expand → Slide left to factorise
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3 text-foreground">
              Rotation: {rotation}°
            </label>
            <Slider
              value={[rotation]}
              onValueChange={(val) => setRotation(val[0])}
              max={360}
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
          <h3 className="font-bold text-primary mb-2">🔓 Expansion</h3>
          <p className="text-sm text-foreground">
            When you expand, you're spreading the expression out into individual terms.
            Like unpacking a compressed box!
          </p>
        </Card>
        <Card className="p-4 bg-secondary/5 border-secondary/20">
          <h3 className="font-bold text-secondary mb-2">📦 Factorisation</h3>
          <p className="text-sm text-foreground">
            When you factorise, you're packing terms together into a compact form.
            Like organizing items into a neat box!
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

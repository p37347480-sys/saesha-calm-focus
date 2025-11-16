import { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Pizza, Percent } from 'lucide-react';
import * as THREE from 'three';
import { useRef } from 'react';

function InteractivePizza({ slices, selectedSlices }: { slices: number; selectedSlices: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const anglePerSlice = (Math.PI * 2) / slices;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 5, 5]} intensity={0.8} color="#f59e0b" />

      <group ref={groupRef}>
        {/* Pizza slices */}
        {Array.from({ length: slices }).map((_, i) => {
          const angle = i * anglePerSlice;
          const isSelected = i < selectedSlices;
          const radius = 2;
          const height = 0.3;

          // Calculate slice position (spread out selected slices)
          const spreadDistance = isSelected ? 0.3 : 0;
          const x = Math.cos(angle + anglePerSlice / 2) * spreadDistance;
          const z = Math.sin(angle + anglePerSlice / 2) * spreadDistance;

          return (
            <group key={i} position={[x, 0, z]}>
              {/* Create a wedge/slice shape */}
              <mesh rotation={[0, angle, 0]}>
                <cylinderGeometry 
                  args={[0, radius, height, 32, 1, false, 0, anglePerSlice]} 
                />
                <meshStandardMaterial 
                  color={isSelected ? '#f59e0b' : '#fbbf24'}
                  emissive={isSelected ? '#f59e0b' : '#fbbf24'}
                  emissiveIntensity={isSelected ? 0.5 : 0.2}
                />
              </mesh>

              {/* Toppings (pepperoni) */}
              {isSelected && (
                <>
                  <mesh position={[0.5, height / 2 + 0.05, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.15, 16]} />
                    <meshStandardMaterial color="#dc2626" />
                  </mesh>
                  <mesh position={[0.8, height / 2 + 0.05, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.12, 16]} />
                    <meshStandardMaterial color="#dc2626" />
                  </mesh>
                </>
              )}
            </group>
          );
        })}

        {/* Pizza plate */}
        <mesh position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[2.5, 2.5, 0.1, 32]} />
          <meshStandardMaterial 
            color="#e5e7eb" 
            emissive="#e5e7eb"
            emissiveIntensity={0.1}
          />
        </mesh>
      </group>

      {/* Table */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial 
          color="#8b5cf6" 
          emissive="#8b5cf6"
          emissiveIntensity={0.1}
        />
      </mesh>
    </>
  );
}

export function FractionPizza() {
  const [slices, setSlices] = useState(8);
  const [selectedSlices, setSelectedSlices] = useState(3);

  const fraction = `${selectedSlices}/${slices}`;
  const decimal = (selectedSlices / slices).toFixed(3);
  const percentage = ((selectedSlices / slices) * 100).toFixed(1);

  // Simplify fraction
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(selectedSlices, slices);
  const simplified = divisor > 1 ? `${selectedSlices / divisor}/${slices / divisor}` : fraction;

  return (
    <div className="w-full h-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Badge className="mb-4 text-lg px-6 py-2 bg-primary/20">
          <Pizza className="mr-2 h-5 w-5" />
          Fraction Pizza
        </Badge>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Fractions, Decimals & Percentages
        </h2>
        <p className="text-muted-foreground text-lg">
          Slice the pizza • See fractions come alive • Convert instantly
        </p>
      </motion.div>

      <Card className="relative h-[500px] bg-gradient-card border-2 border-primary/20 overflow-hidden">
        <Canvas camera={{ position: [0, 4, 6], fov: 50 }}>
          <InteractivePizza slices={slices} selectedSlices={selectedSlices} />
        </Canvas>

        {/* Conversions Display */}
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg border border-primary/20 space-y-2">
          <div className="text-sm font-semibold">
            <span className="text-muted-foreground">Fraction:</span>
            <span className="text-primary ml-2 text-2xl font-mono">{fraction}</span>
          </div>
          {simplified !== fraction && (
            <div className="text-sm font-semibold">
              <span className="text-muted-foreground">Simplified:</span>
              <span className="text-secondary ml-2 text-xl font-mono">{simplified}</span>
            </div>
          )}
          <div className="text-sm font-semibold">
            <span className="text-muted-foreground">Decimal:</span>
            <span className="text-accent ml-2 text-xl font-mono">{decimal}</span>
          </div>
          <div className="text-sm font-semibold">
            <span className="text-muted-foreground">Percentage:</span>
            <span className="text-amber-500 ml-2 text-xl font-mono">{percentage}%</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card border-2 border-primary/20">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <Pizza className="h-4 w-4" />
              Total Slices: {slices}
            </label>
            <Slider
              value={[slices]}
              onValueChange={(val) => {
                setSlices(val[0]);
                // Adjust selected if needed
                if (selectedSlices > val[0]) {
                  setSelectedSlices(val[0]);
                }
              }}
              min={2}
              max={16}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Cut the pizza into more or fewer slices
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Selected Slices: {selectedSlices}
            </label>
            <Slider
              value={[selectedSlices]}
              onValueChange={(val) => setSelectedSlices(val[0])}
              min={0}
              max={slices}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Choose how many slices to take
            </p>
          </div>
        </div>
      </Card>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="p-4 bg-primary/5 border-primary/20">
          <h3 className="font-bold text-primary mb-2">🍕 Fraction</h3>
          <p className="text-sm text-foreground">
            Part of the whole: {selectedSlices} out of {slices} slices
          </p>
        </Card>
        <Card className="p-4 bg-secondary/5 border-secondary/20">
          <h3 className="font-bold text-secondary mb-2">📊 Decimal</h3>
          <p className="text-sm text-foreground">
            Divide numerator by denominator: {decimal}
          </p>
        </Card>
        <Card className="p-4 bg-accent/5 border-accent/20">
          <h3 className="font-bold text-accent mb-2">% Percentage</h3>
          <p className="text-sm text-foreground">
            Out of 100: {percentage}% of the pizza
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
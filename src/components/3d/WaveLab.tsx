import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Wave Lab - Trigonometric sine/cosine waves
export function WaveLab() {
  const wave1Ref = useRef<THREE.Line>(null);
  const wave2Ref = useRef<THREE.Line>(null);
  const wave3Ref = useRef<THREE.Line>(null);

  // Create wave geometries
  const createWave = (amplitude: number, frequency: number, phase: number) => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * 8 - 4;
      const y = amplitude * Math.sin(frequency * x + phase);
      points.push(new THREE.Vector3(x, y, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  };

  const wave1Geometry = useMemo(() => createWave(1, 2, 0), []);
  const wave2Geometry = useMemo(() => createWave(0.7, 3, Math.PI / 4), []);
  const wave3Geometry = useMemo(() => createWave(0.5, 4, Math.PI / 2), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (wave1Ref.current) {
      wave1Ref.current.position.z = Math.sin(time * 0.5) * 0.5 - 2;
    }
    if (wave2Ref.current) {
      wave2Ref.current.position.z = Math.sin(time * 0.7) * 0.5 - 3;
    }
    if (wave3Ref.current) {
      wave3Ref.current.position.z = Math.sin(time * 0.9) * 0.5 - 4;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-5, 0, 0]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[5, 0, 0]} intensity={0.5} color="#06b6d4" />
      
      {/* Wave 1 - Cyan */}
      <primitive object={new THREE.Line(wave1Geometry, new THREE.LineBasicMaterial({ color: '#06b6d4', linewidth: 3, transparent: true, opacity: 0.8 }))} ref={wave1Ref} />
      
      {/* Wave 2 - Violet */}
      <primitive object={new THREE.Line(wave2Geometry, new THREE.LineBasicMaterial({ color: '#8b5cf6', linewidth: 3, transparent: true, opacity: 0.7 }))} ref={wave2Ref} />
      
      {/* Wave 3 - Teal */}
      <primitive object={new THREE.Line(wave3Geometry, new THREE.LineBasicMaterial({ color: '#14b8a6', linewidth: 3, transparent: true, opacity: 0.6 }))} ref={wave3Ref} />
      
      {/* Grid background */}
      <gridHelper args={[8, 16, '#334155', '#1e293b']} position={[0, -2, -3]} />
    </>
  );
}

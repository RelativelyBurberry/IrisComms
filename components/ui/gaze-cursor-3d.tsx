"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";

interface GazeCursor3DProps {
  position: { x: number; y: number };
  isDwelling: boolean;
  dwellProgress: number;
  isVisible: boolean;
}

function GlowingOrb({ progress }: { progress: number }) {
  const meshRef = { current: null as THREE.Mesh | null };

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const color = useMemo(() => {
    if (progress >= 1) return "#10b981";
    if (progress > 0.5) return "#f59e0b";
    return "#4f46e5";
  }, [progress]);

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>

      <mesh scale={1.5 + progress * 0.5}>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3 * (1 - progress * 0.5)}
        />
      </mesh>

      <mesh scale={2 + progress}>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1 * (1 - progress)}
        />
      </mesh>

      {progress > 0 && (
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <ringGeometry args={[0.07, 0.08, 32, 1, 0, Math.PI * 2 * progress]} />
          <meshBasicMaterial
            color={color}
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
    </>
  );
}

function SparkleParticles({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <Sparkles
      count={20}
      scale={0.3}
      size={2}
      speed={0.5}
      opacity={0.8}
      color="#4f46e5"
    />
  );
}

function TrailParticles({ position }: { position: { x: number; y: number } }) {
  return (
    <Sparkles
      count={15}
      scale={0.5}
      size={1.5}
      speed={0.3}
      opacity={0.4}
      color="#EC4899"
    />
  );
}

export function GazeCursor3D({
  position,
  isDwelling,
  dwellProgress,
  isVisible,
}: GazeCursor3DProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 0.5], fov: 75 }}
            gl={{ antialias: true, alpha: true }}
            style={{ width: 80, height: 80 }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 0, 1]} intensity={1} color="#4f46e5" />

            <Float speed={2} rotationIntensity={0} floatIntensity={0.2}>
              <GlowingOrb progress={dwellProgress} />
              <SparkleParticles active={isDwelling} />
              <TrailParticles position={position} />
            </Float>
          </Canvas>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative w-20 h-20">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="rgba(79, 70, 229, 0.2)"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={226}
                  strokeDashoffset={226 - 226 * dwellProgress}
                  style={{
                    filter: "drop-shadow(0 0 6px rgba(79, 70, 229, 0.8))",
                  }}
                />
              </svg>

              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50" />
              </motion.div>
            </div>
          </motion.div>

          {isDwelling && dwellProgress > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                {Math.round(dwellProgress * 100)}%
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}

interface DwellProgressRingProps {
  progress: number;
  size?: number;
}

export function DwellProgressRing({
  progress,
  size = 60,
}: DwellProgressRingProps) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(79, 70, 229, 0.2)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#4f46e5"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.1 }}
        style={{
          filter: "drop-shadow(0 0 8px rgba(79, 70, 229, 0.6))",
        }}
      />
    </svg>
  );
}

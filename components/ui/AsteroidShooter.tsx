"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { useEyeTracking } from "@/hooks/useEyeTracking";
import { Zap, Trophy, Target } from "lucide-react";

interface Asteroid {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
}

export function AsteroidShooter() {
  const { addScore, updateMissionProgress, score, gazePosition } = useAppStore();
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnAsteroid = useCallback(() => {
    const newAsteroid: Asteroid = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * 80 + 10, // 10% to 90%
      y: -10,
      size: Math.random() * 40 + 40,
      speed: Math.random() * 2 + 1,
    };
    setAsteroids((prev) => [...prev, newAsteroid]);
  }, []);

  useEffect(() => {
    if (!gameActive) return;

    const spawnInterval = setInterval(spawnAsteroid, 2000);
    const moveInterval = setInterval(() => {
      setAsteroids((prev) => 
        prev
          .map(a => ({ ...a, y: a.y + a.speed }))
          .filter(a => a.y < 110) // Remove if off screen
      );
    }, 50);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [gameActive, spawnAsteroid]);

  // Check for collisions with gaze
  useEffect(() => {
    if (!gameActive) return;

    const checkCollision = setInterval(() => {
      const gazeX = gazePosition.x * 100;
      const gazeY = gazePosition.y * 100;

      setAsteroids((prev) => {
        const hit = prev.find(a => {
          const dx = a.x - gazeX;
          const dy = a.y - gazeY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < 10; // Collision threshold
        });

        if (hit) {
          addScore(10);
          updateMissionProgress("m2", 1);
          return prev.filter(a => a.id !== hit.id);
        }
        return prev;
      });
    }, 100);

    return () => clearInterval(checkCollision);
  }, [gameActive, gazePosition, addScore, updateMissionProgress]);

  const startGame = () => {
    setGameActive(true);
  };

  const stopGame = () => {
    setGameActive(false);
    setAsteroids([]);
  };

  return (
    <div ref={containerRef} className="relative w-full h-[600px] bg-black/40 rounded-[2.5rem] border border-white/10 overflow-hidden backdrop-blur-3xl">
      <AnimatePresence>
        {!gameActive ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
          >
            <div className="w-24 h-24 rounded-full bg-indigo-600/20 flex items-center justify-center mb-6 border border-indigo-500/30">
              <Target className="w-12 h-12 text-indigo-400" />
            </div>
            <h3 className="text-4xl font-bold text-white mb-4">Asteroid Shooter</h3>
            <p className="text-white/40 max-w-md mb-8">Destroy falling asteroids by simply looking at them. Improve your gaze precision while having fun!</p>
            <button 
              onClick={startGame}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20"
            >
              Start Mission
            </button>
          </motion.div>
        ) : (
          <div className="w-full h-full relative">
            {/* Game UI */}
            <div className="absolute top-6 left-8 flex items-center gap-6 z-20">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-white font-bold">{score}</span>
              </div>
              <button 
                onClick={stopGame}
                className="text-white/40 hover:text-white text-sm font-medium transition-colors"
              >
                Quit Game
              </button>
            </div>

            {/* Asteroids */}
            {asteroids.map((asteroid) => (
              <motion.div
                key={asteroid.id}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                style={{ 
                  left: `${asteroid.x}%`, 
                  top: `${asteroid.y}%`,
                  width: asteroid.size,
                  height: asteroid.size,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl border-2 border-white/10 shadow-lg relative overflow-hidden">
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-black/20 rounded-full" />
                  <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-black/20 rounded-full" />
                </div>
              </motion.div>
            ))}

            {/* Crosshair (Simulation of Gaze) */}
            <motion.div 
              className="absolute w-12 h-12 border-2 border-indigo-500 rounded-full pointer-events-none z-30"
              animate={{ 
                x: gazePosition.x * (containerRef.current?.clientWidth || 0) - 24,
                y: gazePosition.y * (containerRef.current?.clientHeight || 0) - 24,
              }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-indigo-500 rounded-full" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

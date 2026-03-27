"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalibrationDot } from "./calibration-dot";
import { useAppStore } from "@/lib/store";
import { CheckCircle2 } from "lucide-react";

const CALIBRATION_POINTS = [
  { x: 10, y: 10 },   // Top Left
  { x: 90, y: 10 },   // Top Right
  { x: 50, y: 50 },   // Center
  { x: 10, y: 90 },   // Bottom Left
  { x: 90, y: 90 },   // Bottom Right
];

export function CalibrationOverlay() {
  const { setIsCalibrated, setCalibrationProgress } = useAppStore();
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [completedPoints, setCompletedPoints] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const handlePointComplete = useCallback(() => {
    setCompletedPoints((prev) => [...prev, currentPointIndex]);
    setCalibrationProgress(((currentPointIndex + 1) / CALIBRATION_POINTS.length) * 100);

    if (currentPointIndex < CALIBRATION_POINTS.length - 1) {
      setCurrentPointIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      setTimeout(() => {
        setIsCalibrated(true);
      }, 2000);
    }
  }, [currentPointIndex, setIsCalibrated, setCalibrationProgress]);

  // Simulate point completion for now (in a real app, we'd wait for enough gaze samples)
  useEffect(() => {
    if (isFinished) return;

    const timer = setTimeout(() => {
      handlePointComplete();
    }, 3000); // 3 seconds per point

    return () => clearTimeout(timer);
  }, [currentPointIndex, handlePointComplete, isFinished]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center">
      <AnimatePresence>
        {!isFinished ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full relative"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Calibration</h2>
              <p className="text-white/60">Stare at the glowing dot until it moves</p>
            </div>

            {CALIBRATION_POINTS.map((point, index) => (
              <CalibrationDot
                key={index}
                x={point.x}
                y={point.y}
                isActive={index === currentPointIndex}
                isCompleted={completedPoints.includes(index)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-8 glass-card rounded-3xl border border-white/20"
          >
            <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Success!</h2>
            <p className="text-white/60">Your eyes are now perfectly tracked.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

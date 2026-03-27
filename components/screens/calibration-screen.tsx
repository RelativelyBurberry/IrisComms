"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Eye, Check, RotateCcw, Camera } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GazeButton } from "@/components/ui/gaze-button";
import { CalibrationDot } from "@/components/ui/calibration-dot";
import { useAppStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress";

const calibrationPoints = [
  { x: 50, y: 15 },
  { x: 15, y: 50 },
  { x: 85, y: 50 },
  { x: 50, y: 85 },
  { x: 50, y: 50 },
];

export function CalibrationScreen() {
  const {
    setIsCalibrated,
    setCurrentScreen,
    calibrationProgress,
    setCalibrationProgress,
  } = useAppStore();
  const [currentPoint, setCurrentPoint] = useState(-1);
  const [completedPoints, setCompletedPoints] = useState<number[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const startCalibration = useCallback(() => {
    setIsCalibrating(true);
    setCurrentPoint(0);
    setCompletedPoints([]);
    setCalibrationProgress(0);
  }, [setCalibrationProgress]);

  const resetCalibration = useCallback(() => {
    setIsCalibrating(false);
    setCurrentPoint(-1);
    setCompletedPoints([]);
    setCalibrationProgress(0);
    setShowSuccess(false);
  }, [setCalibrationProgress]);

  useEffect(() => {
    if (!isCalibrating || currentPoint < 0) return;

    const timer = setTimeout(() => {
      if (currentPoint < calibrationPoints.length - 1) {
        setCompletedPoints((prev) => [...prev, currentPoint]);
        setCurrentPoint((prev) => prev + 1);
        setCalibrationProgress(
          ((currentPoint + 1) / calibrationPoints.length) * 100,
        );
      } else {
        setCompletedPoints((prev) => [...prev, currentPoint]);
        setCalibrationProgress(100);
        setIsCalibrating(false);
        setShowSuccess(true);

        setTimeout(() => {
          setIsCalibrated(true);
          setCurrentScreen("communication");
        }, 2000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    currentPoint,
    isCalibrating,
    setCalibrationProgress,
    setIsCalibrated,
    setCurrentScreen,
  ]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <AnimatePresence mode="wait">
        {!isCalibrating && !showSuccess ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 mb-8 animate-pulse-glow"
            >
              <Eye className="w-12 h-12 text-primary" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Eye Calibration
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Follow the dots with your eyes to calibrate the eye tracking
              system. This ensures accurate gaze detection for seamless
              communication.
            </p>

            <GlassCard variant="subtle" className="mb-8 text-left">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Instructions
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                    1
                  </span>
                  <span>
                    Position yourself comfortably in front of the camera
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                    2
                  </span>
                  <span>
                    Follow each dot with your eyes as it appears on screen
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                    3
                  </span>
                  <span>Keep your head still and only move your eyes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                    4
                  </span>
                  <span>The calibration will complete automatically</span>
                </li>
              </ul>
            </GlassCard>

            <GazeButton
              variant="primary"
              size="xl"
              onClick={startCalibration}
              onGazeSelect={startCalibration}
              className="w-full max-w-sm"
            >
              <Eye className="w-6 h-6" />
              Start Calibration
            </GazeButton>
          </motion.div>
        ) : showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-accent/20 mb-8"
            >
              <Check className="w-16 h-16 text-accent" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-accent">
              Calibration Complete!
            </h2>
            <p className="text-lg text-muted-foreground">
              Redirecting to communication screen...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="calibrating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col"
          >
            {/* Progress bar */}
            <div className="absolute top-4 left-4 right-4 z-10">
              <GlassCard variant="subtle" className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Calibration Progress
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {completedPoints.length + 1} / {calibrationPoints.length}
                  </span>
                </div>
                <Progress value={calibrationProgress} className="h-2" />
              </GlassCard>
            </div>

            {/* Calibration dots */}
            <div className="flex-1 relative">
              {calibrationPoints.map((point, index) => (
                <CalibrationDot
                  key={index}
                  x={point.x}
                  y={point.y}
                  isActive={currentPoint === index}
                  isCompleted={completedPoints.includes(index)}
                />
              ))}
            </div>

            {/* Reset button */}
            <div className="absolute bottom-24 left-4 right-4">
              <GazeButton
                variant="default"
                size="md"
                onClick={resetCalibration}
                onGazeSelect={resetCalibration}
                className="w-full max-w-xs mx-auto"
              >
                <RotateCcw className="w-5 h-5" />
                Reset Calibration
              </GazeButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

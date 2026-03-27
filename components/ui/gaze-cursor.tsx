"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface GazeCursorProps {
  gazePosition?: { x: number; y: number };
  isTracking?: boolean;
  dwellProgress?: number;
  isDwelling?: boolean;
  onGazeSelect?: () => void;
  dwellTime?: number;
  className?: string;
}

export function GazeCursor({
  gazePosition = { x: 0.5, y: 0.5 },
  isTracking = false,
  dwellProgress = 0,
  isDwelling = false,
  onGazeSelect,
  dwellTime = 800,
  className,
}: GazeCursorProps) {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const [showCursor, setShowCursor] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  const lastGazeRef = useRef<{ x: number; y: number } | null>(null);
  const stabilityRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const screenX = gazePosition.x * window.innerWidth;
    const screenY = gazePosition.y * window.innerHeight;

    cursorX.set(screenX);
    cursorY.set(screenY);

    if (
      !lastGazeRef.current ||
      Math.abs(lastGazeRef.current.x - gazePosition.x) > 0.02 ||
      Math.abs(lastGazeRef.current.y - gazePosition.y) > 0.02
    ) {
      lastGazeRef.current = { x: gazePosition.x, y: gazePosition.y };
      stabilityRef.current = 0;
      setGlowIntensity(0.5);
    } else {
      stabilityRef.current = Math.min(stabilityRef.current + 0.05, 1);
      setGlowIntensity(0.5 + stabilityRef.current * 0.5);
    }

    if (!showCursor) {
      setShowCursor(true);
    }
  }, [gazePosition, cursorX, cursorY, showCursor]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isTracking) {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
        setShowCursor(true);
      }
    };

    if (!isTracking) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [isTracking, cursorX, cursorY]);

  const circumference = 2 * Math.PI * 24;
  const strokeDashoffset = circumference - dwellProgress * circumference;

  return (
    <AnimatePresence>
      {showCursor && (
        <>
          <motion.div
            className={cn(
              "fixed top-0 left-0 pointer-events-none z-[9999]",
              className,
            )}
            style={{
              x: cursorXSpring,
              y: cursorYSpring,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: isTracking ? 1 : 0.7, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <motion.div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                animate={{
                  boxShadow: [
                    `0 0 ${10 + glowIntensity * 20}px rgba(79, 70, 229, ${0.3 + glowIntensity * 0.4})`,
                    `0 0 ${20 + glowIntensity * 30}px rgba(139, 92, 246, ${0.4 + glowIntensity * 0.3})`,
                    `0 0 ${10 + glowIntensity * 20}px rgba(79, 70, 229, ${0.3 + glowIntensity * 0.4})`,
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  className="w-full h-full rounded-full border-2 border-indigo-500/60 backdrop-blur-sm"
                  animate={{
                    scale: isDwelling ? [1, 1.1, 1] : [1, 1.05, 1],
                    borderColor: isDwelling
                      ? [
                          "rgba(139, 92, 246, 0.6)",
                          "rgba(236, 72, 153, 0.8)",
                          "rgba(139, 92, 246, 0.6)",
                        ]
                      : [
                          "rgba(79, 70, 229, 0.6)",
                          "rgba(99, 102, 241, 0.8)",
                          "rgba(79, 70, 229, 0.6)",
                        ],
                  }}
                  transition={{
                    duration: isDwelling ? 0.5 : 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500"
                  animate={{
                    scale: isDwelling ? [1, 1.3, 1] : [1, 1.1, 1],
                    opacity: isDwelling ? [0.8, 1, 0.8] : [0.6, 0.8, 0.6],
                  }}
                  transition={{
                    duration: isDwelling ? 0.3 : 1.5,
                    repeat: Infinity,
                  }}
                />
              </div>

              {isDwelling && (
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 48 48"
                >
                  <circle
                    cx="24"
                    cy="24"
                    r="22"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="2"
                  />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="22"
                    fill="none"
                    stroke="url(#dwellGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(139, 92, 246, 0.8))",
                    }}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.1 }}
                  />
                  <defs>
                    <linearGradient
                      id="dwellGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
            </div>
          </motion.div>

          <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9998]"
            style={{
              x: cursorXSpring,
              y: cursorYSpring,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isTracking ? 0.3 : 0.15 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-2xl"
              animate={{
                scale: isDwelling ? [1, 1.3, 1] : [1, 1.2, 1],
                opacity: isDwelling ? [0.4, 0.6, 0.4] : [0.2, 0.4, 0.2],
              }}
              transition={{ duration: isDwelling ? 0.5 : 2, repeat: Infinity }}
            />
          </motion.div>

          {isTracking && (
            <motion.div
              className="fixed top-0 left-0 pointer-events-none z-[9997]"
              style={{
                x: cursorXSpring,
                y: cursorYSpring,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
            >
              <motion.div
                className="w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

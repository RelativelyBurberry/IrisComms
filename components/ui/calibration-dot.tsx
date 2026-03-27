"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CalibrationDotProps {
  x: number;
  y: number;
  isActive?: boolean;
  isCompleted?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function CalibrationDot({ 
  x, 
  y, 
  isActive = false, 
  isCompleted = false,
  className 
}: CalibrationDotProps) {
  return (
    <motion.div
      className={cn(
        "absolute w-12 h-12 rounded-full flex items-center justify-center",
        className
      )}
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isActive ? [1, 1.2, 1] : 1,
        opacity: 1,
      }}
      transition={{ 
        scale: { duration: 1, repeat: isActive ? Infinity : 0 },
        opacity: { duration: 0.3 }
      }}
    >
      {/* Outer ring */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full border-2",
          isCompleted ? "border-accent bg-accent/20" : "border-primary",
          isActive && "animate-pulse-glow"
        )}
      />
      
      {/* Inner dot */}
      <motion.div
        className={cn(
          "w-4 h-4 rounded-full",
          isCompleted ? "bg-accent" : "bg-primary"
        )}
        animate={isActive ? {
          scale: [1, 1.5, 1],
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      {/* Progress ring for active state */}
      {isActive && (
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <motion.circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
            strokeDasharray="138"
            initial={{ strokeDashoffset: 138 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2, ease: "linear" }}
          />
        </svg>
      )}
    </motion.div>
  );
}

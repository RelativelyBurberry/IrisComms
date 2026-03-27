"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpeechWaveProps {
  isActive?: boolean;
  barCount?: number;
  className?: string;
}

export function SpeechWave({ isActive = false, barCount = 5, className }: SpeechWaveProps) {
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-primary"
          initial={{ height: 8 }}
          animate={isActive ? {
            height: [8, 24, 8, 32, 8],
          } : { height: 8 }}
          transition={{
            duration: 0.8,
            repeat: isActive ? Infinity : 0,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

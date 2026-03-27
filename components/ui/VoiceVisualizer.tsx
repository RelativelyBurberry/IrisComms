"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export function VoiceVisualizer({ isSpeaking }: { isSpeaking: boolean }) {
  const particles = Array.from({ length: 12 });
  
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          animate={isSpeaking ? {
            height: [8, Math.random() * 40 + 10, 8],
            backgroundColor: ["#4F46E5", "#EC4899", "#4F46E5"],
          } : {
            height: 4,
            backgroundColor: "#4F46E5",
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.05,
            ease: "easeInOut",
          }}
          className="w-1.5 rounded-full"
        />
      ))}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  text: string;
  className?: string;
  showCursor?: boolean;
}

export function TypingIndicator({ text, className, showCursor = true }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <span className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-wide">
        {text}
      </span>
      {showCursor && (
        <motion.span
          className="ml-1 w-1 h-10 md:h-12 bg-primary rounded-full"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </div>
  );
}

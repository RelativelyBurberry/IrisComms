"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { forwardRef, HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong" | "subtle";
  glow?: boolean;
  hoverEffect?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glow = false, hoverEffect = true, children, ...props }, ref) => {
    const variants = {
      default: "glass",
      strong: "glass-strong",
      subtle: "bg-card/30 backdrop-blur-sm border border-border/50",
    };

    // Filter out React/DOM event handler props that conflict with framer-motion
    const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={hoverEffect ? { scale: 1.02, y: -5 } : undefined}
        className={cn(
          "rounded-2xl p-6",
          variants[variant],
          glow && "animate-pulse-glow",
          hoverEffect && "transition-all duration-300 cursor-pointer",
          className
        )}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

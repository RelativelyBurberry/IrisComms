"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "strong" | "subtle";
  glow?: boolean;
  hoverEffect?: boolean;
  children: React.ReactNode;
}

export function GlassCard({
  className,
  variant = "default",
  glow = false,
  hoverEffect = true,
  children,
  ...props
}: GlassCardProps) {
  const variants = {
    default: "bg-card/40 backdrop-blur-xl border border-white/10",
    strong: "bg-card/60 backdrop-blur-2xl border border-white/20",
    subtle: "bg-card/20 backdrop-blur-lg border border-white/5",
  };

  return (
    <motion.div
      className={cn(
        "rounded-3xl p-6 overflow-hidden relative",
        "transition-all duration-500 ease-out",
        variants[variant],
        glow && "shadow-[0_0_40px_rgba(79,70,229,0.3)]",
        hoverEffect && "hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(79,70,229,0.4)] cursor-pointer",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={hoverEffect ? { scale: 1.02 } : undefined}
      {...props}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Glow effect */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-50 blur-3xl pointer-events-none animate-pulse" />
      )}
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

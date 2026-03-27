"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useRef, useEffect, ButtonHTMLAttributes, forwardRef } from "react";

interface GazeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "emergency" | "success";
  size?: "sm" | "md" | "lg" | "xl";
  dwellTime?: number;
  onGazeSelect?: () => void;
  showProgress?: boolean;
}

export const GazeButton = forwardRef<HTMLButtonElement, GazeButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "lg",
    dwellTime = 1500,
    onGazeSelect,
    showProgress = true,
    children, 
    onClick,
    ...props 
  }, ref) => {
    const [isHovering, setIsHovering] = useState(false);
    const [progress, setProgress] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const animationRef = useRef<number | null>(null);

    const variants = {
      default: "bg-card/50 border-border hover:bg-card/80 text-foreground",
      primary: "bg-primary/80 border-primary hover:bg-primary text-primary-foreground",
      secondary: "bg-secondary/80 border-secondary hover:bg-secondary text-secondary-foreground",
      emergency: "bg-destructive/80 border-destructive hover:bg-destructive text-destructive-foreground",
      success: "bg-accent/80 border-accent hover:bg-accent text-accent-foreground",
    };

    const sizes = {
      sm: "min-h-12 px-4 text-sm",
      md: "min-h-16 px-6 text-base",
      lg: "min-h-20 px-8 text-lg",
      xl: "min-h-24 px-10 text-xl",
    };

    useEffect(() => {
      if (isHovering && onGazeSelect) {
        startTimeRef.current = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTimeRef.current;
          const newProgress = Math.min((elapsed / dwellTime) * 100, 100);
          setProgress(newProgress);
          
          if (newProgress >= 100) {
            onGazeSelect();
            setIsHovering(false);
            setProgress(0);
          } else {
            animationRef.current = requestAnimationFrame(animate);
          }
        };
        
        animationRef.current = requestAnimationFrame(animate);
      } else {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        setProgress(0);
      }

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }, [isHovering, dwellTime, onGazeSelect]);

    // Filter out React/DOM event handler props that conflict with framer-motion
    const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any;
    
    return (
      <motion.button
        ref={ref}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 backdrop-blur-sm font-medium",
          "transition-all duration-300 ease-out",
          "focus:outline-none focus:ring-4 focus:ring-ring/50",
          variants[variant],
          sizes[size],
          className
        )}
        {...motionProps}
      >
        {/* Progress indicator */}
        {showProgress && isHovering && (
          <motion.div
            className="absolute inset-0 bg-foreground/20"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            style={{ transformOrigin: "left" }}
          />
        )}
        
        {/* Glow ring */}
        {isHovering && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            initial={{ boxShadow: "0 0 0 0 rgba(79, 70, 229, 0)" }}
            animate={{ 
              boxShadow: [
                "0 0 0 0 rgba(79, 70, 229, 0.4)",
                "0 0 0 8px rgba(79, 70, 229, 0)",
              ]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        
        <span className="relative z-10 flex items-center justify-center gap-3">
          {children}
        </span>
      </motion.button>
    );
  }
);

GazeButton.displayName = "GazeButton";

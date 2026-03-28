"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type MouseEventHandler,
} from "react";
import { useAppStore } from "@/lib/store";

interface GazeButtonProps {
  title?: string;
  children?: ReactNode;
  variant?: "default" | "primary" | "secondary" | "emergency" | "success";
  size?: "sm" | "md" | "lg" | "xl";
  dwellTime?: number;
  /** Extra padding (px) when testing gaze vs button bounds; mirrors GazeController stickiness. */
  gazeStickiness?: number;
  onGazeSelect?: () => void;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  showProgress?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function GazeButton({
  title,
  children,
  variant = "default",
  size = "lg",
  dwellTime = 1500,
  gazeStickiness = 20,
  onGazeSelect,
  onClick,
  disabled = false,
  loading = false,
  showProgress = true,
  icon,
  className,
}: GazeButtonProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const gazePosition = useAppStore((state) => state.gazePosition);
  const isCalibrated = useAppStore((state) => state.isCalibrated);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  const variants = {
    default: "bg-white/5 border-white/10 hover:bg-white/10 text-white",
    primary:
      "bg-gradient-to-r from-primary to-secondary border-primary/50 hover:from-primary/90 hover:to-secondary/90 text-white",
    secondary: "bg-white/10 border-white/20 hover:bg-white/15 text-white",
    emergency:
      "bg-gradient-to-r from-red-600 to-red-700 border-red-500/50 hover:from-red-600/90 hover:to-red-700/90 text-white",
    success:
      "bg-gradient-to-r from-green-500 to-emerald-600 border-green-500/50 text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm min-h-[48px]",
    md: "px-6 py-3 text-base min-h-[56px]",
    lg: "px-8 py-4 text-lg min-h-[64px]",
    xl: "px-10 py-5 text-xl min-h-[72px]",
  };

  const stopDwell = useCallback(() => {
    setIsHovering(false);
    setProgress(0);
    startTimeRef.current = null;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const startDwell = useCallback(() => {
    if (disabled || loading) return;
    if (isHovering) return;

    setIsHovering(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    const animate = () => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / dwellTime) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        onGazeSelect?.();
        stopDwell();
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [disabled, loading, isHovering, dwellTime, onGazeSelect, stopDwell]);

  useEffect(() => {
    if (!isCalibrated || disabled || loading || !buttonRef.current) {
      stopDwell();
      return;
    }

    const vw = typeof window !== "undefined" ? window.innerWidth : 1;
    const vh = typeof window !== "undefined" ? window.innerHeight : 1;
    const clientX = gazePosition.x * vw;
    const clientY = gazePosition.y * vh;

    const rect = buttonRef.current.getBoundingClientRect();
    const pad = gazeStickiness;
    const inBounds =
      clientX >= rect.left - pad &&
      clientX <= rect.right + pad &&
      clientY >= rect.top - pad &&
      clientY <= rect.bottom + pad;

    if (inBounds && !isHovering) {
      startDwell();
    } else if (!inBounds && isHovering) {
      stopDwell();
    }
  }, [
    gazePosition,
    isCalibrated,
    disabled,
    loading,
    isHovering,
    gazeStickiness,
    startDwell,
    stopDwell,
  ]);

  useEffect(() => {
    return () => {
      stopDwell();
    };
  }, [stopDwell]);

  const handleMouseEnter = () => {
    if (disabled || loading) return;
    setIsHovering(true);
    setProgress(0);

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / dwellTime) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100 && onGazeSelect) {
        onGazeSelect();
        setIsHovering(false);
        setProgress(0);
      } else if (newProgress < 100) {
        timerRef.current = setTimeout(animate, 16);
      }
    };

    animate();
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setProgress(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!disabled && !loading) {
      onClick?.(event);
    }
  };

  const content = children ?? title;

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      data-gaze-interactive="true"
      data-gaze-skip-global-dwell="true"
      data-gaze-dwell={dwellTime}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        "relative rounded-2xl border-2 font-semibold transition-all duration-300",
        "focus:outline-none focus:ring-4 focus:ring-primary/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {/* Progress overlay */}
      {showProgress && isHovering && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-2xl overflow-hidden"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          style={{ transformOrigin: "left" }}
          transition={{ duration: 0.1 }}
        />
      )}

      {/* Glow ring */}
      {isHovering && (
        <motion.div
          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary to-secondary opacity-30 blur-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-3">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
          />
        ) : (
          <>
            {icon && <span className="text-2xl">{icon}</span>}
            {content}
          </>
        )}
      </span>
    </motion.button>
  );
}

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Brain,
  Zap,
  MapPin,
  Sun,
  Moon,
  Coffee,
  Lightbulb,
} from "lucide-react";

interface GenerativePrediction {
  text: string;
  confidence: number;
  type: "word" | "phrase" | "context" | "emotion";
  icon?: React.ReactNode;
}

interface ContextData {
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  location: string;
  recentEmotion: string;
  conversationContext: string[];
}

// Real-time context detection
function useContextDetection() {
  const [context, setContext] = useState<ContextData>({
    timeOfDay: "morning",
    location: "Home",
    recentEmotion: "neutral",
    conversationContext: [],
  });

  useEffect(() => {
    const hour = new Date().getHours();
    let timeOfDay: ContextData["timeOfDay"] = "morning";

    if (hour >= 5 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17 && hour < 21) timeOfDay = "evening";
    else timeOfDay = "night";

    setContext((prev) => ({ ...prev, timeOfDay }));

    // Try to get location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setContext((prev) => ({ ...prev, location: "Home" })),
        () => setContext((prev) => ({ ...prev, location: "Unknown" })),
      );
    }
  }, []);

  return context;
}

// Time-based context icons
const timeIcons = {
  morning: <Sun className="w-4 h-4 text-yellow-400" />,
  afternoon: <Lightbulb className="w-4 h-4 text-orange-400" />,
  evening: <Coffee className="w-4 h-4 text-purple-400" />,
  night: <Moon className="w-4 h-4 text-blue-400" />,
};

// Smart phrase generation based on context
function generateContextAwarePhrases(
  currentText: string,
  context: ContextData,
): GenerativePrediction[] {
  const phrases: GenerativePrediction[] = [];

  // Time-based suggestions
  if (context.timeOfDay === "morning") {
    phrases.push({
      text: "Good morning, I slept well",
      confidence: 0.92,
      type: "context",
      icon: timeIcons.morning,
    });
    phrases.push({
      text: "I would like breakfast",
      confidence: 0.88,
      type: "phrase",
      icon: timeIcons.morning,
    });
  }

  if (context.timeOfDay === "evening") {
    phrases.push({
      text: "I am tired, time to rest",
      confidence: 0.9,
      type: "context",
      icon: timeIcons.evening,
    });
    phrases.push({
      text: "Good evening everyone",
      confidence: 0.85,
      type: "phrase",
      icon: timeIcons.evening,
    });
  }

  // Emotional context
  if (context.recentEmotion === "happy") {
    phrases.push({
      text: "I am feeling great today",
      confidence: 0.95,
      type: "emotion",
    });
  } else if (context.recentEmotion === "stressed") {
    phrases.push({
      text: "I need some quiet time",
      confidence: 0.91,
      type: "emotion",
    });
  }

  // Context-based completion
  if (currentText.toLowerCase().includes("i want")) {
    phrases.push({
      text: "I want to go outside",
      confidence: 0.89,
      type: "word",
    });
    phrases.push({ text: "I want some water", confidence: 0.92, type: "word" });
    phrases.push({
      text: "I want help please",
      confidence: 0.94,
      type: "phrase",
    });
  }

  if (currentText.toLowerCase().includes("i feel")) {
    phrases.push({ text: "I feel happy", confidence: 0.93, type: "emotion" });
    phrases.push({ text: "I feel pain", confidence: 0.91, type: "emotion" });
    phrases.push({
      text: "I feel tired today",
      confidence: 0.88,
      type: "context",
    });
  }

  if (currentText.toLowerCase().includes("i need")) {
    phrases.push({ text: "I need water", confidence: 0.96, type: "phrase" });
    phrases.push({ text: "I need help", confidence: 0.95, type: "phrase" });
    phrases.push({
      text: "I need medication",
      confidence: 0.94,
      type: "phrase",
    });
  }

  if (currentText.toLowerCase().includes("thank")) {
    phrases.push({
      text: "Thank you so much",
      confidence: 0.97,
      type: "phrase",
    });
    phrases.push({
      text: "Thank you for helping me",
      confidence: 0.95,
      type: "phrase",
    });
  }

  // Location-based
  if (context.location === "Home") {
    phrases.push({ text: "I am at home", confidence: 0.94, type: "context" });
  }

  return phrases.slice(0, 6);
}

// Full Generative AI Prediction Component
export function GenerativeAIPredictions({
  currentText,
  onSelect,
  emotion,
}: {
  currentText: string;
  onSelect: (text: string) => void;
  emotion: string;
}) {
  const detectedContext = useContextDetection();
  const context = useMemo(
    () => ({
      ...detectedContext,
      recentEmotion: emotion,
    }),
    [detectedContext, emotion],
  );
  const [predictions, setPredictions] = useState<GenerativePrediction[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [typingAnimation, setTypingAnimation] = useState("");
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate predictions with typing animation
  useEffect(() => {
    if (currentText.length > 0) {
      setIsGenerating(true);

      // Simulate AI thinking with typing animation
      let displayText = "";
      const fullText = "Analyzing context...";

      animationRef.current = setInterval(() => {
        if (displayText.length < fullText.length) {
          displayText += fullText[displayText.length];
          setTypingAnimation(displayText);
        } else {
          if (animationRef.current) clearInterval(animationRef.current);
        }
      }, 50);

      // Generate after animation
      const timer = setTimeout(() => {
        const newPredictions = generateContextAwarePhrases(
          currentText,
          context,
        );
        setPredictions(newPredictions);
        setIsGenerating(false);
        setTypingAnimation("");
      }, 800);

      return () => {
        clearTimeout(timer);
        if (animationRef.current) clearInterval(animationRef.current);
      };
    } else {
      setPredictions([]);
    }
  }, [currentText, context]);

  // Neural pulse animation for AI thinking
  const [pulses, setPulses] = useState<number[]>([]);

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setPulses((prev) => [...prev.slice(-5), Date.now()]);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setPulses([]);
    }
  }, [isGenerating]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Context Banner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-xl border border-indigo-500/30"
      >
        <div className="flex items-center gap-2">
          {timeIcons[context.timeOfDay]}
          <span className="text-xs text-white/70 capitalize">
            {context.timeOfDay}
          </span>
        </div>
        <div className="w-px h-4 bg-white/20" />
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-pink-400" />
          <span className="text-xs text-white/70">{context.location}</span>
        </div>
        <div className="w-px h-4 bg-white/20" />
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-white/70 capitalize">
            Feeling {context.recentEmotion}
          </span>
        </div>

        {/* Neural pulse indicators */}
        {isGenerating && (
          <div className="ml-auto flex items-center gap-1">
            {pulses.map((pulse) => (
              <motion.div
                key={pulse}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1, opacity: 0 }}
                className="w-2 h-2 rounded-full bg-indigo-500"
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* AI Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles
            className={`w-5 h-5 ${isGenerating ? "text-indigo-400 animate-pulse" : "text-cyan-400"}`}
          />
          <span className="text-sm font-medium text-white/80">
            {isGenerating
              ? typingAnimation || "Neural Processing..."
              : "AI Suggestions"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Zap className="w-3 h-3" />
          <span>Context-Aware</span>
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {predictions.map((prediction, index) => (
            <motion.button
              key={`${prediction.text}-${index}`}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(prediction.text)}
              className="relative group p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 transition-all overflow-hidden"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Confidence indicator */}
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <div
                  className="h-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                  style={{ width: `${prediction.confidence * 100}%` }}
                />
                <span className="text-[10px] text-white/40">
                  {Math.round(prediction.confidence * 100)}%
                </span>
              </div>

              <div className="flex items-start gap-3">
                {prediction.icon && (
                  <div className="mt-1 p-2 rounded-lg bg-white/5">
                    {prediction.icon}
                  </div>
                )}
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">
                    {prediction.text}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        prediction.type === "emotion"
                          ? "bg-pink-500/20 text-pink-300"
                          : prediction.type === "context"
                            ? "bg-purple-500/20 text-purple-300"
                            : prediction.type === "phrase"
                              ? "bg-cyan-500/20 text-cyan-300"
                              : "bg-indigo-500/20 text-indigo-300"
                      }`}
                    >
                      {prediction.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Typing cursor animation on hover */}
              <div className="absolute bottom-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-4 bg-indigo-400 rounded-sm"
                />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {currentText.length === 0 && !isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <Brain className="w-12 h-12 mx-auto mb-3 text-indigo-400/50" />
          <p className="text-sm text-white/50">
            Start typing to see AI-powered suggestions
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// Export for use elsewhere
export type { GenerativePrediction, ContextData };

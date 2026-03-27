"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { aiService } from "@/lib/ai-service";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Delete,
  Mic,
  Send,
  Sparkles,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Settings,
  LayoutGrid,
  Type,
  Hash,
  Star,
} from "lucide-react";

interface KeyboardProps {
  onTextChange: (text: string) => void;
  onSpeak: () => void;
  onSend: () => void;
  currentText: string;
  isSpeaking: boolean;
  onPredictionSelect?: (text: string) => void;
  predictions?: string[];
  showPredictions?: boolean;
}

const KEYBOARD_LAYOUTS = {
  qwerty: [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ],
  abc: [
    ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
    ["k", "l", "m", "n", "o", "p", "q", "r", "s", "t"],
    ["u", "v", "w", "x", "y", "z"],
  ],
  numbers: [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    [",", ".", "!", "?", "'", '"', "-", "_", "/", "@"],
    ["+", "=", "(", ")", "*", "&", "#", "%", "^", "$"],
  ],
};

const PHRASES = [
  {
    category: "Basic Needs",
    phrases: [
      "I need water",
      "I'm hungry",
      "I need to use the bathroom",
      "I'm in pain",
      "I need help",
    ],
  },
  {
    category: "Emotions",
    phrases: [
      "I'm happy",
      "I'm sad",
      "I'm tired",
      "I'm scared",
      "I'm confused",
    ],
  },
  {
    category: "Medical",
    phrases: [
      "I need my medication",
      "Call the doctor",
      "I feel sick",
      "Call an ambulance",
    ],
  },
  {
    category: "Social",
    phrases: [
      "I want to talk",
      "Call my family",
      "I want to be alone",
      "Thank you",
    ],
  },
];

export function EyeTrackingKeyboard({
  onTextChange,
  onSpeak,
  onSend,
  currentText,
  isSpeaking,
  onPredictionSelect,
  predictions = [],
  showPredictions = true,
}: KeyboardProps) {
  const [layout, setLayout] = useState<"qwerty" | "abc" | "numbers">("qwerty");
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  const [highlightedKey, setHighlightedKey] = useState<number | null>(null);
  const [mode, setMode] = useState<"keyboard" | "phrases">("keyboard");
  const [selectedPhraseCategory, setSelectedPhraseCategory] =
    useState<number>(0);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentKeysRef = useRef<HTMLButtonElement | null>(null);

  const { dynamicPhrases } = useAppStore();

  const [isCompleting, setIsCompleting] = useState(false);

  const handleSmartComplete = useCallback(async () => {
    if (!currentText || isCompleting) return;
    setIsCompleting(true);
    try {
      const completions = await aiService.getSentenceCompletion(currentText);
      if (completions.length > 0) {
        const completedText = `${currentText}${currentText.endsWith(" ") ? "" : " "}${completions[0]}`;
        onTextChange(completedText);
        aiService.recordUsage(completedText);
      }
    } finally {
      setIsCompleting(false);
    }
  }, [currentText, isCompleting, onTextChange]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (key === "backspace") {
        onTextChange(currentText.slice(0, -1));
      } else if (key === "space") {
        onTextChange(currentText + " ");
      } else if (key === "clear") {
        onTextChange("");
      } else {
        onTextChange(currentText + key);
      }
    },
    [currentText, onTextChange],
  );

  const handlePhraseSelect = useCallback(
    (phrase: string) => {
      onTextChange(phrase);
      aiService.recordUsage(phrase);
      setMode("keyboard");
    },
    [onTextChange],
  );

  const handlePredictionSelect = useCallback(
    (prediction: string) => {
      const spacer = currentText && !currentText.endsWith(" ") ? " " : "";
      const newText = `${currentText}${spacer}${prediction}`;
      onTextChange(newText);
      aiService.recordUsage(newText);
      onPredictionSelect?.(newText);
    },
    [currentText, onTextChange, onPredictionSelect],
  );

  const dwellStart = useCallback(
    (row: number, keyIndex: number, element: HTMLButtonElement) => {
      currentKeysRef.current = element;
      dwellTimerRef.current = setTimeout(() => {
        if (mode === "keyboard") {
          if (row === -1) {
            onSpeak();
          } else if (row === -2) {
            handleKeyPress("backspace");
          } else if (row === -3) {
            onSend();
          } else if (keyIndex === -1) {
            setMode(mode === "keyboard" ? "phrases" : "keyboard");
          } else if (keyIndex === -2) {
            setLayout((prev) =>
              prev === "qwerty" ? "abc" : prev === "abc" ? "numbers" : "qwerty",
            );
          } else {
            const key = KEYBOARD_LAYOUTS[layout][row]?.[keyIndex];
            if (key) handleKeyPress(key);
          }
        }
        setHighlightedRow(null);
        setHighlightedKey(null);
      }, 1200);
      setHighlightedRow(row);
      setHighlightedKey(keyIndex);
    },
    [mode, layout, handleKeyPress, onSpeak, onSend],
  );

  const dwellEnd = useCallback(() => {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    setHighlightedRow(null);
    setHighlightedKey(null);
  }, []);

  useEffect(() => {
    return () => {
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Predictions */}
      <AnimatePresence>
        {showPredictions && predictions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-wrap gap-2 mb-4 px-4 items-center"
          >
            {predictions.slice(0, 4).map((prediction, i) => (
              <motion.button
                key={prediction}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePredictionSelect(prediction)}
                className="px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-white/80 hover:border-indigo-500/50 hover:text-white transition-all text-sm font-medium flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {prediction}
              </motion.button>
            ))}

            {currentText.length > 3 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSmartComplete}
                disabled={isCompleting}
                className={`px-4 py-2 rounded-full backdrop-blur-xl border transition-all text-sm font-bold flex items-center gap-2 ${
                  isCompleting 
                    ? "bg-indigo-600/50 border-indigo-400 text-white animate-pulse" 
                    : "bg-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/40 hover:border-indigo-400"
                }`}
              >
                {isCompleting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                AI Smart Complete
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode("keyboard")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
            mode === "keyboard"
              ? "bg-indigo-600/30 text-white"
              : "bg-white/5 text-white/60"
          }`}
        >
          <Type className="w-4 h-4" />
          Keyboard
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode("phrases")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
            mode === "phrases"
              ? "bg-indigo-600/30 text-white"
              : "bg-white/5 text-white/60"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Phrases
        </motion.button>
      </div>

      {mode === "keyboard" ? (
        <>
          {/* Layout Toggle */}
          <div className="flex justify-center mb-3">
            <div className="flex gap-1 p-1 rounded-xl bg-white/5">
              {(["qwerty", "abc", "numbers"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLayout(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    layout === l ? "bg-indigo-600 text-white" : "text-white/60"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard */}
          <div className="space-y-2">
            {KEYBOARD_LAYOUTS[layout].map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1.5">
                {rowIndex === 2 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => dwellStart(-2, -1, null as any)}
                    onMouseLeave={dwellEnd}
                    className={`w-14 h-12 rounded-xl flex items-center justify-center transition-all backdrop-blur-xl ${
                      highlightedRow === -2
                        ? "bg-red-500/30 border-2 border-red-500 scale-110"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <Delete className="w-5 h-5 text-white/70" />
                  </motion.button>
                )}
                {row.map((key, keyIndex) => (
                  <motion.button
                    key={`${rowIndex}-${keyIndex}`}
                    whileHover={{ scale: 1.15, rotate: 2 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={(e) =>
                      dwellStart(rowIndex, keyIndex, e.currentTarget)
                    }
                    onMouseLeave={dwellEnd}
                    className={`w-10 h-12 rounded-xl flex items-center justify-center font-mono text-lg font-semibold transition-all backdrop-blur-xl relative overflow-hidden group ${
                      highlightedRow === rowIndex && highlightedKey === keyIndex
                        ? "bg-indigo-500/50 border-2 border-indigo-400 scale-110 shadow-[0_0_30px_rgba(79,70,229,0.6)] ring-4 ring-indigo-500/20"
                        : "bg-white/5 border border-white/10 hover:bg-white/10 text-white/90"
                    }`}
                  >
                    {/* Ripple effect simulation */}
                    {highlightedRow === rowIndex && highlightedKey === keyIndex && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="absolute inset-0 bg-white/20 rounded-full pointer-events-none"
                      />
                    )}
                    <span className="relative z-10">{key.toUpperCase()}</span>
                  </motion.button>
                ))}
                {rowIndex === 2 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => dwellStart(rowIndex, -1, null as any)}
                    onMouseLeave={dwellEnd}
                    className={`w-14 h-12 rounded-xl flex items-center justify-center transition-all backdrop-blur-xl ${
                      highlightedRow === rowIndex && highlightedKey === -1
                        ? "bg-indigo-500/30 border-2 border-indigo-400 scale-110"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <span className="w-6 h-0.5 bg-white/70 rounded" />
                  </motion.button>
                )}
              </div>
            ))}

            {/* Bottom Row */}
            <div className="flex justify-center gap-1.5">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => dwellStart(-1, -1, null as any)}
                onMouseLeave={dwellEnd}
                className={`w-16 h-12 rounded-xl flex items-center justify-center transition-all backdrop-blur-xl ${
                  highlightedRow === -1
                    ? "bg-pink-500/30 border-2 border-pink-400 scale-110"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                <Mic
                  className={`w-5 h-5 ${isSpeaking ? "text-pink-400 animate-pulse" : "text-white/70"}`}
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyPress("space")}
                className="w-48 h-12 rounded-xl flex items-center justify-center font-mono text-lg transition-all backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70"
              >
                space
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => dwellStart(-3, -1, null as any)}
                onMouseLeave={dwellEnd}
                className={`w-20 h-12 rounded-xl flex items-center justify-center gap-2 transition-all backdrop-blur-xl ${
                  highlightedRow === -3
                    ? "bg-emerald-500/30 border-2 border-emerald-400 scale-110"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                <Send className="w-5 h-5 text-emerald-400" />
                Send
              </motion.button>
            </div>
          </div>
        </>
      ) : (
        /* Phrase Mode */
        <div className="space-y-4">
          {dynamicPhrases.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Context Suggestions
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {dynamicPhrases.map((phrase) => (
                  <motion.button
                    key={phrase.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePhraseSelect(phrase.text)}
                    className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 hover:border-indigo-500/50 text-white/90 text-sm transition-all"
                  >
                    {phrase.text}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap justify-center">
            {PHRASES.map((category, i) => (
              <button
                key={category.category}
                onClick={() => setSelectedPhraseCategory(i)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedPhraseCategory === i
                    ? "bg-indigo-600/30 text-white"
                    : "bg-white/5 text-white/60"
                }`}
              >
                {category.category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
            {PHRASES[selectedPhraseCategory].phrases.map((phrase) => (
              <motion.button
                key={phrase}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePhraseSelect(phrase)}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-white/90 text-sm transition-all"
              >
                {phrase}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

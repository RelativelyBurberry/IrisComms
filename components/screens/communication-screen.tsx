"use client";

import { motion } from "framer-motion";
import {
  Volume2,
  Trash2,
  Delete,
  Space,
  Sparkles,
  Wifi,
  Eye,
  BrainCircuit,
  HeartPulse,
  TimerReset,
  Lightbulb,
  Fan,
  MessageSquareHeart,
  Siren,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GazeButton } from "@/components/ui/gaze-button";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { SpeechWave } from "@/components/ui/speech-wave";
import { GenerativeAIPredictions } from "@/components/advanced/generative-ai-predictions";
import { useAppStore } from "@/lib/store";
import { useState, useCallback } from "react";

const keyboardRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export function CommunicationScreen() {
  const { 
    currentText, 
    appendToText, 
    clearText, 
    backspace, 
    predictions,
    setCurrentText,
    isSpeaking,
    setIsSpeaking,
    dwellTime,
    emotion,
    toggleIotDevice,
    triggerEmergency,
    addCaregiverMessage,
    setCurrentScreen,
    updateMissionProgress,
    addScore,
  } = useAppStore();
  
  const [isConnected] = useState(true);

  const handleSpeak = useCallback(() => {
    if (!currentText || isSpeaking) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(currentText);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [currentText, isSpeaking, setIsSpeaking]);

  const handlePredictionSelect = useCallback((text: string) => {
    setCurrentText(text);
  }, [setCurrentText]);

  const carePrompt =
    emotion.emotion === "stressed" || emotion.emotion === "pain"
      ? {
          title: "Care signal detected",
          description:
            "The system detected stress or pain indicators. You can alert support, ask for help, or trigger emergency escalation.",
        }
      : currentText.toLowerCase().includes("help") || currentText.toLowerCase().includes("pain")
        ? {
            title: "High-priority intent recognized",
            description:
              "Your message suggests you may need assistance. IrisComm can notify a caregiver or stage an emergency message.",
          }
        : null;

  const quickActions = [
    {
      label: "Smart Lights",
      icon: Lightbulb,
      tone: "secondary" as const,
      action: () => {
        toggleIotDevice("light-1");
        updateMissionProgress("m1", 1);
        addScore(20);
      },
    },
    {
      label: "Ceiling Fan",
      icon: Fan,
      tone: "secondary" as const,
      action: () => {
        toggleIotDevice("fan-1");
        addScore(20);
      },
    },
    {
      label: "Caregiver Ping",
      icon: MessageSquareHeart,
      tone: "default" as const,
      action: () => {
        addCaregiverMessage(
          currentText || "Please check on me. IrisComm assist mode triggered a support ping.",
          "Patient",
        );
        setCurrentScreen("caregiver");
        addScore(30);
      },
    },
    {
      label: "Emergency Alert",
      icon: Siren,
      tone: "emergency" as const,
      action: () => {
        triggerEmergency({
          type: "Adaptive Emergency Assist",
          status: "Alert Sent",
          message:
            currentText || "Adaptive care prompt triggered because the user may need urgent help.",
        });
        addScore(40);
      },
    },
  ];

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 pb-32">
      {/* Header Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass px-3 py-2 rounded-full">
            <Eye className="w-4 h-4 text-primary animate-iris-scan" />
            <span className="text-sm font-medium">Eye Tracking Active</span>
          </div>
        </div>
        <div className="flex items-center gap-2 glass px-3 py-2 rounded-full">
          <Wifi className={`w-4 h-4 ${isConnected ? "text-accent" : "text-destructive"}`} />
          <span className="text-sm font-medium">
            {isConnected ? "Connected" : "Offline"}
          </span>
        </div>
      </motion.div>

      {/* Main Text Display */}
      <GlassCard variant="strong" className="mb-6 min-h-[140px] flex items-center justify-center">
        <TypingIndicator 
          text={currentText || "Start typing..."} 
          className={currentText ? "text-foreground" : "text-muted-foreground/50"}
          showCursor={!!currentText}
        />
      </GlassCard>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <GlassCard variant="subtle" className="p-4">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-cyan-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Neural Copilot</p>
              <p className="text-sm font-medium text-white/90">
                {currentText ? "Context locked" : "Waiting for intent"}
              </p>
            </div>
          </div>
        </GlassCard>
        <GlassCard variant="subtle" className="p-4">
          <div className="flex items-center gap-3">
            <HeartPulse className="h-5 w-5 text-emerald-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Emotion-aware voice</p>
              <p className="text-sm font-medium capitalize text-white/90">{emotion.emotion}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard variant="subtle" className="p-4">
          <div className="flex items-center gap-3">
            <TimerReset className="h-5 w-5 text-amber-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Adaptive dwell</p>
              <p className="text-sm font-medium text-white/90">{(dwellTime / 1000).toFixed(1)}s precision mode</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* AI Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-muted-foreground">AI Suggestions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {predictions.map((prediction, index) => (
            <GazeButton
              key={index}
              variant="secondary"
              size="md"
              onClick={() => handlePredictionSelect(prediction)}
              onGazeSelect={() => handlePredictionSelect(prediction)}
              dwellTime={dwellTime}
              className="text-sm"
            >
              {prediction}
            </GazeButton>
          ))}
        </div>
      </motion.div>

      <GlassCard variant="strong" className="mb-6">
        <GenerativeAIPredictions
          currentText={currentText}
          emotion={emotion.emotion}
          onSelect={handlePredictionSelect}
        />
      </GlassCard>

      {carePrompt && (
        <GlassCard variant="strong" className="mb-6 border-red-400/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-red-300/80">Adaptive Care Guard</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{carePrompt.title}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">{carePrompt.description}</p>
            </div>
            <GazeButton
              variant="emergency"
              size="md"
              onClick={() =>
                triggerEmergency({
                  type: "Emotion-Aware Escalation",
                  status: "Alert Sent",
                  message:
                    currentText || "Emotion-aware escalation triggered from the communication screen.",
                })
              }
              onGazeSelect={() =>
                triggerEmergency({
                  type: "Emotion-Aware Escalation",
                  status: "Alert Sent",
                  message:
                    currentText || "Emotion-aware escalation triggered from the communication screen.",
                })
              }
              dwellTime={dwellTime}
            >
              <Siren className="h-5 w-5" />
              Escalate Now
            </GazeButton>
          </div>
        </GlassCard>
      )}

      <GlassCard variant="default" className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Independence Layer</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Action rail</h3>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/45">
            Voice + Gaze + AI
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {quickActions.map((item) => (
            <GazeButton
              key={item.label}
              variant={item.tone}
              size="md"
              onClick={item.action}
              onGazeSelect={item.action}
              dwellTime={dwellTime}
              className="w-full"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </GazeButton>
          ))}
        </div>
      </GlassCard>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <GazeButton
          variant="primary"
          size="lg"
          onClick={handleSpeak}
          onGazeSelect={handleSpeak}
          dwellTime={dwellTime}
          className="flex-1"
          disabled={!currentText || isSpeaking}
        >
          {isSpeaking ? (
            <SpeechWave isActive={true} barCount={5} />
          ) : (
            <>
              <Volume2 className="w-6 h-6" />
              Speak
            </>
          )}
        </GazeButton>
        
        <GazeButton
          variant="default"
          size="lg"
          onClick={clearText}
          onGazeSelect={clearText}
          dwellTime={dwellTime}
        >
          <Trash2 className="w-6 h-6" />
        </GazeButton>
      </div>

      {/* Virtual Keyboard */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 md:gap-2">
            {row.map((key) => (
              <GazeButton
                key={key}
                variant="default"
                size="md"
                onClick={() => appendToText(key)}
                onGazeSelect={() => appendToText(key)}
                dwellTime={dwellTime}
                className="w-9 h-12 md:w-12 md:h-14 text-lg font-semibold"
              >
                {key}
              </GazeButton>
            ))}
          </div>
        ))}
        
        {/* Bottom row with space and backspace */}
        <div className="flex justify-center gap-2">
          <GazeButton
            variant="default"
            size="md"
            onClick={backspace}
            onGazeSelect={backspace}
            dwellTime={dwellTime}
            className="w-20 h-12 md:w-24 md:h-14"
          >
            <Delete className="w-5 h-5" />
          </GazeButton>
          
          <GazeButton
            variant="default"
            size="md"
            onClick={() => appendToText(" ")}
            onGazeSelect={() => appendToText(" ")}
            dwellTime={dwellTime}
            className="flex-1 max-w-xs h-12 md:h-14"
          >
            <Space className="w-5 h-5" />
            Space
          </GazeButton>
          
          <GazeButton
            variant="primary"
            size="md"
            onClick={handleSpeak}
            onGazeSelect={handleSpeak}
            dwellTime={dwellTime}
            className="w-20 h-12 md:w-24 md:h-14"
            disabled={!currentText || isSpeaking}
          >
            <Volume2 className="w-5 h-5" />
          </GazeButton>
        </div>
      </motion.div>
    </div>
  );
}

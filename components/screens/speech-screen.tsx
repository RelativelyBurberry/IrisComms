"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Volume2, Play, Pause, RotateCcw, Gauge, User } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GazeButton } from "@/components/ui/gaze-button";
import { SpeechWave } from "@/components/ui/speech-wave";
import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/lib/store";

const voiceTypes = [
  { id: "default", name: "Default", description: "Standard voice" },
  { id: "male", name: "Male", description: "Deep male voice" },
  { id: "female", name: "Female", description: "Clear female voice" },
];

export function SpeechScreen() {
  const { 
    currentText, 
    voiceSpeed, 
    setVoiceSpeed, 
    isSpeaking, 
    setIsSpeaking,
    dwellTime 
  } = useAppStore();
  
  const [selectedVoice, setSelectedVoice] = useState("default");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleSpeak = () => {
    if (!currentText) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentText);
    utterance.rate = voiceSpeed;
    
    const voice = availableVoices.find((v) => 
      selectedVoice === "male" ? v.name.toLowerCase().includes("male") :
      selectedVoice === "female" ? v.name.toLowerCase().includes("female") :
      true
    );
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleReplay = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setTimeout(handleSpeak, 100);
  };

  return (
    <div className="min-h-screen px-4 py-6 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
          <Volume2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Speech Output</h1>
        <p className="text-muted-foreground">Convert your text to speech</p>
      </motion.div>

      {/* Current Text Display */}
      <GlassCard variant="strong" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Current Message</span>
          <SpeechWave isActive={isSpeaking} barCount={7} className="h-8" />
        </div>
        <p className="text-2xl md:text-3xl font-medium min-h-[80px]">
          {currentText || "No message to speak"}
        </p>
      </GlassCard>

      {/* Playback Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center gap-4 mb-8"
      >
        <GazeButton
          variant="default"
          size="xl"
          onClick={handleReplay}
          onGazeSelect={handleReplay}
          dwellTime={dwellTime}
          disabled={!currentText}
        >
          <RotateCcw className="w-6 h-6" />
        </GazeButton>

        <GazeButton
          variant="primary"
          size="xl"
          onClick={handleSpeak}
          onGazeSelect={handleSpeak}
          dwellTime={dwellTime}
          disabled={!currentText}
          className="w-32"
        >
          {isSpeaking ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8" />
          )}
        </GazeButton>
      </motion.div>

      {/* Voice Speed Control */}
      <GlassCard variant="default" className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Gauge className="w-5 h-5 text-primary" />
          <span className="font-medium">Voice Speed</span>
          <span className="ml-auto text-sm text-muted-foreground">
            {voiceSpeed.toFixed(1)}x
          </span>
        </div>
        <Slider
          value={[voiceSpeed]}
          onValueChange={([value]) => setVoiceSpeed(value)}
          min={0.5}
          max={2}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Slower</span>
          <span>Normal</span>
          <span>Faster</span>
        </div>
      </GlassCard>

      {/* Voice Type Selection */}
      <GlassCard variant="default">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-primary" />
          <span className="font-medium">Voice Type</span>
        </div>
        <div className="grid gap-3">
          {voiceTypes.map((voice) => (
            <GazeButton
              key={voice.id}
              variant={selectedVoice === voice.id ? "primary" : "default"}
              size="md"
              onClick={() => setSelectedVoice(voice.id)}
              onGazeSelect={() => setSelectedVoice(voice.id)}
              dwellTime={dwellTime}
              className="w-full justify-start"
            >
              <div className="text-left">
                <p className="font-medium">{voice.name}</p>
                <p className="text-xs opacity-70">{voice.description}</p>
              </div>
            </GazeButton>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

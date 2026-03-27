"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useEyeTracking } from "@/hooks/useEyeTracking";
import { useHandTracking } from "@/hooks/useHandTracking";
import { useAppStore } from "@/lib/store";
import { GazeCursor3D } from "./ui/gaze-cursor-3d";
import { CalibrationOverlay } from "./ui/CalibrationOverlay";
import { toast } from "sonner";
import { aiService } from "@/lib/ai-service";
import { voiceService } from "@/lib/voice-service";

export function GazeController() {
  const { 
    isCalibrated, 
    currentScreen, 
    backspace, 
    appendToText, 
    speakCurrentSentence,
    dwellTime,
    updateDynamicPhrases,
    isVoiceActive,
    setIsVoiceActive,
    triggerEmergency,
    isEmergencyActive,
    toggleIotDevice,
    clearText,
    undo,
    setEmotion,
    isSpeaking,
    addGazeSample,
    setGazePosition
  } = useAppStore();

  const emergencyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHoveredElementRef = useRef<Element | null>(null);
  const [isEmergencyHovered, setIsEmergencyHovered] = useState(false);

  const handleEmotionChange = useCallback((emotion: string) => {
    // Map MediaPipe emotion to AppState emotion
    const mapped: any = {
      "happy": "happy",
      "sad": "sad",
      "surprised": "stressed", // Mapping for speech effect
      "angry": "stressed",
      "neutral": "neutral"
    };
    setEmotion({ emotion: mapped[emotion] || "neutral" });
  }, [setEmotion]);

  const handleHandGesture = useCallback((gesture: string) => {
    if (gesture === "swipe-left") {
      undo();
      toast.info("Hand Gesture: Undo");
    }
  }, [undo]);

  const { videoRef: handVideoRef, startHandTracking } = useHandTracking(handleHandGesture);

  useEffect(() => {
    if (currentScreen !== "landing") {
      startHandTracking();
    }
  }, [currentScreen, startHandTracking]);

  const handleVoiceCommand = useCallback((command: string) => {
    console.log("Voice Command:", command);
    if (command.includes("backspace") || command.includes("delete")) {
      backspace();
      toast.info("Voice: Backspace");
    } else if (command.includes("space")) {
      appendToText(" ");
      toast.info("Voice: Space");
    } else if (command.includes("clear")) {
      clearText();
      toast.info("Voice: Clear");
    } else if (command.includes("speak") || command.includes("talk")) {
      speakCurrentSentence();
      toast.info("Voice: Speaking");
    } else if (command.includes("light")) {
      toggleIotDevice("light-1");
      toast.info("Voice: Smart Light Toggled");
    } else if (command.includes("fan")) {
      toggleIotDevice("fan-1");
      toast.info("Voice: Smart Fan Toggled");
    } else if (command.includes("emergency") || command.includes("help")) {
      triggerEmergency();
      toast.error("Voice: EMERGENCY TRIGGERED");
    }
  }, [backspace, appendToText, clearText, speakCurrentSentence, toggleIotDevice, triggerEmergency]);

  useEffect(() => {
    if (isVoiceActive) {
      voiceService.startListening(handleVoiceCommand);
    } else {
      voiceService.stopListening();
    }
    return () => voiceService.stopListening();
  }, [isVoiceActive, handleVoiceCommand]);

  useEffect(() => {
    // Initialize AI Service
    aiService
      .initialize()
      .catch((error) => {
        console.warn("AI service started in fallback mode:", error);
        return false;
      })
      .finally(() => {
        updateDynamicPhrases();
      });

    // Update dynamic phrases every 5 minutes
    const interval = setInterval(updateDynamicPhrases, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateDynamicPhrases]);

  const handleWink = useCallback((eye: "left" | "right") => {
    if (eye === "left") {
      backspace();
      toast.info("Backspace (Left Wink)");
    } else {
      appendToText(" ");
      toast.info("Space (Right Wink)");
    }
  }, [backspace, appendToText]);

  const handleBlink = useCallback((type: "single" | "double" | "left" | "right") => {
    if (type === "double") {
      // Logic for selection - in a real app this would trigger the current hovered element
      toast.success("Select (Double Blink)");
    }
  }, []);

  const handleEyebrowRaise = useCallback((eye: "left" | "right") => {
    speakCurrentSentence();
    toast.success("Speaking current sentence (Eyebrow Raise)");
  }, [speakCurrentSentence]);

  const {
    videoRef,
    eyeState,
    cameraReady,
    startCamera,
    getGazePosition,
  } = useEyeTracking({
    onWink: handleWink,
    onBlink: handleBlink,
    onEyebrowRaise: handleEyebrowRaise,
    onEmotionChange: handleEmotionChange,
    dwellTime: dwellTime,
  });

  useEffect(() => {
    if (currentScreen !== "landing") {
      startCamera();
    }
  }, [currentScreen, startCamera]);

  const gazePos = getGazePosition();

  // Dispatch mouse events at gaze position to trigger hover in other components
  useEffect(() => {
    if (eyeState.isTracking && typeof window !== "undefined") {
      const x = gazePos.x * window.innerWidth;
      const y = gazePos.y * window.innerHeight;
      
      const element = document.elementFromPoint(x, y);
      
      if (element !== lastHoveredElementRef.current) {
        // Mouse leave old element
        if (lastHoveredElementRef.current) {
          lastHoveredElementRef.current.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true, clientX: x, clientY: y }));
          lastHoveredElementRef.current.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientX: x, clientY: y }));
        }
        
        // Mouse enter new element
        if (element) {
          element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, clientX: x, clientY: y }));
          element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: x, clientY: y }));
        }
        
        lastHoveredElementRef.current = element;
      }
    }
  }, [gazePos, eyeState.isTracking]);

  // Record gaze samples for heatmap
  useEffect(() => {
    if (eyeState.isTracking) {
      addGazeSample(gazePos.x, gazePos.y);
      setGazePosition(gazePos.x, gazePos.y);
    }
  }, [gazePos, eyeState.isTracking, addGazeSample, setGazePosition]);

  // Sustained gaze logic for emergency button
  useEffect(() => {
    const isOverEmergency = 
      gazePos.x > 0.8 && gazePos.x < 1.0 && 
      gazePos.y > 0.8 && gazePos.y < 1.0;

    if (isOverEmergency && !isEmergencyHovered) {
      setIsEmergencyHovered(true);
      emergencyTimerRef.current = setTimeout(() => {
        triggerEmergency();
        toast.error("Emergency Triggered by Gaze!");
      }, 2000); // 2 seconds sustained gaze
    } else if (!isOverEmergency && isEmergencyHovered) {
      setIsEmergencyHovered(false);
      if (emergencyTimerRef.current) {
        clearTimeout(emergencyTimerRef.current);
        emergencyTimerRef.current = null;
      }
    }
  }, [gazePos, isEmergencyHovered, triggerEmergency]);

  return (
    <>
      {/* Hidden video elements for MediaPipe */}
      <video
        ref={videoRef}
        className="fixed top-0 left-0 w-1 h-1 opacity-0 pointer-events-none"
        playsInline
      />
      <video
        ref={handVideoRef}
        className="fixed top-0 right-0 w-1 h-1 opacity-0 pointer-events-none"
        playsInline
      />

      {/* Emergency Button UI in the bottom right corner */}
      {currentScreen !== "landing" && (
        <motion.div 
          animate={isEmergencyHovered ? {
            x: [0, -2, 2, -2, 2, 0],
            scale: 1.1,
          } : { scale: 1 }}
          transition={isEmergencyHovered ? {
            x: { repeat: Infinity, duration: 0.1 },
            scale: { duration: 0.2 }
          } : {}}
          className={`fixed bottom-8 right-8 w-24 h-24 rounded-full border-4 flex items-center justify-center z-50 transition-all duration-300 ${
            isEmergencyHovered 
              ? "bg-red-600 border-white shadow-red-500/50 shadow-2xl animate-pulse" 
              : "bg-red-900/50 border-red-500/30"
          }`}
        >
          <div className="text-white text-[10px] font-bold text-center">
            EMERGENCY<br/>GAZE 2S
          </div>
          {isEmergencyHovered && (
            <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin" />
          )}
        </motion.div>
      )}

      {/* Calibration Overlay */}
      {currentScreen === "calibration" && !isCalibrated && (
        <CalibrationOverlay />
      )}

      {/* 3D Gaze Cursor */}
      {cameraReady && eyeState.isTracking && (
        <GazeCursor3D
          position={{ 
            x: gazePos.x * (typeof window !== "undefined" ? window.innerWidth : 1000), 
            y: gazePos.y * (typeof window !== "undefined" ? window.innerHeight : 1000) 
          }}
          isDwelling={isEmergencyHovered}
          dwellProgress={isEmergencyHovered ? 1 : 0}
          isVisible={true}
        />
      )}
    </>
  );
}

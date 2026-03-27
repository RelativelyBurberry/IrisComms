"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Phone, MessageCircle, X, Check, User } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GazeButton } from "@/components/ui/gaze-button";
import { useAppStore } from "@/lib/store";

const emergencyMessages = [
  "I need immediate assistance",
  "I am not feeling well",
  "Please come quickly",
  "Emergency - need help now",
];

export function EmergencyScreen() {
  const { caregiverContact, dwellTime, triggerEmergency } = useAppStore();
  const [isEmergencyTriggered, setIsEmergencyTriggered] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isSent, setIsSent] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(emergencyMessages[0]);

  const beginEmergencySequence = useCallback(() => {
    setIsEmergencyTriggered(true);
    setCountdown(5);
  }, []);

  const cancelEmergency = useCallback(() => {
    setIsEmergencyTriggered(false);
    setCountdown(5);
    setIsSent(false);
  }, []);

  useEffect(() => {
    if (!isEmergencyTriggered || isSent) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      triggerEmergency({
        type: "Manual Emergency Alert",
        status: "Alert Sent",
        message: selectedMessage,
      });
      setIsSent(true);
    }
  }, [countdown, isEmergencyTriggered, isSent, selectedMessage, triggerEmergency]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <AnimatePresence mode="wait">
        {!isEmergencyTriggered ? (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg mx-auto text-center"
          >
            {/* Warning Header */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-destructive/20 mb-8"
            >
              <AlertTriangle className="w-12 h-12 text-destructive" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Emergency Alert
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Quickly alert your caregiver or emergency contact when you need immediate help.
            </p>

            {/* Caregiver Contact */}
            <GlassCard variant="subtle" className="mb-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Emergency Contact</p>
                  <p className="text-sm text-muted-foreground">
                    {caregiverContact || "Not configured"}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Message Selection */}
            <div className="mb-8">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Select emergency message:
              </p>
              <div className="grid gap-2">
                {emergencyMessages.map((message) => (
                  <GazeButton
                    key={message}
                    variant={selectedMessage === message ? "primary" : "default"}
                    size="md"
                    onClick={() => setSelectedMessage(message)}
                    onGazeSelect={() => setSelectedMessage(message)}
                    dwellTime={dwellTime}
                    className="w-full text-left justify-start"
                  >
                    {message}
                  </GazeButton>
                ))}
              </div>
            </div>

            {/* Emergency Button */}
            <GazeButton
              variant="emergency"
              size="xl"
              onClick={beginEmergencySequence}
              onGazeSelect={beginEmergencySequence}
              dwellTime={2000}
              className="w-full animate-emergency-pulse"
            >
              <AlertTriangle className="w-8 h-8" />
              SEND EMERGENCY ALERT
            </GazeButton>

            <p className="text-sm text-muted-foreground mt-4">
              Hold gaze for 2 seconds to activate
            </p>
          </motion.div>
        ) : !isSent ? (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            {/* Countdown */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/30"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-destructive"
                  strokeDasharray="553"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: 553 }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl font-bold text-destructive"
                >
                  {countdown}
                </motion.span>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2 text-destructive">
              Sending Emergency Alert
            </h2>
            <p className="text-muted-foreground mb-8">
              {selectedMessage}
            </p>

            <GazeButton
              variant="default"
              size="lg"
              onClick={cancelEmergency}
              onGazeSelect={cancelEmergency}
              dwellTime={1000}
              className="w-full max-w-xs mx-auto"
            >
              <X className="w-6 h-6" />
              Cancel
            </GazeButton>
          </motion.div>
        ) : (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-accent/20 mb-8"
            >
              <Check className="w-16 h-16 text-accent" />
            </motion.div>

            <h2 className="text-3xl font-bold mb-4 text-accent">
              Alert Sent Successfully
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              Your emergency contact has been notified.
            </p>
            <p className="text-muted-foreground mb-8">
              Message: &quot;{selectedMessage}&quot;
            </p>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <GazeButton
                variant="default"
                size="lg"
                onClick={cancelEmergency}
                onGazeSelect={cancelEmergency}
                dwellTime={dwellTime}
                className="w-full"
              >
                <MessageCircle className="w-5 h-5" />
                Send Another Alert
              </GazeButton>
              
              <GazeButton
                variant="primary"
                size="lg"
                onClick={() => window.location.href = `tel:${caregiverContact || "911"}`}
                onGazeSelect={() => window.location.href = `tel:${caregiverContact || "911"}`}
                dwellTime={dwellTime}
                className="w-full"
              >
                <Phone className="w-5 h-5" />
                Call Emergency Contact
              </GazeButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

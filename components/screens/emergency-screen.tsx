"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Phone, MessageCircle, X, Check, User, Heart, Shield, AlertOctagon } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GazeButton } from "@/components/ui/GazeButton";
import { useAppStore } from "@/lib/store";

type AlertLevel = "warning" | "urgent" | "critical";

const alertLevels: { level: AlertLevel; label: string; dwell: number; color: string }[] = [
  { level: "warning", label: "Warning", dwell: 2000, color: "bg-yellow-500" },
  { level: "urgent", label: "Urgent", dwell: 1500, color: "bg-orange-500" },
  { level: "critical", label: "Critical", dwell: 800, color: "bg-red-600" },
];

const emergencyMessages = [
  "I need immediate assistance",
  "I am not feeling well",
  "Please come quickly",
  "Emergency - need help now",
];

export function EmergencyScreen() {
  const { 
    caregiverContact, 
    dwellTime, 
    triggerEmergency,
    bloodType,
    medicalConditions,
    medications,
    emergencyMedicalInfo,
    patientName,
  } = useAppStore();
  const [isEmergencyTriggered, setIsEmergencyTriggered] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isSent, setIsSent] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(emergencyMessages[0]);
  const [alertLevel, setAlertLevel] = useState<AlertLevel>("urgent");
  const [showMedicalInfo, setShowMedicalInfo] = useState(false);

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

    const currentLevel = alertLevels.find(a => a.level === alertLevel);
    const countdownTime = currentLevel?.dwell ? Math.ceil(currentLevel.dwell / 1000) : 5;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const fullMessage = `${selectedMessage}${bloodType || medicalConditions.length > 0 || medications.length > 0 ? `\n\nMedical Info: ${patientName || 'Patient'}${bloodType ? `\nBlood Type: ${bloodType}` : ''}${medicalConditions.length > 0 ? `\nConditions: ${medicalConditions.join(', ')}` : ''}${medications.length > 0 ? `\nMedications: ${medications.join(', ')}` : ''}${emergencyMedicalInfo ? `\n${emergencyMedicalInfo}` : ''}` : ''}`;
      triggerEmergency({
        type: `${alertLevel.charAt(0).toUpperCase() + alertLevel.slice(1)} Alert - ${currentLevel?.label}`,
        status: "Alert Sent",
        message: fullMessage,
      });
      setIsSent(true);
    }
  }, [countdown, isEmergencyTriggered, isSent, selectedMessage, triggerEmergency, alertLevel, bloodType, medicalConditions, medications, emergencyMedicalInfo, patientName]);

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
            <GlassCard variant="subtle" className="mb-6 text-left">
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

            {/* Alert Level Selection */}
            <GlassCard variant="subtle" className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-yellow-400" />
                <span className="font-medium">Alert Level</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {alertLevels.map(({ level, label, color }) => (
                  <GazeButton
                    key={level}
                    variant={alertLevel === level ? "primary" : "default"}
                    size="sm"
                    onClick={() => setAlertLevel(level)}
                    onGazeSelect={() => setAlertLevel(level)}
                    dwellTime={dwellTime}
                    className="text-xs"
                  >
                    <div className={`w-2 h-2 rounded-full ${color} mr-1`} />
                    {label}
                  </GazeButton>
                ))}
              </div>
            </GlassCard>

            {/* Medical Info Toggle */}
            <GlassCard variant="subtle" className="mb-6">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowMedicalInfo(!showMedicalInfo)}
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span className="font-medium">Medical Information</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {bloodType || medicalConditions.length > 0 || medications.length > 0 ? "✓ Configured" : "Not set"}
                </div>
              </div>
              {showMedicalInfo && (
                <div className="mt-4 space-y-2 text-sm">
                  {patientName && <p><span className="text-muted-foreground">Name:</span> {patientName}</p>}
                  {bloodType && <p><span className="text-muted-foreground">Blood Type:</span> {bloodType}</p>}
                  {medicalConditions.length > 0 && <p><span className="text-muted-foreground">Conditions:</span> {medicalConditions.join(", ")}</p>}
                  {medications.length > 0 && <p><span className="text-muted-foreground">Medications:</span> {medications.join(", ")}</p>}
                  {emergencyMedicalInfo && <p><span className="text-muted-foreground">Notes:</span> {emergencyMedicalInfo}</p>}
                </div>
              )}
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
              dwellTime={alertLevels.find(a => a.level === alertLevel)?.dwell || 1500}
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

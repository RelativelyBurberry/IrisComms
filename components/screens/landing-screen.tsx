"use client";

import { motion } from "framer-motion";
import { Eye, Sparkles, Heart, Shield, Zap, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GazeButton } from "@/components/ui/GazeButton";
import { useAppStore } from "@/lib/store";

const features = [
  {
    icon: Eye,
    title: "Eye Tracking",
    description: "Control with your eyes using advanced AI gaze detection",
  },
  {
    icon: Sparkles,
    title: "AI Predictions",
    description: "Smart phrase suggestions powered by AI",
  },
  {
    icon: Heart,
    title: "Accessibility First",
    description: "Designed for users with motor disabilities",
  },
  {
    icon: Shield,
    title: "Emergency Alerts",
    description: "Quick access to emergency assistance",
  },
];

const stats = [
  { value: "100%", label: "Hands-Free" },
  { value: "< 2s", label: "Response Time" },
  { value: "99.5%", label: "Accuracy" },
  { value: "24/7", label: "Support" },
];

export function LandingScreen() {
  const { setCurrentScreen, isCalibrated } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 md:py-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto mb-12"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/20 mb-6 animate-pulse-glow"
        >
          <Eye className="w-10 h-10 md:w-12 md:h-12 text-primary" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-balance"
        >
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient-shift">
            IrisComm
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-2xl md:text-3xl lg:text-4xl font-light text-muted-foreground mb-6"
        >
          Communicate with your eyes.
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          AI-powered assistive communication platform that converts eye movements 
          into text and speech, empowering people with motor disabilities to express themselves freely.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <GazeButton
            variant="primary"
            size="xl"
            onClick={() => setCurrentScreen(isCalibrated ? "communication" : "calibration")}
            onGazeSelect={() => setCurrentScreen(isCalibrated ? "communication" : "calibration")}
            className="w-full sm:w-auto"
          >
            <Zap className="w-6 h-6" />
            {isCalibrated ? "Start Communicating" : "Get Started"}
            <ArrowRight className="w-5 h-5" />
          </GazeButton>
          
          <GazeButton
            variant="default"
            size="xl"
            onClick={() => setCurrentScreen("settings")}
            onGazeSelect={() => setCurrentScreen("settings")}
            className="w-full sm:w-auto"
          >
            Learn More
          </GazeButton>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl mx-auto mb-12"
      >
        {stats.map((stat, index) => (
          <GlassCard
            key={stat.label}
            variant="subtle"
            hoverEffect={false}
            className="text-center py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
            >
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl mx-auto"
      >
        {features.map((feature, index) => (
          <GlassCard
            key={feature.title}
            variant="default"
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Supported Conditions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-16 text-center"
      >
        <p className="text-sm text-muted-foreground mb-4">
          Designed for people with
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {["ALS", "Stroke", "Spinal Cord Injury", "Cerebral Palsy", "Traumatic Brain Injury"].map((condition) => (
            <span
              key={condition}
              className="px-4 py-2 rounded-full glass text-sm font-medium"
            >
              {condition}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

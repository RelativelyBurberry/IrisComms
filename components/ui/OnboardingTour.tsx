"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

export function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      title: "Welcome to the Galaxy",
      description: "IrisComm uses advanced neural tracking to give you a voice in the universe.",
      highlight: "header",
    },
    {
      title: "Eye-Tracking Mastery",
      description: "Simply look at any key or button. The glowing 3D cursor follows your every move.",
      highlight: "cursor",
    },
    {
      title: "AI Smart Communication",
      description: "Our local AI models predict your next words and complete your sentences instantly.",
      highlight: "ai",
    },
    {
      title: "Full Independence",
      description: "Control your home, play games, and stay connected with your caregivers.",
      highlight: "iot",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete });

      steps.forEach((_, i) => {
        tl.fromTo(
          `.step-${i}`,
          { opacity: 0, y: 50, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power4.out" }
        )
        .to(`.step-${i}`, { opacity: 0, y: -50, scale: 1.1, duration: 0.8, delay: 3, ease: "power4.in" });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center pointer-events-none">
      <div className="max-w-2xl w-full px-8 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        
        {steps.map((step, i) => (
          <div key={i} className={`step-${i} absolute inset-0 flex flex-col items-center justify-center opacity-0`}>
            <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/20">
              <Star className="w-10 h-10 text-indigo-400 animate-spin-slow" />
            </div>
            <h2 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight">
              {step.title}
            </h2>
            <p className="text-xl text-white/60 font-light leading-relaxed max-w-lg mx-auto">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
        {steps.map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-white/20 overflow-hidden">
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 4.8, delay: i * 4.8, ease: "linear" }}
              className="h-full bg-indigo-500 origin-left"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

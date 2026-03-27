"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  BookOpen,
  Plus,
  Heart,
  Utensils,
  Stethoscope,
  MessageSquare,
  Volume2,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GazeButton } from "@/components/ui/gaze-button";
import { useAppStore } from "@/lib/store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const categoryIcons = {
  medical: Stethoscope,
  food: Utensils,
  emotions: Heart,
  requests: MessageSquare,
  custom: Plus,
};

const categoryColors = {
  medical: "text-destructive",
  food: "text-secondary",
  emotions: "text-accent",
  requests: "text-primary",
  custom: "text-muted-foreground",
};

export function PhrasesScreen() {
  const { phrases, setCurrentText, setCurrentScreen, dwellTime } =
    useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    "all",
    "medical",
    "food",
    "emotions",
    "requests",
    "custom",
  ];

  const filteredPhrases =
    activeCategory === "all"
      ? phrases
      : phrases.filter((p) => p.category === activeCategory);

  const handlePhraseSelect = (text: string) => {
    setCurrentText(text);
    setCurrentScreen("communication");
  };

  const speakPhrase = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
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
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Phrase Library</h1>
        <p className="text-muted-foreground">Quick access to common phrases</p>
      </motion.div>

      {/* Category Tabs */}
      <Tabs
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="mb-6"
      >
        <TabsList className="w-full flex flex-wrap justify-center gap-2 bg-transparent h-auto p-0">
          {categories.map((category) => {
            const Icon =
              category === "all"
                ? BookOpen
                : categoryIcons[category as keyof typeof categoryIcons];
            return (
              <TabsTrigger
                key={category}
                value={category}
                className="glass data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-4 py-2 rounded-full capitalize"
              >
                <Icon className="w-4 h-4 mr-2" />
                {category}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredPhrases.map((phrase, index) => {
              const Icon =
                categoryIcons[phrase.category as keyof typeof categoryIcons];
              const colorClass =
                categoryColors[phrase.category as keyof typeof categoryColors];

              return (
                <motion.div
                  key={phrase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard
                    variant="default"
                    className="flex items-center gap-4 p-4"
                    hoverEffect={true}
                    onClick={() => handlePhraseSelect(phrase.text)}
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-card flex items-center justify-center shrink-0 ${colorClass}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-lg truncate">
                        {phrase.text}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {phrase.category}
                      </p>
                    </div>
                    <GazeButton
                      variant="default"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakPhrase(phrase.text);
                      }}
                      onGazeSelect={() => speakPhrase(phrase.text)}
                      dwellTime={dwellTime}
                      className="shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                    </GazeButton>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>

          {filteredPhrases.length === 0 && (
            <GlassCard variant="subtle" className="text-center py-12">
              <p className="text-muted-foreground">
                No phrases in this category
              </p>
            </GlassCard>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Custom Phrase Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-24 left-4 right-4 flex justify-center"
      >
        <GazeButton
          variant="primary"
          size="lg"
          onClick={() => setCurrentScreen("communication")}
          onGazeSelect={() => setCurrentScreen("communication")}
          dwellTime={dwellTime}
          className="w-full max-w-sm"
        >
          <Plus className="w-5 h-5" />
          Create Custom Phrase
        </GazeButton>
      </motion.div>
    </div>
  );
}

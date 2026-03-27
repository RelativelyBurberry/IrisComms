"use client";

type DynamicPhrase = { id: string; text: string; category: string };

interface CompletionContext {
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  frequentPhrases: string[];
}

class AIService {
  private static instance: AIService;
  private isInitializing = false;
  private isInitialized = false;
  private readonly historyStorageKey = "iriscomm_phrase_history";

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async initialize(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    if (this.isInitialized || this.isInitializing) return this.isInitialized;

    this.isInitializing = true;
    try {
      // Warm up lightweight local AI dependencies if they are available.
      await import("@tensorflow/tfjs").catch(() => null);
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.warn("AI service fallback mode enabled:", error);
      this.isInitialized = false;
      return false;
    } finally {
      this.isInitializing = false;
    }
  }

  public recordUsage(text: string) {
    if (typeof window === "undefined") return;

    const normalized = text.trim();
    if (!normalized) return;

    try {
      const existing = this.readHistory();
      const next = [normalized, ...existing.filter((item) => item !== normalized)].slice(0, 20);
      window.localStorage.setItem(this.historyStorageKey, JSON.stringify(next));
    } catch (error) {
      console.warn("Failed to save phrase history:", error);
    }
  }

  public getNextWordPredictions(text: string): string[] {
    const commonPhrases: Record<string, string[]> = {
      i: ["want", "am", "need", "feel", "would"],
      "i want": ["to eat", "to drink", "to rest", "help", "water"],
      "i am": ["hungry", "tired", "happy", "cold", "okay"],
      "i need": ["water", "help", "medication", "rest", "support"],
      please: ["help", "wait", "call", "listen", "stop"],
      thank: ["you", "you so much", "you for helping"],
      turn: ["on the lights", "off the lights", "on the fan", "off the fan"],
      call: ["my caregiver", "my family", "the doctor"],
    };

    const normalizedText = text.toLowerCase().trim();
    if (!normalizedText) {
      return this.getContext().frequentPhrases.slice(0, 5);
    }

    const words = normalizedText.split(/\s+/);
    const lastOne = words[words.length - 1];
    const lastTwo = words.slice(-2).join(" ");

    const suggestions = new Set<string>();

    commonPhrases[lastTwo]?.forEach((phrase) => suggestions.add(phrase));
    commonPhrases[lastOne]?.forEach((phrase) => suggestions.add(phrase));

    this.getContext().frequentPhrases.forEach((phrase) => {
      if (phrase.toLowerCase().startsWith(normalizedText) || normalizedText.includes("i")) {
        suggestions.add(phrase);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }

  public async getSentenceCompletion(text: string): Promise<string[]> {
    const normalized = text.trim().toLowerCase();
    if (!normalized) return [];

    await this.initialize();

    if (typeof window !== "undefined") {
      try {
        const response = await fetch("/api/ai/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            context: {
              timeOfDay: this.getContext().timeOfDay,
              recentPhrases: this.getContext().frequentPhrases.slice(0, 5),
            },
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as { completions?: string[] };
          if (Array.isArray(data.completions) && data.completions.length > 0) {
            return data.completions;
          }
        }
      } catch (error) {
        console.warn("Groq completion fallback engaged:", error);
      }
    }

    const context = this.getContext();
    const suggestions = new Set<string>();

    if (normalized.startsWith("i want")) {
      [
        "to eat",
        "to drink",
        "to sleep",
        context.timeOfDay === "morning" ? "breakfast" : "to rest",
        "to go outside",
      ].forEach((item) => suggestions.add(item));
    }

    if (normalized.startsWith("i need")) {
      ["water", "help", "medication", "a break", "my caregiver"].forEach((item) =>
        suggestions.add(item),
      );
    }

    if (normalized.startsWith("please")) {
      ["help me", "call my caregiver", "wait a moment", "turn on the lights"].forEach((item) =>
        suggestions.add(item),
      );
    }

    if (normalized.includes("turn")) {
      ["off lights", "on lights", "off fan", "on fan"].forEach((item) => suggestions.add(item));
    }

    context.frequentPhrases.forEach((phrase) => {
      if (phrase.toLowerCase().startsWith(normalized)) {
        suggestions.add(phrase.slice(text.length).trim());
      }
    });

    return Array.from(suggestions)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 4);
  }

  public getDynamicPhrases(): DynamicPhrase[] {
    const context = this.getContext();

    if (context.timeOfDay === "morning") {
      return [
        { id: "morning-1", text: "Good morning", category: "greeting" },
        { id: "morning-2", text: "I'm hungry", category: "needs" },
        { id: "morning-3", text: "I need to brush my teeth", category: "needs" },
        { id: "morning-4", text: "What's for breakfast?", category: "food" },
      ];
    }

    if (context.timeOfDay === "afternoon") {
      return [
        { id: "afternoon-1", text: "Good afternoon", category: "greeting" },
        { id: "afternoon-2", text: "I want to go outside", category: "requests" },
        { id: "afternoon-3", text: "Can we read a book?", category: "requests" },
        { id: "afternoon-4", text: "I need a nap", category: "needs" },
      ];
    }

    if (context.timeOfDay === "evening") {
      return [
        { id: "evening-1", text: "Good evening", category: "greeting" },
        { id: "evening-2", text: "Turn on the lights", category: "home" },
        { id: "evening-3", text: "I'm tired", category: "needs" },
        { id: "evening-4", text: "What's for dinner?", category: "food" },
      ];
    }

    return [
      { id: "night-1", text: "Good night", category: "greeting" },
      { id: "night-2", text: "Turn off lights", category: "home" },
      { id: "night-3", text: "I'm sleepy", category: "needs" },
      { id: "night-4", text: "See you tomorrow", category: "greeting" },
    ];
  }

  private getContext(): CompletionContext {
    const hour = new Date().getHours();
    let timeOfDay: CompletionContext["timeOfDay"] = "morning";

    if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17 && hour < 21) timeOfDay = "evening";
    else if (hour >= 21 || hour < 5) timeOfDay = "night";

    return {
      timeOfDay,
      frequentPhrases: this.readHistory(),
    };
  }

  private readHistory(): string[] {
    if (typeof window === "undefined") return [];

    try {
      const raw = window.localStorage.getItem(this.historyStorageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  }
}

export const aiService = AIService.getInstance();

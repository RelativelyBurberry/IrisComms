import { NextResponse } from "next/server";
import { generateGroqText } from "@/lib/server/groq";
import { getRuntimeSnapshot } from "@/lib/server/runtime-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: string;
      context?: { timeOfDay?: string; recentPhrases?: string[] };
    };

    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ completions: [] });
    }

    const snapshot = await getRuntimeSnapshot();
    const patientContext = snapshot.settings;
    const prompt = [
      "You are an assistive communication AI for a patient-facing AAC system.",
      `Current text: "${text}"`,
      `Time of day: ${body.context?.timeOfDay || "unknown"}`,
      `Recent phrases: ${(body.context?.recentPhrases || []).join(", ") || "none"}`,
      `Patient name: ${patientContext.patientName || "unknown"}`,
      `Diagnosis or condition: ${patientContext.diagnosis || "not provided"}`,
      `Priority needs: ${patientContext.priorityNeeds.join(", ") || "not provided"}`,
      `Care notes: ${patientContext.careNotes || "not provided"}`,
      "Prioritize medically safe, emotionally supportive, concise, high-utility completions.",
      "Return up to 4 short completions, one per line, no bullets, no explanations.",
    ].join("\n");

    const content = await generateGroqText(prompt);
    const completions = content
      .split("\n")
      .map((line) => line.replace(/^[-*0-9.\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 4);

    return NextResponse.json({ completions });
  } catch (error) {
    return NextResponse.json(
      { completions: [], error: error instanceof Error ? error.message : "Unknown AI error" },
      { status: 200 },
    );
  }
}

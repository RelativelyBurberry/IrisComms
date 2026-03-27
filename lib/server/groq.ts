const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

function getGroqApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  return key;
}

export async function generateGroqText(prompt: string): Promise<string> {
  const apiKey = getGroqApiKey();

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 120,
      messages: [
        {
          role: "system",
          content:
            "You are IrisComm, an assistive communication AI. Respond with concise phrase suggestions only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Groq request failed: ${response.status} ${message}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content?.trim() || "";
}

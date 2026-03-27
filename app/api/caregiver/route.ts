import { NextResponse } from "next/server";
import { addCaregiverMessage, getRuntimeSnapshot } from "@/lib/server/runtime-store";

export async function GET() {
  return NextResponse.json(await getRuntimeSnapshot());
}

export async function POST(request: Request) {
  const body = (await request.json()) as { text?: string; from?: string };

  if (!body.text?.trim()) {
    return NextResponse.json({ error: "Message text is required" }, { status: 400 });
  }

  const snapshot = await addCaregiverMessage(body.text.trim(), body.from?.trim() || "Caregiver");
  return NextResponse.json(snapshot);
}

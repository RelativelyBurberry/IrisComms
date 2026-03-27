import { NextResponse } from "next/server";
import { getRuntimeSnapshot, updateRuntimeSnapshot } from "@/lib/server/runtime-store";

export async function GET() {
  return NextResponse.json(await getRuntimeSnapshot());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    lastKnownText?: string;
    iotDevices?: Array<{ id: string; name: string; status: "on" | "off"; type: string }>;
    settings?: {
      eyeSensitivity?: number;
      dwellTime?: number;
      voiceSpeed?: number;
      voiceType?: string;
      language?: string;
      theme?: string;
      caregiverContact?: string;
      emergencyContacts?: string[];
      patientName?: string;
      diagnosis?: string;
      priorityNeeds?: string[];
      careNotes?: string;
    };
    analyticsData?: {
      typingSpeed?: number[];
      accuracy?: number[];
      mostUsedPhrases?: Array<{ phrase: string; count: number }>;
      totalSessionTime?: number;
    };
  };

  const snapshot = updateRuntimeSnapshot({
    ...(body.lastKnownText !== undefined ? { lastKnownText: body.lastKnownText } : {}),
    ...(body.iotDevices ? { iotDevices: body.iotDevices } : {}),
    ...(body.settings ? { settings: body.settings } : {}),
    ...(body.analyticsData ? { analyticsData: body.analyticsData } : {}),
  });

  return NextResponse.json(await snapshot);
}

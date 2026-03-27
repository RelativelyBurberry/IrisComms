import { NextResponse } from "next/server";
import { addEmergencyLog } from "@/lib/server/runtime-store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    type?: string;
    status?: string;
    message?: string;
  };

  const alertMessage =
    body.message ||
    "Emergency alert triggered from IrisComm. Immediate assistance may be required.";

  const snapshot = await addEmergencyLog(
    body.type || "Emergency Trigger",
    body.status || "Logged",
    alertMessage,
  );

  return NextResponse.json(snapshot);
}

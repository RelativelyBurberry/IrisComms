import { NextResponse } from "next/server";
import { toggleRuntimeDevice } from "@/lib/server/runtime-store";

export async function POST(request: Request) {
  const body = (await request.json()) as { id?: string };

  if (!body.id) {
    return NextResponse.json({ error: "Device id is required" }, { status: 400 });
  }

  const snapshot = await toggleRuntimeDevice(body.id);
  return NextResponse.json(snapshot);
}

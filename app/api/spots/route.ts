import { NextResponse } from "next/server";
import { getSpotsRemaining } from "@/lib/spots";

export const dynamic = "force-dynamic";

export async function GET() {
  const spots = await getSpotsRemaining();
  return NextResponse.json({ spots });
}

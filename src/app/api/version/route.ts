import { NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/version";

// Força a rota a não ser estática/cacheada pela Vercel
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ version: APP_VERSION });
}

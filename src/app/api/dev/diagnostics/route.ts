import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const diagnostics: any = {
    env: {
      DATABASE_URL_DEFINED: !!process.env.DATABASE_URL,
      DATABASE_URL_START: process.env.DATABASE_URL 
        ? process.env.DATABASE_URL.substring(0, 20) + "..." 
        : undefined,
      JWT_SECRET_DEFINED: !!process.env.JWT_SECRET,
      JWT_SECRET_LENGTH: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      ENCRYPTION_KEY_DEFINED: !!process.env.ENCRYPTION_KEY,
      NODE_ENV: process.env.NODE_ENV
    },
    database: {
      connected: false,
      error: null,
      userCount: 0
    }
  };

  try {
    const userCount = await db.user.count();
    diagnostics.database.connected = true;
    diagnostics.database.userCount = userCount;
  } catch (err: any) {
    diagnostics.database.error = {
      message: err.message,
      code: err.code,
      meta: err.meta
    };
  }

  return NextResponse.json(diagnostics);
}

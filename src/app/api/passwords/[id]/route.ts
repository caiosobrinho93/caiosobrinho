import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    const passwordRecord = await db.password.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!passwordRecord || passwordRecord.userId !== session.userId) {
      return NextResponse.json({ error: "Password record not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...passwordRecord,
      password: decrypt(passwordRecord.password),
      createdBy: passwordRecord.user.username,
    });
  } catch (error) {
    console.error("GET password error:", error);
    return NextResponse.json({ error: "Failed to fetch password details" }, { status: 500 });
  }
}

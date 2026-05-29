import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    const software = await db.software.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!software || software.userId !== session.userId) {
      return NextResponse.json({ error: "Software not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...software,
      createdBy: software.user.username,
    });
  } catch (error) {
    console.error("GET software error:", error);
    return NextResponse.json({ error: "Failed to fetch software details" }, { status: 500 });
  }
}

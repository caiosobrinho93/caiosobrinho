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

    const torrent = await db.torrent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!torrent || torrent.userId !== session.userId) {
      return NextResponse.json({ error: "Torrent not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...torrent,
      createdBy: torrent.user.username,
    });
  } catch (error) {
    console.error("GET torrent error:", error);
    return NextResponse.json({ error: "Failed to fetch torrent details" }, { status: 500 });
  }
}

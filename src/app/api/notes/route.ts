import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardXP } from "@/lib/gamification";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const notes = await db.note.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, content, category, tags } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const note = await db.note.create({
      data: {
        userId: session.userId,
        title,
        content: content || "",
        category: category || "General",
        tags: tags || "",
      },
    });

    // Award +20 XP for note creation
    await awardXP(session.userId, 20);

    return NextResponse.json(note);
  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json({ error: "Failed to create note entry" }, { status: 500 });
  }
}

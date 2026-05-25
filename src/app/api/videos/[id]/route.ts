import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { isFavorite, progress } = await request.json();
    const { id } = await params;

    // Check ownership
    const existingVideo = await db.video.findUnique({
      where: { id },
    });

    if (!existingVideo || existingVideo.userId !== session.userId) {
      return NextResponse.json({ error: "Video not found or access denied" }, { status: 404 });
    }

    const updatedVideo = await db.video.update({
      where: { id },
      data: {
        ...(isFavorite !== undefined ? { isFavorite } : {}),
        ...(progress !== undefined ? { progress: parseInt(progress) } : {}),
      },
    });

    return NextResponse.json(updatedVideo);
  } catch (error) {
    console.error("PATCH video error:", error);
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    // Check ownership
    const existingVideo = await db.video.findUnique({
      where: { id },
    });

    if (!existingVideo || existingVideo.userId !== session.userId) {
      return NextResponse.json({ error: "Video not found or access denied" }, { status: 404 });
    }

    await db.video.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE video error:", error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}

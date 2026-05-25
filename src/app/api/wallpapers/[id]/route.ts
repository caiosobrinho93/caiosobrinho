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
    const { id } = await params;
    const { isFavorite } = await request.json();

    const existing = await db.wallpaper.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const updated = await db.wallpaper.update({
      where: { id },
      data: { isFavorite },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH wallpaper error:", error);
    return NextResponse.json({ error: "Failed to update wallpaper" }, { status: 500 });
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

    const existing = await db.wallpaper.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await db.wallpaper.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE wallpaper error:", error);
    return NextResponse.json({ error: "Failed to delete wallpaper" }, { status: 500 });
  }
}

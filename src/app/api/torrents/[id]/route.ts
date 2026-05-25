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
    const { status, progress, downloadSpeed, uploadSpeed } = await request.json();

    // Check ownership
    const existing = await db.torrent.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const data: any = {};
    if (status !== undefined) data.status = status;
    if (progress !== undefined) data.progress = parseFloat(progress);
    if (downloadSpeed !== undefined) data.downloadSpeed = parseFloat(downloadSpeed);
    if (uploadSpeed !== undefined) data.uploadSpeed = parseFloat(uploadSpeed);

    const updated = await db.torrent.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH torrent error:", error);
    return NextResponse.json({ error: "Failed to update torrent" }, { status: 500 });
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
    const existing = await db.torrent.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await db.torrent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE torrent error:", error);
    return NextResponse.json({ error: "Failed to delete torrent" }, { status: 500 });
  }
}

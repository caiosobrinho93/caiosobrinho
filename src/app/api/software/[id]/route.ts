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
    const { name, version, description, downloadUrl, platform, category, notes } = await request.json();

    const existing = await db.software.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const updated = await db.software.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(version !== undefined ? { version } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(downloadUrl !== undefined ? { downloadUrl } : {}),
        ...(platform !== undefined ? { platform } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH software error:", error);
    return NextResponse.json({ error: "Failed to update software" }, { status: 500 });
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

    const existing = await db.software.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await db.software.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE software error:", error);
    return NextResponse.json({ error: "Failed to delete software entry" }, { status: 500 });
  }
}

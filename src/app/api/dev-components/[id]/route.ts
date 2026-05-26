import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id: componentId } = await params;

    // Verify ownership
    const existing = await db.devComponent.findUnique({ where: { id: componentId } });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    }

    const updated = await db.devComponent.update({
      where: { id: componentId },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating dev component:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: componentId } = await params;

    const existing = await db.devComponent.findUnique({ where: { id: componentId } });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    }

    await db.devComponent.delete({ where: { id: componentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting dev component:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

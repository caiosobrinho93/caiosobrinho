import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { title, username, email, password, url, notes, category, tags, isFavorite } = await request.json();

    // Check ownership
    const existing = await db.password.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (username !== undefined) data.username = username;
    if (email !== undefined) data.email = email;
    if (password !== undefined) data.password = encrypt(password);
    if (url !== undefined) data.url = url;
    if (notes !== undefined) data.notes = notes;
    if (category !== undefined) data.category = category;
    if (tags !== undefined) data.tags = tags;
    if (isFavorite !== undefined) data.isFavorite = isFavorite;

    const updated = await db.password.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH password error:", error);
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
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
    const existing = await db.password.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await db.password.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE password error:", error);
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}

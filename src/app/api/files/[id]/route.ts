import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "file" or "folder"
    const { isFavorite, name } = await request.json();

    if (type === "folder") {
      const folder = await db.folder.findUnique({ where: { id } });
      if (!folder || folder.userId !== session.userId) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
      
      const updated = await db.folder.update({
        where: { id },
        data: {
          ...(name !== undefined ? { name } : {}),
        },
      });
      return NextResponse.json(updated);
    }

    const file = await db.file.findUnique({ where: { id } });
    if (!file || file.userId !== session.userId) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const updated = await db.file.update({
      where: { id },
      data: {
        ...(isFavorite !== undefined ? { isFavorite } : {}),
        ...(name !== undefined ? { name } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH file error:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "file" or "folder"

    if (type === "folder") {
      const folder = await db.folder.findUnique({
        where: { id },
        include: { files: true },
      });

      if (!folder || folder.userId !== session.userId) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }

      // Delete physical files under this folder
      for (const file of folder.files) {
        if (file.path.startsWith("/uploads/")) {
          try {
            const filePath = path.join(process.cwd(), "public", file.path);
            await unlink(filePath);
          } catch (e) {
            console.error("Failed to delete physical file:", file.path, e);
          }
        }
      }

      // Prisma cascade deletes the folder and child records
      await db.folder.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    const file = await db.file.findUnique({ where: { id } });
    if (!file || file.userId !== session.userId) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.path.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), "public", file.path);
        await unlink(filePath);
      } catch (e) {
        console.error("Failed to delete file from disk:", file.path, e);
      }
    }

    await db.file.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE file error:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}

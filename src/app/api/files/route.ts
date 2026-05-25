import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folderId") || null;
  const search = searchParams.get("search") || "";

  try {
    const userId = session.userId;

    if (search) {
      const files = await db.file.findMany({
        where: {
          userId,
          name: { contains: search },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ files, folders: [] });
    }

    const folders = await db.folder.findMany({
      where: {
        userId,
        parentFolderId: folderId === "root" || !folderId ? null : folderId,
      },
      orderBy: { name: "asc" },
    });

    const files = await db.file.findMany({
      where: {
        userId,
        folderId: folderId === "root" || !folderId ? null : folderId,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ folders, files });
  } catch (error) {
    console.error("GET files error:", error);
    return NextResponse.json({ error: "Failed to list directory contents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const action = formData.get("action"); // "upload" or "mkdir"
    const folderId = formData.get("folderId") as string || null;

    if (action === "mkdir") {
      const name = formData.get("name") as string;
      if (!name) return NextResponse.json({ error: "Folder name is required" }, { status: 400 });

      const newFolder = await db.folder.create({
        data: {
          userId: session.userId,
          name,
          parentFolderId: folderId === "root" || !folderId ? null : folderId,
        },
      });

      return NextResponse.json(newFolder);
    }

    if (action === "upload") {
      const file = formData.get("file") as File;
      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      const filePath = `/uploads/${filename}`;

      const newFile = await db.file.create({
        data: {
          userId: session.userId,
          name: file.name,
          path: filePath,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
          folderId: folderId === "root" || !folderId ? null : folderId,
        },
      });

      return NextResponse.json(newFile);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST files upload error:", error);
    return NextResponse.json({ error: "Failed to complete filesystem action" }, { status: 500 });
  }
}

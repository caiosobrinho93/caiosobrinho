import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const wallpapers = await db.wallpaper.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(wallpapers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch wallpapers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const contentType = request.headers.get("content-type") || "";
    let title = "";
    let url = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = formData.get("title") as string;
      const file = formData.get("file") as File | null;
      const urlText = formData.get("url") as string || "";

      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        url = `/uploads/${filename}`;
      } else {
        url = urlText;
      }
    } else {
      const body = await request.json();
      title = body.title;
      url = body.url;
    }

    if (!title || !url) {
      return NextResponse.json({ error: "O título e a imagem (arquivo ou URL) são obrigatórios." }, { status: 400 });
    }

    const wallpaper = await db.wallpaper.create({
      data: {
        userId: session.userId,
        title,
        url,
      },
    });

    return NextResponse.json(wallpaper);
  } catch (error) {
    console.error("Create wallpaper error:", error);
    return NextResponse.json({ error: "Erro ao adicionar wallpaper" }, { status: 500 });
  }
}

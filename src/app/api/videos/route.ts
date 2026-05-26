import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { awardXP } from "@/lib/gamification";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  try {
    const videos = await db.video.findMany({
      where: {
        AND: [
          search ? { title: { contains: search } } : {},
          category ? { category: { equals: category } } : {},
        ],
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const contentType = request.headers.get("content-type") || "";
    let title = "";
    let url = "";
    let thumbnailUrl = "";
    let category = "Geral";
    let tags = "";
    let duration: number | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = formData.get("title") as string;
      const file = formData.get("file") as File | null;
      const urlText = formData.get("url") as string || "";
      const thumbFile = formData.get("thumbnailFile") as File | null;
      const thumbUrlText = formData.get("thumbnailUrl") as string || "";
      category = formData.get("category") as string || "Geral";
      tags = formData.get("tags") as string || "";
      const durationText = formData.get("duration") as string;
      duration = durationText ? parseInt(durationText) : null;

      // Tratar upload de vídeo físico
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

      // Tratar upload de capa física
      if (thumbFile && thumbFile.size > 0) {
        const buffer = Buffer.from(await thumbFile.arrayBuffer());
        const filename = `${Date.now()}-${thumbFile.name.replace(/\s+/g, "_")}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        thumbnailUrl = `/uploads/${filename}`;
      } else {
        thumbnailUrl = thumbUrlText;
      }
    } else {
      const body = await request.json();
      title = body.title;
      url = body.url;
      thumbnailUrl = body.thumbnailUrl;
      category = body.category || "Geral";
      tags = body.tags || "";
      duration = body.duration ? parseInt(body.duration) : null;
    }

    if (!title || !url) {
      return NextResponse.json({ error: "Título e arquivo/URL do vídeo são obrigatórios" }, { status: 400 });
    }

    const video = await db.video.create({
      data: {
        userId: session.userId,
        title,
        url,
        thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop",
        category,
        tags,
        duration,
      },
    });

    // Award +40 XP for video creation
    await awardXP(session.userId, 40);

    return NextResponse.json(video);
  } catch (error) {
    console.error("Create video error:", error);
    return NextResponse.json({ error: "Falha ao cadastrar vídeo" }, { status: 500 });
  }
}

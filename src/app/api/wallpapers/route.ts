import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadToSupabase } from "@/lib/storage";
import { awardXP } from "@/lib/gamification";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const wallpapers = await db.wallpaper.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
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

      // Salva o arquivo de imagem no Supabase Storage
      if (file && file.size > 0) {
        url = await uploadToSupabase(file, "wallpapers");
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

    // Award +40 XP for wallpaper creation
    await awardXP(session.userId, 40);

    return NextResponse.json(wallpaper);
  } catch (error: any) {
    console.error("Create wallpaper error:", error);
    return NextResponse.json({ error: error.message || "Erro ao adicionar wallpaper" }, { status: 500 });
  }
}

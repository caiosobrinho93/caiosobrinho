import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadToSupabase } from "@/lib/storage";
import { awardXP } from "@/lib/gamification";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const torrents = await db.torrent.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    return NextResponse.json(torrents);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch torrents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const contentType = request.headers.get("content-type") || "";
    let title = "";
    let magnet = "";
    let size = "1.8 GB";
    let notes = "";
    let fileUrl = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = formData.get("title") as string;
      magnet = formData.get("magnet") as string || "";
      size = formData.get("size") as string || "1.8 GB";
      notes = formData.get("notes") as string || "";
      const file = formData.get("file") as File | null;

      if (file && file.size > 0) {
        fileUrl = await uploadToSupabase(file, "torrents");
      }
    } else {
      const body = await request.json();
      title = body.title;
      magnet = body.magnet;
      size = body.size;
      notes = body.notes;
    }

    if (!title) {
      return NextResponse.json({ error: "O título do torrent é obrigatório." }, { status: 400 });
    }

    if (!magnet) {
      // Gerar magnet virtual caso o usuário faça apenas o upload do arquivo .torrent
      magnet = `magnet:?xt=urn:btih:virtual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    } else {
      // Verificar unicidade se for informado um magnet real
      const existing = await db.torrent.findUnique({ where: { magnet } });
      if (existing) {
        return NextResponse.json({ error: "Este link magnet já existe no cofre" }, { status: 400 });
      }
    }

    let finalNotes = notes;
    if (fileUrl) {
      finalNotes = `[FILE]:${fileUrl}\n${notes}`;
    }

    const torrent = await db.torrent.create({
      data: {
        userId: session.userId,
        title,
        magnet,
        size: size || "1.5 GB",
        status: "completed",
        progress: 100.0,
        downloadSpeed: 0.0,
        uploadSpeed: 0.0,
        notes: finalNotes,
      },
    });

    // Award +40 XP for torrent creation
    await awardXP(session.userId, 40);

    return NextResponse.json(torrent);
  } catch (error) {
    console.error("Create torrent error:", error);
    return NextResponse.json({ error: "Erro ao registrar torrent" }, { status: 500 });
  }
}

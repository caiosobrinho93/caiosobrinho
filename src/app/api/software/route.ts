import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadToSupabase } from "@/lib/storage";
import { awardXP } from "@/lib/gamification";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const softwareList = await db.software.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        version: true,
        iconUrl: true,
        category: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    const minimalSoftware = softwareList.map((s) => ({
      ...s,
      description: "",
      downloadUrl: "",
      platform: "",
      notes: "",
      createdBy: s.user.username,
    }));

    return NextResponse.json(minimalSoftware);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch software list" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const contentType = request.headers.get("content-type") || "";
    let name = "";
    let version = "";
    let description = "";
    let downloadUrl = "";
    let platform = "";
    let iconUrl = "";
    let category = "Utilitários";
    let notes = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      name = formData.get("name") as string;
      version = formData.get("version") as string;
      description = formData.get("description") as string || "";
      const file = formData.get("file") as File | null;
      const downloadUrlText = formData.get("downloadUrl") as string || "";
      platform = formData.get("platform") as string;
      const iconFile = formData.get("iconFile") as File | null;
      category = formData.get("category") as string || "Utilitários";
      notes = formData.get("notes") as string || "";

      // Tratar upload do instalador do software para o Supabase Storage
      if (file && file.size > 0) {
        downloadUrl = await uploadToSupabase(file, "software");
      } else {
        downloadUrl = downloadUrlText;
      }

      // Tratar upload do ícone do software para o Supabase Storage
      if (iconFile && iconFile.size > 0) {
        iconUrl = await uploadToSupabase(iconFile, "icons");
      } else {
        iconUrl = `https://avatar.vercel.sh/${name.replace(/\s+/g, "").toLowerCase()}`;
      }
    } else {
      const body = await request.json();
      name = body.name;
      version = body.version;
      description = body.description || "";
      downloadUrl = body.downloadUrl || "";
      platform = body.platform;
      iconUrl = body.iconUrl || `https://avatar.vercel.sh/${name.replace(/\s+/g, "").toLowerCase()}`;
      category = body.category || "Utilitários";
      notes = body.notes || "";
    }

    if (!name || !version || !platform) {
      return NextResponse.json({ error: "Nome, Versão e Plataforma são obrigatórios" }, { status: 400 });
    }

    const software = await db.software.create({
      data: {
        userId: session.userId,
        name,
        version,
        description,
        downloadUrl,
        platform,
        iconUrl,
        category,
        notes,
      },
    });

    // Award +30 XP for software creation
    await awardXP(session.userId, 30);

    return NextResponse.json(software);
  } catch (error: any) {
    console.error("Create software error:", error);
    return NextResponse.json({ error: error.message || "Falha ao registrar software" }, { status: 500 });
  }
}

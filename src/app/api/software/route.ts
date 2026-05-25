import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const softwareList = await db.software.findMany({
      where: { userId: session.userId },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(softwareList);
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

      // Tratar upload do instalador do software
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        downloadUrl = `/uploads/${filename}`;
      } else {
        downloadUrl = downloadUrlText;
      }

      // Tratar upload do ícone do software
      if (iconFile && iconFile.size > 0) {
        const buffer = Buffer.from(await iconFile.arrayBuffer());
        const filename = `${Date.now()}-${iconFile.name.replace(/\s+/g, "_")}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        iconUrl = `/uploads/${filename}`;
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

    return NextResponse.json(software);
  } catch (error) {
    console.error("Create software error:", error);
    return NextResponse.json({ error: "Falha ao registrar software" }, { status: 500 });
  }
}

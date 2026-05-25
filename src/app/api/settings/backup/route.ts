import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = session.userId;
    const [notes, passwords, videos, wallpapers, software, torrents, folders, files] = await Promise.all([
      db.note.findMany({ where: { userId } }),
      db.password.findMany({ where: { userId } }),
      db.video.findMany({ where: { userId } }),
      db.wallpaper.findMany({ where: { userId } }),
      db.software.findMany({ where: { userId } }),
      db.torrent.findMany({ where: { userId } }),
      db.folder.findMany({ where: { userId } }),
      db.file.findMany({ where: { userId } }),
    ]);

    const backupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      data: {
        notes,
        passwords,
        videos,
        wallpapers,
        software,
        torrents,
        folders,
        files,
      },
    };

    return NextResponse.json(backupData);
  } catch (error) {
    console.error("GET backup error:", error);
    return NextResponse.json({ error: "Failed to export vault backup" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = session.userId;
    const { data } = await request.json();

    if (!data) return NextResponse.json({ error: "Invalid backup data" }, { status: 400 });

    // Perform database wipes & insertion inside a transaction
    await db.$transaction([
      db.note.deleteMany({ where: { userId } }),
      db.password.deleteMany({ where: { userId } }),
      db.video.deleteMany({ where: { userId } }),
      db.wallpaper.deleteMany({ where: { userId } }),
      db.software.deleteMany({ where: { userId } }),
      db.torrent.deleteMany({ where: { userId } }),
      db.file.deleteMany({ where: { userId } }),
      db.folder.deleteMany({ where: { userId } }),
    ]);

    // Insert Folders
    if (data.folders && data.folders.length > 0) {
      await db.folder.createMany({
        data: data.folders.map((f: any) => ({
          id: f.id,
          userId,
          name: f.name,
          parentFolderId: f.parentFolderId,
          createdAt: f.createdAt ? new Date(f.createdAt) : undefined,
        })),
      });
    }

    // Insert Files
    if (data.files && data.files.length > 0) {
      await db.file.createMany({
        data: data.files.map((f: any) => ({
          id: f.id,
          userId,
          name: f.name,
          path: f.path,
          size: f.size,
          mimeType: f.mimeType,
          isFavorite: f.isFavorite,
          folderId: f.folderId,
          createdAt: f.createdAt ? new Date(f.createdAt) : undefined,
        })),
      });
    }

    // Insert Notes
    if (data.notes && data.notes.length > 0) {
      await db.note.createMany({
        data: data.notes.map((n: any) => ({
          id: n.id,
          userId,
          title: n.title,
          content: n.content,
          category: n.category,
          tags: n.tags,
          isFavorite: n.isFavorite,
          createdAt: n.createdAt ? new Date(n.createdAt) : undefined,
        })),
      });
    }

    // Insert Passwords
    if (data.passwords && data.passwords.length > 0) {
      await db.password.createMany({
        data: data.passwords.map((p: any) => ({
          id: p.id,
          userId,
          title: p.title,
          username: p.username,
          email: p.email,
          password: p.password,
          url: p.url,
          notes: p.notes,
          category: p.category,
          tags: p.tags,
          isFavorite: p.isFavorite,
          createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
        })),
      });
    }

    // Insert Videos
    if (data.videos && data.videos.length > 0) {
      await db.video.createMany({
        data: data.videos.map((v: any) => ({
          id: v.id,
          userId,
          title: v.title,
          url: v.url,
          thumbnailUrl: v.thumbnailUrl,
          duration: v.duration,
          progress: v.progress,
          isFavorite: v.isFavorite,
          category: v.category,
          tags: v.tags,
          createdAt: v.createdAt ? new Date(v.createdAt) : undefined,
        })),
      });
    }

    // Insert Wallpapers
    if (data.wallpapers && data.wallpapers.length > 0) {
      await db.wallpaper.createMany({
        data: data.wallpapers.map((w: any) => ({
          id: w.id,
          userId,
          title: w.title,
          url: w.url,
          width: w.width,
          height: w.height,
          isFavorite: w.isFavorite,
          createdAt: w.createdAt ? new Date(w.createdAt) : undefined,
        })),
      });
    }

    // Insert Software
    if (data.software && data.software.length > 0) {
      await db.software.createMany({
        data: data.software.map((s: any) => ({
          id: s.id,
          userId,
          name: s.name,
          version: s.version,
          description: s.description,
          downloadUrl: s.downloadUrl,
          platform: s.platform,
          iconUrl: s.iconUrl,
          category: s.category,
          notes: s.notes,
          createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
        })),
      });
    }

    // Insert Torrents
    if (data.torrents && data.torrents.length > 0) {
      await db.torrent.createMany({
        data: data.torrents.map((t: any) => ({
          id: t.id,
          userId,
          title: t.title,
          magnet: t.magnet,
          status: t.status,
          progress: t.progress,
          downloadSpeed: t.downloadSpeed,
          uploadSpeed: t.uploadSpeed,
          size: t.size,
          notes: t.notes,
          createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST restore error:", error);
    return NextResponse.json({ error: "Failed to restore backup data" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const steps: any = {};
  let userId = "a8024591-ef15-40e7-9064-ca0a066ce410"; // Caio's default user ID

  // 1. Check Session
  try {
    const session = await getSession();
    steps.session = {
      present: !!session,
      userId: session?.userId,
      username: session?.username
    };
    if (session) {
      userId = session.userId;
    }
  } catch (err: any) {
    steps.session = { error: err.message };
  }

  // 2. Query Profile
  try {
    const userProfile = await db.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true, username: true }
    });
    steps.profile = { success: true, data: userProfile };
  } catch (err: any) {
    steps.profile = { success: false, error: err.message };
  }

  // 3. Query Raw Stats
  try {
    const consolidatedStats = await db.$queryRaw`
      SELECT 
        -- Counts
        (SELECT COUNT(*)::int FROM "Note") as notes_count,
        (SELECT COUNT(*)::int FROM "Password") as passwords_count,
        (SELECT COUNT(*)::int FROM "Video") as videos_count,
        (SELECT COUNT(*)::int FROM "Wallpaper") as wallpapers_count,
        (SELECT COUNT(*)::int FROM "Software") as software_count,
        (SELECT COUNT(*)::int FROM "Torrent") as torrents_count,
        (SELECT COUNT(*)::int FROM "File") as files_count,
        (SELECT COUNT(*)::int FROM "Receipt") as receipts_count,
        (SELECT COUNT(*)::int FROM "Bill") as bills_count,

        -- Storage Stats
        (SELECT COALESCE(SUM(size), 0)::double precision FROM "File") as total_file_size,
        (SELECT COALESCE(SUM(CASE WHEN "mimeType" LIKE 'image/%' THEN size ELSE 0 END), 0)::double precision FROM "File") as image_file_size,
        (SELECT COALESCE(SUM(CASE WHEN "mimeType" LIKE '%pdf%' OR "mimeType" LIKE '%text%' OR "mimeType" LIKE '%document%' THEN size ELSE 0 END), 0)::double precision FROM "File") as doc_file_size,
        (SELECT COALESCE(SUM(CASE WHEN "mimeType" LIKE 'video/%' THEN size ELSE 0 END), 0)::double precision FROM "File") as video_file_size,
        (SELECT COALESCE(SUM(CASE WHEN NOT ("mimeType" LIKE 'image/%' OR "mimeType" LIKE '%pdf%' OR "mimeType" LIKE '%text%' OR "mimeType" LIKE '%document%' OR "mimeType" LIKE 'video/%') THEN size ELSE 0 END), 0)::double precision FROM "File") as other_file_size,

        -- Bill Sums
        (SELECT COALESCE(SUM(CASE WHEN status = 'pago' AND type = 'pagar' THEN amount ELSE 0 END), 0)::double precision FROM "Bill") as total_paid,
        (SELECT COALESCE(SUM(CASE WHEN status = 'recebido' AND type = 'receber' THEN amount ELSE 0 END), 0)::double precision FROM "Bill") as total_received
    `;
    steps.consolidatedStats = { success: true, data: consolidatedStats };
  } catch (err: any) {
    steps.consolidatedStats = { success: false, error: err.message };
  }

  // 4. Query Goals
  try {
    const goals = await db.goal.findMany({ 
      orderBy: { createdAt: "asc" }, 
      include: { user: { select: { username: true } } } 
    });
    steps.goals = { success: true, count: goals.length };
  } catch (err: any) {
    steps.goals = { success: false, error: err.message };
  }

  // 5. Query Recent Items
  try {
    const recentItemsRaw = await db.$queryRaw`
      SELECT id, title, 'Nota' as type, 
             (SELECT username FROM "User" WHERE id = "userId") as "createdBy", 
             "updatedAt" as date, COALESCE(category, 'Geral') as details 
      FROM "Note"
      UNION ALL
      SELECT id, title, 'Vídeo' as type, 
             (SELECT username FROM "User" WHERE id = "userId") as "createdBy", 
             "updatedAt" as date, COALESCE(category, 'Geral') as details 
      FROM "Video"
      UNION ALL
      SELECT id, name as title, 'Arquivo' as type, 
             (SELECT username FROM "User" WHERE id = "userId") as "createdBy", 
             "updatedAt" as date, "mimeType" as details 
      FROM "File"
      UNION ALL
      SELECT id, title, 'Senha' as type, 
             (SELECT username FROM "User" WHERE id = "userId") as "createdBy", 
             "updatedAt" as date, COALESCE(username, 'Credenciais') as details 
      FROM "Password"
      ORDER BY date DESC
      LIMIT 5
    `;
    steps.recentItemsRaw = { success: true, count: (recentItemsRaw as any)?.length };
  } catch (err: any) {
    steps.recentItemsRaw = { success: false, error: err.message };
  }

  // 6. Query Favorites
  try {
    const favoritesRaw = await db.$queryRaw`
      SELECT id, title, 'Nota' as type, 
             (SELECT username FROM "User" WHERE id = "userId") as "createdBy", 
             "updatedAt" as date 
      FROM "Note" WHERE "isFavorite" = true
      UNION ALL
      SELECT id, title, 'Vídeo' as type, 
             (SELECT username FROM "User" WHERE id = "userId") as "createdBy", 
             "updatedAt" as date 
      FROM "Video" WHERE "isFavorite" = true
      UNION ALL
      SELECT id, name as title, 'Arquivo' as type, 
             (SELECT username FROM "User" WHERE id = "userId") as "createdBy", 
             "updatedAt" as date 
      FROM "File" WHERE "isFavorite" = true
      UNION ALL
      SELECT id, title, 'Wallpaper' as type, 
             (SELECT username FROM "User" WHERE id = "userId") as "createdBy", 
             "updatedAt" as date 
      FROM "Wallpaper" WHERE "isFavorite" = true
      UNION ALL
      SELECT id, title, 'Senha' as type, 
             (SELECT username FROM "User" WHERE id = "userId") as "createdBy", 
             "updatedAt" as date 
      FROM "Password" WHERE "isFavorite" = true
      ORDER BY date DESC
      LIMIT 5
    `;
    steps.favoritesRaw = { success: true, count: (favoritesRaw as any)?.length };
  } catch (err: any) {
    steps.favoritesRaw = { success: false, error: err.message };
  }

  // 7. Upcoming Bills
  try {
    const upcomingBills = await db.bill.findMany({
      where: {
        status: "pendente",
        dueDate: {
          lte: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        }
      },
      include: { user: { select: { username: true } } },
      orderBy: { dueDate: "asc" }
    });
    steps.upcomingBills = { success: true, count: upcomingBills.length };
  } catch (err: any) {
    steps.upcomingBills = { success: false, error: err.message };
  }

  // 8. Bank Accounts
  try {
    const dbAccounts = await db.bankAccount.findMany({
      where: { userId }
    });
    steps.dbAccounts = { success: true, count: dbAccounts.length };
  } catch (err: any) {
    steps.dbAccounts = { success: false, error: err.message };
  }

  return NextResponse.json({ success: true, steps });
}

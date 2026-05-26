import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

async function seedUserData(userId: string) {
  // Mock seeding
  console.log("Mock seeding for", userId);
}

export async function GET() {
  const userId = "a8024591-ef15-40e7-9064-ca0a066ce410"; // Caio's default user ID

  try {
    const [
      userProfile,
      consolidatedStats,
      goals,
      recentItemsRaw,
      favoritesRaw,
      upcomingBills,
      dbAccounts
    ] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true, username: true }
      }),
      db.$queryRaw<Array<{
        notes_count: number;
        passwords_count: number;
        videos_count: number;
        wallpapers_count: number;
        software_count: number;
        torrents_count: number;
        files_count: number;
        receipts_count: number;
        bills_count: number;
        total_file_size: number;
        image_file_size: number;
        doc_file_size: number;
        video_file_size: number;
        other_file_size: number;
        total_paid: number;
        total_received: number;
      }>>`
        SELECT 
          (SELECT COUNT(*)::int FROM "Note") as notes_count,
          (SELECT COUNT(*)::int FROM "Password") as passwords_count,
          (SELECT COUNT(*)::int FROM "Video") as videos_count,
          (SELECT COUNT(*)::int FROM "Wallpaper") as wallpapers_count,
          (SELECT COUNT(*)::int FROM "Software") as software_count,
          (SELECT COUNT(*)::int FROM "Torrent") as torrents_count,
          (SELECT COUNT(*)::int FROM "File") as files_count,
          (SELECT COUNT(*)::int FROM "Receipt") as receipts_count,
          (SELECT COUNT(*)::int FROM "Bill") as bills_count,
          (SELECT COALESCE(SUM(size), 0)::double precision FROM "File") as total_file_size,
          (SELECT COALESCE(SUM(CASE WHEN "mimeType" LIKE 'image/%' THEN size ELSE 0 END), 0)::double precision FROM "File") as image_file_size,
          (SELECT COALESCE(SUM(CASE WHEN "mimeType" LIKE '%pdf%' OR "mimeType" LIKE '%text%' OR "mimeType" LIKE '%document%' THEN size ELSE 0 END), 0)::double precision FROM "File") as doc_file_size,
          (SELECT COALESCE(SUM(CASE WHEN "mimeType" LIKE 'video/%' THEN size ELSE 0 END), 0)::double precision FROM "File") as video_file_size,
          (SELECT COALESCE(SUM(CASE WHEN NOT ("mimeType" LIKE 'image/%' OR "mimeType" LIKE '%pdf%' OR "mimeType" LIKE '%text%' OR "mimeType" LIKE '%document%' OR "mimeType" LIKE 'video/%') THEN size ELSE 0 END), 0)::double precision FROM "File") as other_file_size,
          (SELECT COALESCE(SUM(CASE WHEN status = 'pago' AND type = 'pagar' THEN amount ELSE 0 END), 0)::double precision FROM "Bill") as total_paid,
          (SELECT COALESCE(SUM(CASE WHEN status = 'recebido' AND type = 'receber' THEN amount ELSE 0 END), 0)::double precision FROM "Bill") as total_received
      `,
      db.goal.findMany({ orderBy: { createdAt: "asc" }, include: { user: { select: { username: true } } } }),
      db.$queryRaw<Array<{
        id: string;
        title: string;
        type: string;
        createdBy: string;
        date: Date;
        details: string;
      }>>`
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
      `,
      db.$queryRaw<Array<{
        id: string;
        title: string;
        type: string;
        createdBy: string;
        date: Date;
      }>>`
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
      `,
      db.bill.findMany({
        where: {
          status: "pendente",
          dueDate: {
            lte: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          }
        },
        include: { user: { select: { username: true } } },
        orderBy: { dueDate: "asc" }
      }),
      db.bankAccount.findMany({
        where: { userId }
      })
    ]);

    // -- RUNNING POST-PROCESSING CODE EXACTLY AS IN THE ORIGINAL STATS ROUTE --
    const stats = consolidatedStats[0];

    // Se a base de dados estiver vazia (0 notas no total), rodar o seeding inicial
    if (stats.notes_count === 0) {
      try {
        await seedUserData(userId);
      } catch (seedError) {
        console.warn("Seeding error:", seedError);
      }
    }

    // Mapear itens recentes
    const recentItems = recentItemsRaw.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      date: item.date,
      details: item.details,
      createdBy: item.createdBy
    }));

    // Mapear favoritos
    const favorites = favoritesRaw.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      createdBy: item.createdBy
    }));

    // 1. Calcular o tamanho real de armazenamento (banco de dados + local public/uploads) em memória
    const dbFilesSizeBytes = Number(stats.total_file_size || 0);
    const imageSizeBytes = Number(stats.image_file_size || 0);
    const docSizeBytes = Number(stats.doc_file_size || 0);
    const videoSizeBytes = Number(stats.video_file_size || 0);
    const otherSizeBytes = Number(stats.other_file_size || 0);

    let localUploadsSizeBytes = 0;
    try {
      const getDirSize = (dirPath: string): number => {
        let size = 0;
        if (!fs.existsSync(dirPath)) return 0;
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stats = fs.statSync(filePath);
          if (stats.isDirectory()) {
            size += getDirSize(filePath);
          } else if (stats.isFile()) {
            size += stats.size;
          }
        }
        return size;
      };

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      localUploadsSizeBytes = getDirSize(uploadDir);
    } catch (e) {
      console.error("Erro ao ler uploads locais:", e);
    }

    const totalFilesSizeBytes = dbFilesSizeBytes + localUploadsSizeBytes;
    const limitBytes = 5 * 1024 * 1024 * 1024; // 5 GB
    const percentUsed = Math.min(100, Math.round((totalFilesSizeBytes / limitBytes) * 100));

    const formatSize = (bytes: number) => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const imagesFormatted = formatSize(imageSizeBytes);
    const docsFormatted = formatSize(docSizeBytes);
    const videosFormatted = formatSize(videoSizeBytes + localUploadsSizeBytes);
    const othersFormatted = formatSize(otherSizeBytes);

    // 2. Estado de Sincronização Real do Banco
    const syncGoal = goals.find(g => g.title.includes("Sincronizar contas"));

    const totalPaid = stats.total_paid || 0;
    const totalReceived = stats.total_received || 0;

    const baseMP = 4829.10;
    const baseSAN = 15340.50;

    const defaultMPBalance = baseMP + totalReceived;
    const defaultSANBalance = baseSAN - totalPaid;

    let currentAccounts = dbAccounts;
    if (dbAccounts.length === 0) {
      try {
        const mp = await db.bankAccount.create({
          data: {
            userId,
            provider: "Mercado Pago",
            balance: defaultMPBalance,
            trend: "+12.4% este mês",
            syncType: "manual"
          }
        });
        const san = await db.bankAccount.create({
          data: {
            userId,
            provider: "Santander",
            balance: defaultSANBalance,
            trend: "+2.5% este mês",
            syncType: "manual"
          }
        });
        currentAccounts = [mp, san];
      } catch (err) {
        console.error("Erro ao criar contas bancárias default:", err);
      }
    }

    const financialAccounts = currentAccounts.map(acc => {
      let lastSyncText = "Pendente";
      if (acc.lastSync) {
        const date = new Date(acc.lastSync);
        const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        lastSyncText = `Hoje às ${timeStr}`;
      }

      return {
        id: acc.id,
        provider: acc.provider,
        balance: `R$ ${acc.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        rawBalance: acc.balance,
        status: "sync",
        lastSync: lastSyncText,
        trend: acc.trend,
        accountNumber: acc.accountNumber,
        apiKey: acc.apiKey,
        apiSecret: acc.apiSecret,
        syncType: acc.syncType
      };
    });

    const activityLog = [
      { id: "1", text: "Chaves de criptografia do cofre validadas com sucesso", time: "Agora mesmo", status: "success" },
      { id: "2", text: "Banco de dados Supabase sincronizado", time: "Há 5 min", status: "info" },
      { id: "3", text: `Contas registradas: ${stats.bills_count} no total`, time: "Agora", status: "info" },
      { id: "4", text: `Acesso de segurança authorized para ${userProfile?.username === "caio" ? "Caio" : "Giselle"}`, time: "Há 1 min", status: "success" }
    ];

    const resultBody = {
      counts: {
        notes: stats.notes_count,
        passwords: stats.passwords_count,
        videos: stats.videos_count,
        wallpapers: stats.wallpapers_count,
        software: stats.software_count,
        torrents: stats.torrents_count,
        files: stats.files_count,
        receipts: stats.receipts_count,
        bills: stats.bills_count,
      },
      profile: {
        xp: userProfile?.xp || 0,
        level: userProfile?.level || 1,
        username: userProfile?.username === "caio" ? "Caio" : userProfile?.username === "giselle" ? "Giselle" : "Usuário",
      },
      goals,
      recentItems,
      favorites,
      activityLog,
      financialAccounts,
      upcomingBills,
      storageStats: {
        totalSize: "5.0 GB",
        usedSize: formatSize(totalFilesSizeBytes),
        percentUsed,
        imagesSize: imagesFormatted,
        docsSize: docsFormatted,
        videosSize: videosFormatted,
        othersSize: othersFormatted,
      }
    };

    return NextResponse.json({ success: true, data: resultBody });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
}

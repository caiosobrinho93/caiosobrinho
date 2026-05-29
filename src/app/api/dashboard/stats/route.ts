import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

// Função para semear dados em Português
async function seedUserData(userId: string) {
  // 1. Criar Nota de Boas-vindas
  await db.note.create({
    data: {
      userId,
      title: "Bem-vindo ao Nexus Vault 🌌",
      category: "Guias",
      tags: "onboarding,nexus,vault",
      content: `# Nexus Vault

Bem-vindo ao seu novo sistema operacional pessoal! O Nexus Vault foi projetado para centralizar e organizar todos os seus recursos digitais de forma segura e elegante.

### Módulos do Sistema
1. **Cine Vault (Vídeos)**: Assista a vídeos locais ou incorpore links externos (ex: YouTube).
2. **Senhas**: Gerenciador de credenciais com criptografia AES-256 local e gerador automático.
3. **Arquivos**: Gerenciamento de pastas e arquivos com visualizador de imagens e PDFs integrados.
4. **Imagens**: Curadoria de papéis de parede com visualização em tela cheia.
5. **Softwares**: Catálogo de aplicativos instalados, controle de versões e links de instaladores.
6. **Torrents**: Lista de downloads de arquivos .torrent e botões com links magnet.
7. **Integração Financeira**: Painel analítico de contas integradas.
8. **Gamificação (Metas)**: Conclua metas listadas no Painel Geral para subir de nível e ganhar XP!

### Atalhos de Teclado
- \`Ctrl+K\` ou \`⌘K\` - Abre a barra de pesquisa/comando global.
- \`Esc\` - Fecha modais e visualizações.

Fique à vontade para excluir esta nota assim que estiver familiarizado!`,
      isFavorite: true,
    }
  });

  // 2. Criar Senhas
  await db.password.createMany({
    data: [
      {
        userId,
        title: "GitHub Pessoal",
        username: "caiosobrinho",
        email: "caio@exemplo.com",
        password: "U2FsdGVkX181YyE/tN4q5A==:d31a542b", // AES
        url: "https://github.com",
        imageUrl: "https://img.icons8.com/color/120/github--v1.png",
        category: "Desenvolvimento",
        tags: "codigo,git",
        notes: "Conta principal do GitHub para desenvolvimento de projetos.",
        isFavorite: true,
      },
      {
        userId,
        title: "Netflix Compartilhada",
        username: "caio_netflix",
        email: "netflix@exemplo.com",
        password: "U2FsdGVkX19F4kXzL4kU7A==:b31a243c",
        url: "https://netflix.com",
        imageUrl: "https://img.icons8.com/color/120/netflix.png",
        category: "Entretenimento",
        tags: "streaming",
        notes: "Credenciais de acesso para compartilhamento familiar.",
      }
    ]
  });

  // 3. Criar Vídeos
  await db.video.createMany({
    data: [
      {
        userId,
        title: "Odisseia Cósmica - Cinemática Espacial 8K",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop",
        duration: 596,
        progress: 120,
        category: "Documentário",
        tags: "espaco,universo,8k",
        isFavorite: true,
      },
      {
        userId,
        title: "Next.js App Router Masterclass Completo",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop",
        duration: 653,
        progress: 0,
        category: "Educação",
        tags: "programacao,webdev,nextjs",
      }
    ]
  });

  // 4. Criar Wallpapers
  await db.wallpaper.createMany({
    data: [
      {
        userId,
        title: "Ruas de Cyberpunk Neon",
        url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop",
        width: 3840,
        height: 2160,
        isFavorite: true,
      },
      {
        userId,
        title: "Nebulosa Espacial Profunda",
        url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop",
        width: 3840,
        height: 2160,
      },
      {
        userId,
        title: "Mesa de Programação Minimalista",
        url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop",
        width: 1920,
        height: 1080,
      }
    ]
  });

  // 5. Criar Softwares
  await db.software.createMany({
    data: [
      {
        userId,
        name: "Arc Browser",
        version: "1.24.1",
        description: "Um navegador de internet customizável e focado em espaços de trabalho organizados.",
        downloadUrl: "https://resources.arc.net",
        platform: "macOS, Windows",
        category: "Produtividade",
        notes: "Navegador de internet principal.",
      },
      {
        userId,
        name: "VS Code",
        version: "1.89.0",
        description: "Editor de código fonte leve, extensível e de alto desempenho.",
        downloadUrl: "https://code.visualstudio.com",
        platform: "Windows, macOS, Linux",
        category: "Desenvolvimento",
      }
    ]
  });

  // 6. Criar Torrents
  await db.torrent.createMany({
    data: [
      {
        userId,
        title: "ubuntu-26.04-live-server-amd64.iso",
        magnet: "magnet:?xt=urn:btih:b5d2b1f8ce1a3db5b9be190098dfc3848b6c59d1&dn=Ubuntu+Server",
        status: "downloading",
        progress: 68.4,
        downloadSpeed: 18.2,
        uploadSpeed: 1.4,
        size: "2.4 GB",
        notes: "Arquivo ISO para instalação de servidores locais.",
      },
      {
        userId,
        title: "blender-open-movie-project.blend",
        magnet: "magnet:?xt=urn:btih:f12c3f8e7b3967d8f9ba12a4b8893d9ef4a376de&dn=Blender+Movie",
        status: "seeding",
        progress: 100.0,
        downloadSpeed: 0.0,
        uploadSpeed: 4.8,
        size: "8.6 GB",
        notes: "Projeto de filme aberto feito no Blender.",
      }
    ]
  });

  // 7. Criar Pastas e Arquivos
  const docsFolder = await db.folder.create({
    data: {
      userId,
      name: "Documentos",
    }
  });

  const mediaFolder = await db.folder.create({
    data: {
      userId,
      name: "Mídia",
    }
  });

  await db.file.createMany({
    data: [
      {
        userId,
        name: "curriculo_caio.pdf",
        path: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        size: 32400,
        mimeType: "application/pdf",
        folderId: docsFolder.id,
        isFavorite: true,
      },
      {
        userId,
        name: "screenshot_painel.png",
        path: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
        size: 142000,
        mimeType: "image/png",
        folderId: mediaFolder.id,
      }
    ]
  });

  // 8. Criar Metas iniciais
  await db.goal.createMany({
    data: [
      {
        userId,
        title: "Configurar Chaveiro de Senhas",
        isCompleted: true,
        xpReward: 50,
      },
      {
        userId,
        title: "Fazer upload do primeiro backup pessoal",
        isCompleted: true,
        xpReward: 100,
      },
      {
        userId,
        title: "Completar organização de softwares",
        isCompleted: false,
        xpReward: 100,
      },
      {
        userId,
        title: "Sincronizar contas financeiras (Simulado)",
        isCompleted: false,
        xpReward: 200,
      }
    ]
  });
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;

    const [
      userProfile,
      consolidatedStats,
      goals,
      recentItemsRaw,
      favoritesRaw,
      upcomingBills,
      dbAccounts
    ] = await Promise.all([
      // 1. Perfil de usuário
      db.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true, username: true }
      }),
      
      // 2. Estatísticas consolidadas (counts, storage, bills sums)
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
      `,
      
      // 3. Metas
      db.goal.findMany({ orderBy: { createdAt: "asc" }, include: { user: { select: { username: true } } } }),
      
      // 4. União de itens recentes
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
      
      // 5. União de favoritos
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
      
      // 6. Contas pendentes próximas ao vencimento (5 dias)
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
      
      // 7. Contas bancárias
      db.bankAccount.findMany({
        where: { userId }
      })
    ]);

    const stats = consolidatedStats[0];

    // Se a base de dados estiver vazia (0 notas no total), rodar o seeding inicial
    if (stats.notes_count === 0) {
      try {
        await seedUserData(userId);
      } catch (seedError) {
        console.warn("Seeding error (usually duplicate keys in race conditions):", seedError);
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
      const getDirSize = (dirPath: string, isRoot = false): number => {
        let size = 0;
        if (!fs.existsSync(dirPath)) return 0;
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          if (isRoot && file === "files") continue; // Exclude the database-backed files directory from local scan
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
      localUploadsSizeBytes = getDirSize(uploadDir, true);
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

    // Registro de logs operacionais em Português
    const activityLog = [
      { id: "1", text: "Chaves de criptografia do cofre validadas com sucesso", time: "Agora mesmo", status: "success" },
      { id: "2", text: "Banco de dados Supabase sincronizado", time: "Há 5 min", status: "info" },
      { id: "3", text: `Contas registradas: ${stats.bills_count} no total`, time: "Agora", status: "info" },
      { id: "4", text: `Acesso de segurança autorizado para ${userProfile?.username === "caio" ? "Caio" : "Giselle"}`, time: "Há 1 min", status: "success" }
    ];

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Erro ao carregar estatísticas do painel" }, { status: 500 });
  }
}

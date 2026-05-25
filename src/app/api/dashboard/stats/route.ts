import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

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
2. **Chaveiro AES**: Gerenciador de credenciais com criptografia AES-256 local e gerador automático.
3. **Arquivos**: Gerenciamento de pastas e arquivos com visualizador de imagens e PDFs integrados.
4. **Galeria UHD**: Curadoria de papéis de parede com visualização em tela cheia.
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

    // Se o usuário caio não tiver notas, rodar seeding
    const totalCount = await db.note.count({ where: { userId } });
    if (totalCount === 0) {
      await seedUserData(userId);
    }

    // Carregar informações do usuário (Nível, XP)
    const userProfile = await db.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true, username: true },
    });

    // Contagem de todos os módulos
    const [
      notesCount,
      passwordsCount,
      videosCount,
      wallpapersCount,
      softwareCount,
      torrentsCount,
      filesCount,
      goals,
    ] = await Promise.all([
      db.note.count({ where: { userId } }),
      db.password.count({ where: { userId } }),
      db.video.count({ where: { userId } }),
      db.wallpaper.count({ where: { userId } }),
      db.software.count({ where: { userId } }),
      db.torrent.count({ where: { userId } }),
      db.file.count({ where: { userId } }),
      db.goal.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    ]);

    // Buscar itens recentes
    const [recentNotes, recentVideos, recentFiles, recentPasswords] = await Promise.all([
      db.note.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }),
      db.video.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 2 }),
      db.file.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }),
      db.password.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 3 }),
    ]);

    // Combinar itens recentes
    const recentItems = [
      ...recentNotes.map(n => ({ id: n.id, title: n.title, type: "Nota", date: n.updatedAt, details: n.category || "Geral" })),
      ...recentVideos.map(v => ({ id: v.id, title: v.title, type: "Vídeo", date: v.updatedAt, details: v.category || "Geral" })),
      ...recentFiles.map(f => ({ id: f.id, title: f.name, type: "Arquivo", date: f.updatedAt, details: f.mimeType })),
      ...recentPasswords.map(p => ({ id: p.id, title: p.title, type: "Senha", date: p.updatedAt, details: p.username || "Credenciais" })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    // Favoritos
    const [favNotes, favVideos, favFiles, favWallpapers, favPasswords] = await Promise.all([
      db.note.findMany({ where: { userId, isFavorite: true }, take: 2 }),
      db.video.findMany({ where: { userId, isFavorite: true }, take: 2 }),
      db.file.findMany({ where: { userId, isFavorite: true }, take: 2 }),
      db.wallpaper.findMany({ where: { userId, isFavorite: true }, take: 2 }),
      db.password.findMany({ where: { userId, isFavorite: true }, take: 2 }),
    ]);

    const favorites = [
      ...favNotes.map(n => ({ id: n.id, title: n.title, type: "Nota" })),
      ...favVideos.map(v => ({ id: v.id, title: v.title, type: "Vídeo" })),
      ...favFiles.map(f => ({ id: f.id, title: f.name, type: "Arquivo" })),
      ...favWallpapers.map(w => ({ id: w.id, title: w.title, type: "Wallpaper" })),
      ...favPasswords.map(p => ({ id: p.id, title: p.title, type: "Senha" })),
    ].slice(0, 5);

    // Registro de logs operacionais em Português
    const activityLog = [
      { id: "1", text: "Chaves de descriptografia do cofre validadas com sucesso", time: "Agora mesmo", status: "success" },
      { id: "2", text: "Banco de dados local SQLite sincronizado", time: "Há 5 min", status: "info" },
      { id: "3", text: `Active Torrents: 1 baixando (18.2 MB/s), 1 semeando (4.8 MB/s)`, time: "Há 10 min", status: "warning" },
      { id: "4", text: "Acesso de segurança autorizado para a conta caio", time: "Há 1 hora", status: "success" }
    ];

    // Mocks de dados financeiros
    const financialAccounts = [
      { id: "mp", provider: "Mercado Pago", balance: "R$ 4.829,10", status: "sync", lastSync: "Hoje às 10:45", trend: "+12.4% este mês" },
      { id: "san", provider: "Santander", balance: "R$ 15.340,50", status: "sync", lastSync: "Hoje às 11:20", trend: "+2.5% este mês" }
    ];

    return NextResponse.json({
      counts: {
        notes: notesCount,
        passwords: passwordsCount,
        videos: videosCount,
        wallpapers: wallpapersCount,
        software: softwareCount,
        torrents: torrentsCount,
        files: filesCount,
      },
      profile: {
        xp: userProfile?.xp || 0,
        level: userProfile?.level || 1,
        username: "Caio Sobrinho",
      },
      goals,
      recentItems,
      favorites,
      activityLog,
      financialAccounts,
      storageStats: {
        totalSize: "128 GB",
        usedSize: "53.8 GB",
        percentUsed: 42,
      }
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Erro ao carregar estatísticas do painel" }, { status: 500 });
  }
}

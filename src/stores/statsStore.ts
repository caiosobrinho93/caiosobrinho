import { create } from "zustand";

export interface Goal {
  id: string;
  title: string;
  isCompleted: boolean;
  xpReward: number;
  createdAt: string;
  createdBy?: string;
  user?: { username: string };
}

export interface StatsData {
  counts: {
    notes: number;
    passwords: number;
    videos: number;
    wallpapers: number;
    software: number;
    torrents: number;
    files: number;
    receipts: number;
    bills: number;
  };
  profile: {
    xp: number;
    level: number;
    username: string;
  };
  goals: Goal[];
  recentItems: Array<{
    id: string;
    title: string;
    type: string;
    date: string;
    details: string;
    createdBy?: string;
  }>;
  favorites: Array<{
    id: string;
    title: string;
    type: string;
    createdBy?: string;
  }>;
  upcomingBills?: any[];
  activityLog: Array<{
    id: string;
    text: string;
    time: string;
    status: string;
  }>;
  financialAccounts: Array<{
    id: string;
    provider: string;
    balance: string;
    rawBalance?: number;
    status: string;
    lastSync: string;
    trend: string;
    accountNumber?: string;
    apiKey?: string;
    apiSecret?: string;
    syncType?: string;
  }>;
  storageStats: {
    totalSize: string;
    usedSize: string;
    percentUsed: number;
    videosSize?: string;
    docsSize?: string;
    imagesSize?: string;
    othersSize?: string;
  };
}

export interface StatsState {
  data: StatsData | null;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  
  // Actions
  fetchStats: (force?: boolean) => Promise<void>;
  setData: (data: StatsData) => void;
  invalidateCache: () => void;
  
  // Local modifications (interlinked updates)
  addBill: (bill: { id: string; title: string; amount: number; dueDate: string; type: string; status: string; userId: string; user?: { username: string } }, username: string) => void;
  deleteBill: (billId: string) => void;
  toggleBillStatus: (billId: string, oldStatus: string, newStatus: string, amount: number, type: string) => void;
  
  addReceipt: () => void;
  deleteReceipt: () => void;
  
  addNote: (note: { id: string; title: string; category?: string; updatedAt: string }, username: string) => void;
  deleteNote: (noteId: string) => void;
  toggleNoteFavorite: (noteId: string, isFavorite: boolean, title: string, username: string) => void;

  addPassword: (password: { id: string; title: string; username?: string; updatedAt: string }, username: string) => void;
  deletePassword: (passwordId: string) => void;
  togglePasswordFavorite: (passwordId: string, isFavorite: boolean, title: string, username: string) => void;

  addVideo: (video: { id: string; title: string; category?: string; updatedAt: string }, username: string) => void;
  deleteVideo: (videoId: string) => void;
  toggleVideoFavorite: (videoId: string, isFavorite: boolean, title: string, username: string) => void;

  addWallpaper: () => void;
  deleteWallpaper: (wallpaperId: string) => void;
  toggleWallpaperFavorite: (wallpaperId: string, isFavorite: boolean, title: string, username: string) => void;

  addFile: (file: { id: string; name: string; size: number; mimeType: string; updatedAt: string }, username: string) => void;
  deleteFile: (fileId: string, size: number, mimeType: string) => void;
  toggleFileFavorite: (fileId: string, isFavorite: boolean, name: string, username: string) => void;

  addTorrent: () => void;
  deleteTorrent: () => void;

  addSoftware: () => void;
  deleteSoftware: () => void;

  toggleGoal: (goalId: string, isCompleted: boolean) => void;
  deleteGoal: (goalId: string) => void;
  addGoal: (goal: Goal) => void;
  setSyncStatus: (isSyncCompleted: boolean) => void;
}

// Helpers para tratamento de tamanhos
const parseFormattedSize = (sizeStr: string): number => {
  if (!sizeStr || sizeStr === "0 B") return 0;
  const parts = sizeStr.split(" ");
  if (parts.length !== 2) return 0;
  const val = parseFloat(parts[0]);
  const unit = parts[1].toUpperCase();
  const k = 1024;
  if (unit === "B") return val;
  if (unit === "KB") return val * k;
  if (unit === "MB") return val * k * k;
  if (unit === "GB") return val * k * k * k;
  return 0;
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// Helpers para tratamento financeiro
const parseBalance = (balanceStr: string): number => {
  if (!balanceStr) return 0;
  const clean = balanceStr.replace("R$", "").replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  return parseFloat(clean) || 0;
};

const formatBalance = (val: number): string => {
  return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const useStatsStore = create<StatsState>((set, get) => ({
  data: null,
  isLoading: false,
  hasLoaded: false,
  error: null,

  fetchStats: async (force = false) => {
    if (get().hasLoaded && !force && get().data) {
      // Já carregado, não repete a chamada
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Erro ao buscar estatísticas");
      const data = await res.json();
      set({ data, hasLoaded: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Erro desconhecido", isLoading: false });
    }
  },

  setData: (data) => set({ data, hasLoaded: true }),
  
  invalidateCache: () => set({ hasLoaded: false }),

  // 1. Contas (Bills)
  addBill: (bill, username) => set((state) => {
    if (!state.data) return {};
    const counts = { ...state.data.counts, bills: state.data.counts.bills + 1 };
    
    // Alertas de contas próximas (se vencer nos próximos 5 dias e pendente)
    let upcomingBills = [...(state.data.upcomingBills || [])];
    const diffDays = Math.ceil((new Date(bill.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (bill.status === "pendente" && diffDays <= 5) {
      upcomingBills.push({
        id: bill.id,
        title: bill.title,
        amount: bill.amount,
        dueDate: bill.dueDate,
        user: { username }
      });
      upcomingBills.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }

    // Atualizar saldo bancário localmente
    const financialAccounts = state.data.financialAccounts.map((acc) => {
      let balance = parseBalance(acc.balance);
      if (bill.status === "pago" && bill.type === "pagar" && acc.id === "san") {
        balance -= bill.amount;
      } else if (bill.status === "recebido" && bill.type === "receber" && acc.id === "mp") {
        balance += bill.amount;
      }
      return { ...acc, balance: formatBalance(balance) };
    });

    const activityLog = [
      { id: Date.now().toString(), text: `Conta "${bill.title}" criada por ${username === "caio" ? "Caio" : "Giselle"}`, time: "Agora mesmo", status: "info" },
      ...state.data.activityLog
    ].slice(0, 4);

    return {
      data: {
        ...state.data,
        counts,
        upcomingBills,
        financialAccounts,
        activityLog
      }
    };
  }),

  deleteBill: (billId) => set((state) => {
    if (!state.data) return {};
    const counts = { ...state.data.counts, bills: Math.max(0, state.data.counts.bills - 1) };
    
    // Remover de próximas
    const upcomingBills = (state.data.upcomingBills || []).filter((b) => b.id !== billId);

    return {
      data: {
        ...state.data,
        counts,
        upcomingBills
      }
    };
  }),

  toggleBillStatus: (billId, oldStatus, newStatus, amount, type) => set((state) => {
    if (!state.data) return {};

    // Atualizar saldo bancário
    const financialAccounts = state.data.financialAccounts.map((acc) => {
      let balance = parseBalance(acc.balance);
      
      // Reverter estado antigo
      if (oldStatus === "pago" && type === "pagar" && acc.id === "san") {
        balance += amount;
      } else if (oldStatus === "recebido" && type === "receber" && acc.id === "mp") {
        balance -= amount;
      }

      // Aplicar estado novo
      if (newStatus === "pago" && type === "pagar" && acc.id === "san") {
        balance -= amount;
      } else if (newStatus === "recebido" && type === "receber" && acc.id === "mp") {
        balance += amount;
      }

      return { ...acc, balance: formatBalance(balance) };
    });

    // Se mudou para pago/recebido, remove dos alertas de pendentes
    let upcomingBills = [...(state.data.upcomingBills || [])];
    if (newStatus === "pago" || newStatus === "recebido") {
      upcomingBills = upcomingBills.filter((b) => b.id !== billId);
    }

    return {
      data: {
        ...state.data,
        financialAccounts,
        upcomingBills
      }
    };
  }),

  // 2. Comprovantes (Receipts)
  addReceipt: () => set((state) => {
    if (!state.data) return {};
    return {
      data: {
        ...state.data,
        counts: { ...state.data.counts, receipts: state.data.counts.receipts + 1 }
      }
    };
  }),

  deleteReceipt: () => set((state) => {
    if (!state.data) return {};
    return {
      data: {
        ...state.data,
        counts: { ...state.data.counts, receipts: Math.max(0, state.data.counts.receipts - 1) }
      }
    };
  }),

  // 3. Notas (Notes)
  addNote: (note, username) => set((state) => {
    if (!state.data) return {};
    const counts = { ...state.data.counts, notes: state.data.counts.notes + 1 };
    
    const recentItems = [
      { id: note.id, title: note.title, type: "Nota", date: note.updatedAt, details: note.category || "Geral", createdBy: username },
      ...state.data.recentItems
    ].slice(0, 5);

    return {
      data: {
        ...state.data,
        counts,
        recentItems
      }
    };
  }),

  deleteNote: (noteId) => set((state) => {
    if (!state.data) return {};
    const counts = { ...state.data.counts, notes: Math.max(0, state.data.counts.notes - 1) };
    const recentItems = state.data.recentItems.filter((i) => i.id !== noteId);
    const favorites = state.data.favorites.filter((f) => f.id !== noteId);

    return {
      data: {
        ...state.data,
        counts,
        recentItems,
        favorites
      }
    };
  }),

  toggleNoteFavorite: (noteId, isFavorite, title, username) => set((state) => {
    if (!state.data) return {};
    let favorites = [...state.data.favorites];
    if (isFavorite) {
      if (!favorites.some((f) => f.id === noteId)) {
        favorites.push({ id: noteId, title, type: "Nota", createdBy: username });
      }
    } else {
      favorites = favorites.filter((f) => f.id !== noteId);
    }
    return {
      data: {
        ...state.data,
        favorites: favorites.slice(0, 5)
      }
    };
  }),

  // 4. Senhas (Passwords)
  addPassword: (password, username) => set((state) => {
    if (!state.data) return {};
    const counts = { ...state.data.counts, passwords: state.data.counts.passwords + 1 };
    
    const recentItems = [
      { id: password.id, title: password.title, type: "Senha", date: password.updatedAt, details: password.username || "Credenciais", createdBy: username },
      ...state.data.recentItems
    ].slice(0, 5);

    return {
      data: {
        ...state.data,
        counts,
        recentItems
      }
    };
  }),

  deletePassword: (passwordId) => set((state) => {
    if (!state.data) return {};
    const counts = { ...state.data.counts, passwords: Math.max(0, state.data.counts.passwords - 1) };
    const recentItems = state.data.recentItems.filter((i) => i.id !== passwordId);
    const favorites = state.data.favorites.filter((f) => f.id !== passwordId);

    return {
      data: {
        ...state.data,
        counts,
        recentItems,
        favorites
      }
    };
  }),

  togglePasswordFavorite: (passwordId, isFavorite, title, username) => set((state) => {
    if (!state.data) return {};
    let favorites = [...state.data.favorites];
    if (isFavorite) {
      if (!favorites.some((f) => f.id === passwordId)) {
        favorites.push({ id: passwordId, title, type: "Senha", createdBy: username });
      }
    } else {
      favorites = favorites.filter((f) => f.id !== passwordId);
    }
    return {
      data: {
        ...state.data,
        favorites: favorites.slice(0, 5)
      }
    };
  }),

  // 5. Vídeos (Videos)
  addVideo: (video, username) => set((state) => {
    if (!state.data) return {};
    const counts = { ...state.data.counts, videos: state.data.counts.videos + 1 };
    
    const recentItems = [
      { id: video.id, title: video.title, type: "Vídeo", date: video.updatedAt, details: video.category || "Geral", createdBy: username },
      ...state.data.recentItems
    ].slice(0, 5);

    return {
      data: {
        ...state.data,
        counts,
        recentItems
      }
    };
  }),

  deleteVideo: (videoId) => set((state) => {
    if (!state.data) return {};
    const counts = { ...state.data.counts, videos: Math.max(0, state.data.counts.videos - 1) };
    const recentItems = state.data.recentItems.filter((i) => i.id !== videoId);
    const favorites = state.data.favorites.filter((f) => f.id !== videoId);

    return {
      data: {
        ...state.data,
        counts,
        recentItems,
        favorites
      }
    };
  }),

  toggleVideoFavorite: (videoId, isFavorite, title, username) => set((state) => {
    if (!state.data) return {};
    let favorites = [...state.data.favorites];
    if (isFavorite) {
      if (!favorites.some((f) => f.id === videoId)) {
        favorites.push({ id: videoId, title, type: "Vídeo", createdBy: username });
      }
    } else {
      favorites = favorites.filter((f) => f.id !== videoId);
    }
    return {
      data: {
        ...state.data,
        favorites: favorites.slice(0, 5)
      }
    };
  }),

  // 6. Wallpapers
  addWallpaper: () => set((state) => {
    if (!state.data) return {};
    return {
      data: {
        ...state.data,
        counts: { ...state.data.counts, wallpapers: state.data.counts.wallpapers + 1 }
      }
    };
  }),

  deleteWallpaper: (wallpaperId) => set((state) => {
    if (!state.data) return {};
    const counts = { ...state.data.counts, wallpapers: Math.max(0, state.data.counts.wallpapers - 1) };
    const favorites = state.data.favorites.filter((f) => f.id !== wallpaperId);
    return {
      data: {
        ...state.data,
        counts,
        favorites
      }
    };
  }),

  toggleWallpaperFavorite: (wallpaperId, isFavorite, title, username) => set((state) => {
    if (!state.data) return {};
    let favorites = [...state.data.favorites];
    if (isFavorite) {
      if (!favorites.some((f) => f.id === wallpaperId)) {
        favorites.push({ id: wallpaperId, title, type: "Wallpaper", createdBy: username });
      }
    } else {
      favorites = favorites.filter((f) => f.id !== wallpaperId);
    }
    return {
      data: {
        ...state.data,
        favorites: favorites.slice(0, 5)
      }
    };
  }),

  // 7. Arquivos (Files)
  addFile: (file, username) => set((state) => {
    if (!state.data) return {};
    const counts = { ...state.data.counts, files: state.data.counts.files + 1 };
    
    // Atualizar estatísticas de armazenamento
    const storageStats = { ...state.data.storageStats };
    const totalBytes = parseFormattedSize(storageStats.usedSize) + file.size;
    storageStats.usedSize = formatSize(totalBytes);
    storageStats.percentUsed = Math.min(100, Math.round((totalBytes / (5 * 1024 * 1024 * 1024)) * 100));

    if (file.mimeType.startsWith("image/")) {
      const bytes = parseFormattedSize(storageStats.imagesSize || "0 B") + file.size;
      storageStats.imagesSize = formatSize(bytes);
    } else if (file.mimeType.includes("pdf") || file.mimeType.includes("text") || file.mimeType.includes("document")) {
      const bytes = parseFormattedSize(storageStats.docsSize || "0 B") + file.size;
      storageStats.docsSize = formatSize(bytes);
    } else if (file.mimeType.startsWith("video/")) {
      const bytes = parseFormattedSize(storageStats.videosSize || "0 B") + file.size;
      storageStats.videosSize = formatSize(bytes);
    } else {
      const bytes = parseFormattedSize(storageStats.othersSize || "0 B") + file.size;
      storageStats.othersSize = formatSize(bytes);
    }

    const recentItems = [
      { id: file.id, title: file.name, type: "Arquivo", date: file.updatedAt, details: file.mimeType, createdBy: username },
      ...state.data.recentItems
    ].slice(0, 5);

    return {
      data: {
        ...state.data,
        counts,
        storageStats,
        recentItems
      }
    };
  }),

  deleteFile: (fileId, size, mimeType) => set((state) => {
    if (!state.data) return {};
    const counts = { ...state.data.counts, files: Math.max(0, state.data.counts.files - 1) };
    
    // Atualizar armazenamento
    const storageStats = { ...state.data.storageStats };
    const totalBytes = Math.max(0, parseFormattedSize(storageStats.usedSize) - size);
    storageStats.usedSize = formatSize(totalBytes);
    storageStats.percentUsed = Math.min(100, Math.round((totalBytes / (5 * 1024 * 1024 * 1024)) * 100));

    if (mimeType.startsWith("image/")) {
      const bytes = Math.max(0, parseFormattedSize(storageStats.imagesSize || "0 B") - size);
      storageStats.imagesSize = formatSize(bytes);
    } else if (mimeType.includes("pdf") || mimeType.includes("text") || mimeType.includes("document")) {
      const bytes = Math.max(0, parseFormattedSize(storageStats.docsSize || "0 B") - size);
      storageStats.docsSize = formatSize(bytes);
    } else if (mimeType.startsWith("video/")) {
      const bytes = Math.max(0, parseFormattedSize(storageStats.videosSize || "0 B") - size);
      storageStats.videosSize = formatSize(bytes);
    } else {
      const bytes = Math.max(0, parseFormattedSize(storageStats.othersSize || "0 B") - size);
      storageStats.othersSize = formatSize(bytes);
    }

    const recentItems = state.data.recentItems.filter((i) => i.id !== fileId);
    const favorites = state.data.favorites.filter((f) => f.id !== fileId);

    return {
      data: {
        ...state.data,
        counts,
        storageStats,
        recentItems,
        favorites
      }
    };
  }),

  toggleFileFavorite: (fileId, isFavorite, name, username) => set((state) => {
    if (!state.data) return {};
    let favorites = [...state.data.favorites];
    if (isFavorite) {
      if (!favorites.some((f) => f.id === fileId)) {
        favorites.push({ id: fileId, title: name, type: "Arquivo", createdBy: username });
      }
    } else {
      favorites = favorites.filter((f) => f.id !== fileId);
    }
    return {
      data: {
        ...state.data,
        favorites: favorites.slice(0, 5)
      }
    };
  }),

  // 8. Torrents
  addTorrent: () => set((state) => {
    if (!state.data) return {};
    return {
      data: {
        ...state.data,
        counts: { ...state.data.counts, torrents: state.data.counts.torrents + 1 }
      }
    };
  }),

  deleteTorrent: () => set((state) => {
    if (!state.data) return {};
    return {
      data: {
        ...state.data,
        counts: { ...state.data.counts, torrents: Math.max(0, state.data.counts.torrents - 1) }
      }
    };
  }),

  // 9. Softwares
  addSoftware: () => set((state) => {
    if (!state.data) return {};
    return {
      data: {
        ...state.data,
        counts: { ...state.data.counts, software: state.data.counts.software + 1 }
      }
    };
  }),

  deleteSoftware: () => set((state) => {
    if (!state.data) return {};
    return {
      data: {
        ...state.data,
        counts: { ...state.data.counts, software: Math.max(0, state.data.counts.software - 1) }
      }
    };
  }),

  // 10. Metas (Goals)
  addGoal: (goal) => set((state) => {
    if (!state.data) return {};
    return {
      data: {
        ...state.data,
        goals: [...state.data.goals, goal]
      }
    };
  }),

  deleteGoal: (goalId) => set((state) => {
    if (!state.data) return {};
    const targetGoal = state.data.goals.find((g) => g.id === goalId);
    if (!targetGoal) return {};

    let xp = state.data.profile.xp;
    if (targetGoal.isCompleted) {
      xp = Math.max(0, xp - targetGoal.xpReward);
    }
    const level = Math.floor(xp / 1000) + 1;

    return {
      data: {
        ...state.data,
        profile: { ...state.data.profile, xp, level },
        goals: state.data.goals.filter((g) => g.id !== goalId)
      }
    };
  }),

  toggleGoal: (goalId, isCompleted) => set((state) => {
    if (!state.data) return {};
    const targetGoal = state.data.goals.find((g) => g.id === goalId);
    if (!targetGoal) return {};

    const xpDiff = isCompleted ? targetGoal.xpReward : -targetGoal.xpReward;
    const xp = Math.max(0, state.data.profile.xp + xpDiff);
    const level = Math.floor(xp / 1000) + 1;

    const goals = state.data.goals.map((g) =>
      g.id === goalId ? { ...g, isCompleted } : g
    );

    return {
      data: {
        ...state.data,
        profile: { ...state.data.profile, xp, level },
        goals
      }
    };
  }),

  // Sincronização Bancária
  setSyncStatus: (isSyncCompleted) => set((state) => {
    if (!state.data) return {};
    const date = new Date();
    const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const financialAccounts = state.data.financialAccounts.map(acc => ({
      ...acc,
      lastSync: isSyncCompleted ? `Hoje às ${timeStr}` : "Pendente"
    }));

    const goals = state.data.goals.map((g) =>
      g.title.includes("Sincronizar contas") ? { ...g, isCompleted: isSyncCompleted } : g
    );

    // Dar XP na sincronização se for a primeira vez
    const syncGoal = state.data.goals.find((g) => g.title.includes("Sincronizar contas"));
    let xp = state.data.profile.xp;
    let level = state.data.profile.level;
    
    if (isSyncCompleted && syncGoal && !syncGoal.isCompleted) {
      xp += 200;
      level = Math.floor(xp / 1000) + 1;
    } else if (isSyncCompleted) {
      xp += 20;
      level = Math.floor(xp / 1000) + 1;
    }

    return {
      data: {
        ...state.data,
        financialAccounts,
        goals,
        profile: { ...state.data.profile, xp, level }
      }
    };
  })
}));

import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BillItem {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  dueDate: string;
  type: string;
  status: string;
  paymentDate: string | null;
  userId: string;
  user: { username: string };
}

export interface ReceiptItem {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  amount: number | null;
  paymentDate: string | null;
  category: string | null;
  userId: string;
  user: { username: string };
  createdAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string | null;
  isFavorite: boolean;
  updatedAt: string;
  user?: { username: string };
}

export interface PasswordItem {
  id: string;
  title: string;
  username: string | null;
  email: string | null;
  password: string;
  url: string | null;
  imageUrl: string | null;
  notes: string | null;
  category: string | null;
  tags: string | null;
  isFavorite: boolean;
  createdBy?: string;
  user?: { username: string };
}

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  duration: number | null;
  progress: number;
  isFavorite: boolean;
  category: string | null;
  tags: string | null;
  user?: { username: string };
}

export interface WallpaperItem {
  id: string;
  title: string;
  url: string;
  width: number | null;
  height: number | null;
  isFavorite: boolean;
  user?: { username: string };
}

export interface SoftwareItem {
  id: string;
  name: string;
  version: string;
  description: string | null;
  downloadUrl: string | null;
  platform: string;
  iconUrl: string | null;
  category: string | null;
  notes: string | null;
  user?: { username: string };
}

export interface TorrentItem {
  id: string;
  title: string;
  magnet: string;
  status: string;
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  size: string;
  notes: string | null;
  user?: { username: string };
}

export interface FolderItem {
  id: string;
  name: string;
  parentFolderId: string | null;
  user?: { username: string };
}

export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  isFavorite: boolean;
  folderId: string | null;
  user?: { username: string };
}

export interface DevComponent {
  id: string;
  title: string;
  description: string | null;
  htmlCode: string | null;
  cssCode: string | null;
  jsCode: string | null;
  category: string | null;
  isFavorite: boolean;
  updatedAt: string;
}

// ─── Slice helper type ───────────────────────────────────────────────────────

interface SliceState<T> {
  data: T[];
  hasLoaded: boolean;
  isLoading: boolean;
}

// ─── Files cache: keyed by folderId ─────────────────────────────────────────

interface FilesCache {
  [folderId: string]: {
    folders: FolderItem[];
    files: FileItem[];
    hasLoaded: boolean;
  };
}

// ─── Store definition ────────────────────────────────────────────────────────

interface DataState {
  bills: SliceState<BillItem>;
  receipts: SliceState<ReceiptItem>;
  notes: SliceState<NoteItem>;
  passwords: SliceState<PasswordItem>;
  videos: SliceState<VideoItem> & { lastQuery: string };
  wallpapers: SliceState<WallpaperItem>;
  software: SliceState<SoftwareItem>;
  torrents: SliceState<TorrentItem>;
  filesCache: FilesCache;
  dev: SliceState<DevComponent>;

  // ── Fetchers ──────────────────────────────────────────────────────────────
  fetchBills: (force?: boolean) => Promise<void>;
  fetchReceipts: (force?: boolean) => Promise<void>;
  fetchNotes: (force?: boolean) => Promise<void>;
  fetchPasswords: (force?: boolean) => Promise<void>;
  fetchVideos: (search?: string, category?: string, force?: boolean) => Promise<void>;
  fetchWallpapers: (force?: boolean) => Promise<void>;
  fetchSoftware: (force?: boolean) => Promise<void>;
  fetchTorrents: (force?: boolean) => Promise<void>;
  fetchFiles: (folderId: string, search?: string, force?: boolean) => Promise<{ folders: FolderItem[]; files: FileItem[] }>;
  fetchDev: (force?: boolean) => Promise<void>;

  // ── Bills mutations ───────────────────────────────────────────────────────
  addBill: (bill: BillItem) => void;
  deleteBill: (id: string) => void;
  updateBillStatus: (id: string, newStatus: string, paymentDate: string | null) => void;

  // ── Receipts mutations ────────────────────────────────────────────────────
  addReceipt: (receipt: ReceiptItem) => void;
  deleteReceipt: (id: string) => void;

  // ── Notes mutations ───────────────────────────────────────────────────────
  addNote: (note: NoteItem) => void;
  deleteNote: (id: string) => void;
  updateNote: (id: string, updates: Partial<NoteItem>) => void;
  toggleNoteFavorite: (id: string, isFavorite: boolean) => void;

  // ── Passwords mutations ───────────────────────────────────────────────────
  addPassword: (password: PasswordItem) => void;
  deletePassword: (id: string) => void;
  togglePasswordFavorite: (id: string, isFavorite: boolean) => void;

  // ── Videos mutations ──────────────────────────────────────────────────────
  addVideo: (video: VideoItem) => void;
  deleteVideo: (id: string) => void;
  toggleVideoFavorite: (id: string, isFavorite: boolean) => void;
  updateVideoProgress: (id: string, progress: number) => void;

  // ── Wallpapers mutations ──────────────────────────────────────────────────
  addWallpaper: (wallpaper: WallpaperItem) => void;
  deleteWallpaper: (id: string) => void;
  toggleWallpaperFavorite: (id: string, isFavorite: boolean) => void;

  // ── Software mutations ────────────────────────────────────────────────────
  addSoftware: (software: SoftwareItem) => void;
  deleteSoftware: (id: string) => void;

  // ── Torrents mutations ────────────────────────────────────────────────────
  addTorrent: (torrent: TorrentItem) => void;
  deleteTorrent: (id: string) => void;
  updateTorrent: (id: string, updates: Partial<TorrentItem>) => void;

  // ── Files mutations ───────────────────────────────────────────────────────
  addFolder: (folderId: string, folder: FolderItem) => void;
  addFile: (folderId: string, file: FileItem) => void;
  deleteFile: (folderId: string, fileId: string) => void;
  deleteFolder: (folderId: string, folderIdToDelete: string) => void;
  toggleFileFavorite: (folderId: string, fileId: string, isFavorite: boolean) => void;

  // ── Dev mutations ─────────────────────────────────────────────────────────
  addDevComponent: (comp: DevComponent) => void;
  updateDevComponent: (id: string, updates: Partial<DevComponent>) => void;
  deleteDevComponent: (id: string) => void;

  // ── Cache invalidation ────────────────────────────────────────────────────
  invalidate: (section: "bills" | "receipts" | "notes" | "passwords" | "videos" | "wallpapers" | "software" | "torrents" | "files" | "dev") => void;
}

const makeSlice = <T>(): SliceState<T> => ({
  data: [],
  hasLoaded: false,
  isLoading: false,
});

export const useDataStore = create<DataState>((set, get) => ({
  bills: makeSlice<BillItem>(),
  receipts: makeSlice<ReceiptItem>(),
  notes: makeSlice<NoteItem>(),
  passwords: makeSlice<PasswordItem>(),
  videos: { ...makeSlice<VideoItem>(), lastQuery: "" },
  wallpapers: makeSlice<WallpaperItem>(),
  software: makeSlice<SoftwareItem>(),
  torrents: makeSlice<TorrentItem>(),
  filesCache: {},
  dev: makeSlice<DevComponent>(),

  // ── Fetchers ──────────────────────────────────────────────────────────────

  fetchBills: async (force = false) => {
    if (get().bills.hasLoaded && !force) return;
    set(s => ({ bills: { ...s.bills, isLoading: true } }));
    try {
      const res = await fetch("/api/bills");
      if (res.ok) {
        const data = await res.json();
        set({ bills: { data, hasLoaded: true, isLoading: false } });
      }
    } catch { } finally {
      set(s => ({ bills: { ...s.bills, isLoading: false } }));
    }
  },

  fetchReceipts: async (force = false) => {
    if (get().receipts.hasLoaded && !force) return;
    set(s => ({ receipts: { ...s.receipts, isLoading: true } }));
    try {
      const res = await fetch("/api/receipts");
      if (res.ok) {
        const data = await res.json();
        set({ receipts: { data, hasLoaded: true, isLoading: false } });
      }
    } catch { } finally {
      set(s => ({ receipts: { ...s.receipts, isLoading: false } }));
    }
  },

  fetchNotes: async (force = false) => {
    if (get().notes.hasLoaded && !force) return;
    set(s => ({ notes: { ...s.notes, isLoading: true } }));
    try {
      const res = await fetch("/api/notes");
      if (res.ok) {
        const data = await res.json();
        set({ notes: { data, hasLoaded: true, isLoading: false } });
      }
    } catch { } finally {
      set(s => ({ notes: { ...s.notes, isLoading: false } }));
    }
  },

  fetchPasswords: async (force = false) => {
    if (get().passwords.hasLoaded && !force) return;
    set(s => ({ passwords: { ...s.passwords, isLoading: true } }));
    try {
      const res = await fetch("/api/passwords");
      if (res.ok) {
        const data = await res.json();
        set({ passwords: { data, hasLoaded: true, isLoading: false } });
      }
    } catch { } finally {
      set(s => ({ passwords: { ...s.passwords, isLoading: false } }));
    }
  },

  fetchVideos: async (search = "", category = "", force = false) => {
    const query = `${search}::${category}`;
    const { videos } = get();
    // Refetch if force, not loaded, or query changed
    if (videos.hasLoaded && !force && videos.lastQuery === query) return;
    set(s => ({ videos: { ...s.videos, isLoading: true } }));
    try {
      const cat = category === "Todos" ? "" : category;
      const res = await fetch(`/api/videos?search=${search}&category=${cat}`);
      if (res.ok) {
        const data = await res.json();
        set({ videos: { data, hasLoaded: true, isLoading: false, lastQuery: query } });
      }
    } catch { } finally {
      set(s => ({ videos: { ...s.videos, isLoading: false } }));
    }
  },

  fetchWallpapers: async (force = false) => {
    if (get().wallpapers.hasLoaded && !force) return;
    set(s => ({ wallpapers: { ...s.wallpapers, isLoading: true } }));
    try {
      const res = await fetch("/api/wallpapers");
      if (res.ok) {
        const data = await res.json();
        set({ wallpapers: { data, hasLoaded: true, isLoading: false } });
      }
    } catch { } finally {
      set(s => ({ wallpapers: { ...s.wallpapers, isLoading: false } }));
    }
  },

  fetchSoftware: async (force = false) => {
    if (get().software.hasLoaded && !force) return;
    set(s => ({ software: { ...s.software, isLoading: true } }));
    try {
      const res = await fetch("/api/software");
      if (res.ok) {
        const data = await res.json();
        set({ software: { data, hasLoaded: true, isLoading: false } });
      }
    } catch { } finally {
      set(s => ({ software: { ...s.software, isLoading: false } }));
    }
  },

  fetchTorrents: async (force = false) => {
    if (get().torrents.hasLoaded && !force) return;
    set(s => ({ torrents: { ...s.torrents, isLoading: true } }));
    try {
      const res = await fetch("/api/torrents");
      if (res.ok) {
        const data = await res.json();
        set({ torrents: { data, hasLoaded: true, isLoading: false } });
      }
    } catch { } finally {
      set(s => ({ torrents: { ...s.torrents, isLoading: false } }));
    }
  },

  fetchFiles: async (folderId, search = "", force = false) => {
    const cache = get().filesCache[folderId];
    if (cache?.hasLoaded && !force && !search) return { folders: cache.folders, files: cache.files };
    try {
      const folderParam = folderId === "root" ? "" : folderId;
      const res = await fetch(`/api/files?folderId=${folderParam}&search=${search}`);
      if (res.ok) {
        const data = await res.json();
        if (!search) {
          set(s => ({
            filesCache: {
              ...s.filesCache,
              [folderId]: { folders: data.folders || [], files: data.files || [], hasLoaded: true }
            }
          }));
        }
        return { folders: data.folders || [], files: data.files || [] };
      }
    } catch { }
    return { folders: [], files: [] };
  },

  fetchDev: async (force = false) => {
    if (get().dev.hasLoaded && !force) return;
    set(s => ({ dev: { ...s.dev, isLoading: true } }));
    try {
      const res = await fetch("/api/dev-components");
      if (res.ok) {
        const data = await res.json();
        set({ dev: { data, hasLoaded: true, isLoading: false } });
      }
    } catch { } finally {
      set(s => ({ dev: { ...s.dev, isLoading: false } }));
    }
  },

  // ── Bills mutations ───────────────────────────────────────────────────────

  addBill: (bill) => set(s => ({ bills: { ...s.bills, data: [bill, ...s.bills.data] } })),

  deleteBill: (id) => set(s => ({ bills: { ...s.bills, data: s.bills.data.filter(b => b.id !== id) } })),

  updateBillStatus: (id, newStatus, paymentDate) => set(s => ({
    bills: {
      ...s.bills,
      data: s.bills.data.map(b => b.id === id ? { ...b, status: newStatus, paymentDate } : b)
    }
  })),

  // ── Receipts mutations ────────────────────────────────────────────────────

  addReceipt: (receipt) => set(s => ({ receipts: { ...s.receipts, data: [receipt, ...s.receipts.data] } })),

  deleteReceipt: (id) => set(s => ({ receipts: { ...s.receipts, data: s.receipts.data.filter(r => r.id !== id) } })),

  // ── Notes mutations ───────────────────────────────────────────────────────

  addNote: (note) => set(s => ({ notes: { ...s.notes, data: [note, ...s.notes.data] } })),

  deleteNote: (id) => set(s => ({ notes: { ...s.notes, data: s.notes.data.filter(n => n.id !== id) } })),

  updateNote: (id, updates) => set(s => ({
    notes: { ...s.notes, data: s.notes.data.map(n => n.id === id ? { ...n, ...updates } : n) }
  })),

  toggleNoteFavorite: (id, isFavorite) => set(s => ({
    notes: { ...s.notes, data: s.notes.data.map(n => n.id === id ? { ...n, isFavorite } : n) }
  })),

  // ── Passwords mutations ───────────────────────────────────────────────────

  addPassword: (password) => set(s => ({ passwords: { ...s.passwords, data: [password, ...s.passwords.data] } })),

  deletePassword: (id) => set(s => ({ passwords: { ...s.passwords, data: s.passwords.data.filter(p => p.id !== id) } })),

  togglePasswordFavorite: (id, isFavorite) => set(s => ({
    passwords: { ...s.passwords, data: s.passwords.data.map(p => p.id === id ? { ...p, isFavorite } : p) }
  })),

  // ── Videos mutations ──────────────────────────────────────────────────────

  addVideo: (video) => set(s => ({ videos: { ...s.videos, data: [video, ...s.videos.data] } })),

  deleteVideo: (id) => set(s => ({ videos: { ...s.videos, data: s.videos.data.filter(v => v.id !== id) } })),

  toggleVideoFavorite: (id, isFavorite) => set(s => ({
    videos: { ...s.videos, data: s.videos.data.map(v => v.id === id ? { ...v, isFavorite } : v) }
  })),

  updateVideoProgress: (id, progress) => set(s => ({
    videos: { ...s.videos, data: s.videos.data.map(v => v.id === id ? { ...v, progress } : v) }
  })),

  // ── Wallpapers mutations ──────────────────────────────────────────────────

  addWallpaper: (wallpaper) => set(s => ({ wallpapers: { ...s.wallpapers, data: [wallpaper, ...s.wallpapers.data] } })),

  deleteWallpaper: (id) => set(s => ({ wallpapers: { ...s.wallpapers, data: s.wallpapers.data.filter(w => w.id !== id) } })),

  toggleWallpaperFavorite: (id, isFavorite) => set(s => ({
    wallpapers: { ...s.wallpapers, data: s.wallpapers.data.map(w => w.id === id ? { ...w, isFavorite } : w) }
  })),

  // ── Software mutations ────────────────────────────────────────────────────

  addSoftware: (software) => set(s => ({ software: { ...s.software, data: [software, ...s.software.data] } })),

  deleteSoftware: (id) => set(s => ({ software: { ...s.software, data: s.software.data.filter(sw => sw.id !== id) } })),

  // ── Torrents mutations ────────────────────────────────────────────────────

  addTorrent: (torrent) => set(s => ({ torrents: { ...s.torrents, data: [torrent, ...s.torrents.data] } })),

  deleteTorrent: (id) => set(s => ({ torrents: { ...s.torrents, data: s.torrents.data.filter(t => t.id !== id) } })),

  updateTorrent: (id, updates) => set(s => ({
    torrents: { ...s.torrents, data: s.torrents.data.map(t => t.id === id ? { ...t, ...updates } : t) }
  })),

  // ── Files mutations ───────────────────────────────────────────────────────

  addFolder: (folderId, folder) => set(s => {
    const cache = s.filesCache[folderId] || { folders: [], files: [], hasLoaded: false };
    return {
      filesCache: {
        ...s.filesCache,
        [folderId]: { ...cache, folders: [folder, ...cache.folders] }
      }
    };
  }),

  addFile: (folderId, file) => set(s => {
    const cache = s.filesCache[folderId] || { folders: [], files: [], hasLoaded: false };
    return {
      filesCache: {
        ...s.filesCache,
        [folderId]: { ...cache, files: [file, ...cache.files] }
      }
    };
  }),

  deleteFile: (folderId, fileId) => set(s => {
    const cache = s.filesCache[folderId];
    if (!cache) return {};
    return {
      filesCache: {
        ...s.filesCache,
        [folderId]: { ...cache, files: cache.files.filter(f => f.id !== fileId) }
      }
    };
  }),

  deleteFolder: (folderId, folderIdToDelete) => set(s => {
    const cache = s.filesCache[folderId];
    if (!cache) return {};
    return {
      filesCache: {
        ...s.filesCache,
        [folderId]: { ...cache, folders: cache.folders.filter(f => f.id !== folderIdToDelete) }
      }
    };
  }),

  toggleFileFavorite: (folderId, fileId, isFavorite) => set(s => {
    const cache = s.filesCache[folderId];
    if (!cache) return {};
    return {
      filesCache: {
        ...s.filesCache,
        [folderId]: {
          ...cache,
          files: cache.files.map(f => f.id === fileId ? { ...f, isFavorite } : f)
        }
      }
    };
  }),

  // ── Dev mutations ─────────────────────────────────────────────────────────

  addDevComponent: (comp) => set(s => ({ dev: { ...s.dev, data: [comp, ...s.dev.data] } })),

  updateDevComponent: (id, updates) => set(s => ({
    dev: { ...s.dev, data: s.dev.data.map(c => c.id === id ? { ...c, ...updates } : c) }
  })),

  deleteDevComponent: (id) => set(s => ({ dev: { ...s.dev, data: s.dev.data.filter(c => c.id !== id) } })),

  // ── Cache invalidation ────────────────────────────────────────────────────

  invalidate: (section) => {
    if (section === "files") {
      set({ filesCache: {} });
    } else {
      set(s => ({ [section]: { ...s[section as keyof DataState] as any, hasLoaded: false } }));
    }
  },
}));

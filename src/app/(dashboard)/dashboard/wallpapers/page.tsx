"use client";

import React, { useEffect, useState } from "react";
import { useStatsStore } from "@/stores/statsStore";
import { useDataStore } from "@/stores/dataStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Star,
  Trash2,
  Download,
  X,
  Maximize2,
  Loader2,
  PlusCircle,
  Upload,
  Link as LinkIcon
} from "lucide-react";

interface WallpaperItem {
  id: string;
  title: string;
  url: string;
  width: number | null;
  height: number | null;
  isFavorite: boolean;
  user?: {
    username: string;
  };
}

export default function WallpapersPage() {
  const { data: wallpapers, isLoading } = useDataStore(s => s.wallpapers);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeWallpaper, setActiveWallpaper] = useState<WallpaperItem | null>(null);

  // Estados do formulário
  const [formTitle, setFormTitle] = useState("");
  const [uploadType, setUploadType] = useState<"file" | "url">("file");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formUrl, setFormUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    useDataStore.getState().fetchWallpapers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;
    if (uploadType === "url" && !formUrl) return;
    if (uploadType === "file" && !formFile) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", formTitle);
      
      if (uploadType === "file" && formFile) {
        formData.append("file", formFile);
      } else {
        formData.append("url", formUrl);
      }

      const res = await fetch("/api/wallpapers", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newWallpaper = await res.json();
        setFormTitle("");
        setFormUrl("");
        setFormFile(null);
        setIsModalOpen(false);
        
        // Atualiza a store global localmente
        useStatsStore.getState().addWallpaper();
        useDataStore.getState().addWallpaper(newWallpaper);
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao adicionar wallpaper");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFavorite = async (item: WallpaperItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/wallpapers/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !item.isFavorite }),
      });
      if (res.ok) {
        const nextFav = !item.isFavorite;
        if (activeWallpaper?.id === item.id) {
          setActiveWallpaper((prev) => prev ? { ...prev, isFavorite: nextFav } : null);
        }

        // Atualiza a store global localmente
        useStatsStore.getState().toggleWallpaperFavorite(item.id, nextFav, item.title, item.user?.username || "caio");
        useDataStore.getState().toggleWallpaperFavorite(item.id, !item.isFavorite);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza de que deseja excluir este wallpaper?")) return;

    try {
      const res = await fetch(`/api/wallpapers/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (activeWallpaper?.id === id) {
          setActiveWallpaper(null);
        }

        // Atualiza a store global localmente
        useStatsStore.getState().deleteWallpaper(id);
        useDataStore.getState().deleteWallpaper(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredWallpapers = wallpapers.filter((w) => {
    const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || w.isFavorite;
    return matchesSearch && matchesTab;
  });

  const getMasonryColumns = (items: WallpaperItem[], cols: number) => {
    const columns: WallpaperItem[][] = Array.from({ length: cols }, () => []);
    items.forEach((item, index) => {
      columns[index % cols].push(item);
    });
    return columns;
  };
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div>
          <h1 className="font-display text-xs tracking-widest text-white leading-tight flex items-center gap-5">
            <ImageIcon className="w-5 h-5 text-primary" />
            IMAGENS
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">
            Papéis de Parede Widescreen de Alta Definição
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-4 px-3 py-1.5 rounded-sm text-sm font-bold glass-btn glass-btn-primary cursor-pointer  shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar Wallpaper
        </button>
      </div>
 
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5.5">
        <div className="flex items-center bg-card/25 border border-border p-0.5 rounded-sm shrink-0 ">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
              activeTab === "all" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
              activeTab === "favorites" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
            }`}
          >
            Favoritos
          </button>
        </div>
 
        <div className="relative w-full sm:w-72 ">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-muted-foreground pointer-events-none">
            <Search className="w-3 h-3 text-primary" />
          </span>
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-card/25 border border-border/80 rounded-sm text-white placeholder-muted-foreground text-xs focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Grid de Papéis de Parede */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card/30 border border-border/80 rounded-sm h-24 sm:h-72 aspect-square sm:aspect-auto" />
          ))}
        </div>
      ) : filteredWallpapers.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:gap-3.5 items-start">
          {[0, 1, 2].map((colIndex) => (
            <div key={colIndex} className="flex flex-col gap-2 sm:gap-3.5">
              {getMasonryColumns(filteredWallpapers, 3)[colIndex]?.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={item.id}
                  onClick={() => setActiveWallpaper(item)}
                  whileTap={{ scale: 0.97 }}
                  className="bg-card/25 border border-border rounded-sm overflow-hidden cursor-pointer shadow-sm group relative hover-card-effects"
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full object-cover aspect-square sm:aspect-auto sm:max-h-[420px]"
                    loading="lazy"
                  />
 
                  {/* Overlay escuro em foco */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 sm:p-3 flex flex-col justify-between duration-300 z-10">
                    <div className="flex justify-end gap-1.5 sm:gap-2 ">
                      <button
                        onClick={(e) => handleToggleFavorite(item, e)}
                        className="p-1.5 sm:p-2 rounded-md bg-black/60 hover:bg-black/80 border border-white/10 text-white transition-colors cursor-pointer backdrop-blur-sm"
                      >
                        <Star className={`w-3 h-3 sm:w-4 sm:h-4 ${item.isFavorite ? "text-[#8fe319] fill-[#8fe319]" : ""}`} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1.5 sm:p-2 rounded-md bg-black/60 hover:bg-black/80 border border-white/10 text-white hover:text-destructive transition-colors cursor-pointer backdrop-blur-sm"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
 
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-white truncate block uppercase tracking-wide">{item.title}</span>
                        <div className="flex items-center gap-4 mt-0.5">
                          <span className="text-xs text-muted-foreground block">WIDESCREEN</span>
                          {item.user?.username && (
                            <span className={`user-tag user-tag-${item.user.username}`}>
                              {item.user.username === "caio" ? "Caio" : "Giselle"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-1 rounded-sm bg-primary text-black shrink-0 shadow-md">
                        <Maximize2 className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-card/15 border border-dashed border-border rounded-2xl">
          <ImageIcon className="w-10 h-10 text-muted-foreground mb-3" />
          <h3 className="text-sm font-semibold text-white">Nenhum wallpaper vinculado</h3>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">
            Comece vinculando ou subindo belos papéis de parede para o seu catálogo de imagens.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-3.5 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 transition-all cursor-pointer"
          >
            Adicionar Wallpaper
          </button>
        </div>
      )}

      {/* MODAL ADICIONAR WALLPAPER */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/80">
                <h2 className="text-base font-bold text-white flex items-center gap-5">
                  <PlusCircle className="w-5 h-5 text-primary" />
                  Novo Wallpaper
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-4 rounded-lg hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-4">
                    Título do Wallpaper *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cyberpunk Neon Sunset"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                  />
                </div>

                {/* Seletores de abas (Arquivo ou URL) */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase">
                    Origem da Imagem *
                  </label>
                  <div className="flex bg-muted/30 border border-border p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setUploadType("file")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-4 transition-colors cursor-pointer ${
                        uploadType === "file" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Fazer Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType("url")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-4 transition-colors cursor-pointer ${
                        uploadType === "url" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      Colar Link URL
                    </button>
                  </div>
                </div>

                {/* Área dinâmica das abas */}
                {uploadType === "file" ? (
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-4">
                      Selecionar Arquivo de Imagem
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary file:cursor-pointer hover:file:bg-primary/20 cursor-pointer bg-muted/20 border border-border p-5.5 rounded-xl"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-4">
                      URL da Imagem
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-border flex items-center justify-end gap-5.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs border border-border text-muted-foreground hover:text-white cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-xs bg-primary hover:bg-primary/95 text-white font-semibold flex items-center justify-center gap-4 cursor-pointer shadow-lg shadow-primary/10"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Imagem"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX DE VISUALIZAÇÃO EM TELA CHEIA */}
      <AnimatePresence>
        {activeWallpaper && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.95 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveWallpaper(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            <motion.div
              layoutId={activeWallpaper.id}
              className="relative z-10 max-w-5xl max-h-[85vh] flex flex-col items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-border"
            >
              <img
                src={activeWallpaper.url}
                alt={activeWallpaper.title}
                className="max-w-full max-h-[80vh] object-contain"
              />

              <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-start justify-between pointer-events-none z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                <span className="text-sm sm:text-base font-semibold text-white shadow-sm truncate max-w-[70%] mt-1">
                  {activeWallpaper.title}
                </span>
                <button
                  onClick={() => setActiveWallpaper(null)}
                  className="p-2 sm:p-3 rounded-xl bg-black/40 hover:bg-black/60 text-white border border-white/10 cursor-pointer flex items-center justify-center transition-colors pointer-events-auto backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-center items-end pointer-events-none z-20">
                <div className="flex gap-3 sm:gap-5 pointer-events-auto w-full sm:w-auto justify-center">
                  <a
                    href={activeWallpaper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={activeWallpaper.title}
                    className="flex-1 sm:flex-none px-4 py-3.5 sm:px-6 sm:py-4 rounded-xl bg-[#8fe319] hover:bg-[#8fe319]/90 text-black cursor-pointer flex items-center justify-center gap-2 sm:gap-3 text-sm font-bold transition-colors shadow-lg shadow-[#8fe319]/20"
                  >
                    <Download className="w-5 h-5" />
                    Baixar
                  </a>
                  <button
                    onClick={(e) => handleToggleFavorite(activeWallpaper, e)}
                    className="p-3.5 sm:p-4 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/10 cursor-pointer flex items-center justify-center transition-colors backdrop-blur-sm"
                  >
                    <Star className={`w-5 h-5 ${activeWallpaper.isFavorite ? "text-[#8fe319] fill-[#8fe319]" : ""}`} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(activeWallpaper.id, e)}
                    className="p-3.5 sm:p-4 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/10 hover:text-destructive cursor-pointer flex items-center justify-center transition-colors backdrop-blur-sm"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

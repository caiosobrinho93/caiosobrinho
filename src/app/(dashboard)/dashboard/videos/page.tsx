"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Plus,
  Search,
  Star,
  Trash2,
  Play,
  X,
  PlusCircle,
  Tag,
  Loader2,
  ExternalLink,
  Film,
  Upload,
  Link as LinkIcon
} from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  duration: number | null;
  progress: number;
  isFavorite: boolean;
  category: string | null;
  tags: string | null;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // Estados do formulário
  const [formTitle, setFormTitle] = useState("");
  const [videoUploadType, setVideoUploadType] = useState<"file" | "url">("url");
  const [formVideoFile, setFormVideoFile] = useState<File | null>(null);
  const [formUrl, setFormUrl] = useState("");
  const [formCategory, setFormCategory] = useState("Geral");
  const [formTags, setFormTags] = useState("");
  const [thumbUploadType, setThumbUploadType] = useState<"file" | "url">("url");
  const [formThumbFile, setFormThumbFile] = useState<File | null>(null);
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar vídeos
  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const categoryParam = activeCategory === "Todos" ? "" : activeCategory;
      const res = await fetch(`/api/videos?search=${search}&category=${categoryParam}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [search, activeCategory]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;
    if (videoUploadType === "url" && !formUrl) return;
    if (videoUploadType === "file" && !formVideoFile) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", formTitle);
      formData.append("category", formCategory);
      formData.append("tags", formTags);
      if (formDuration) formData.append("duration", formDuration);

      if (videoUploadType === "file" && formVideoFile) {
        formData.append("file", formVideoFile);
      } else {
        formData.append("url", formUrl);
      }

      if (thumbUploadType === "file" && formThumbFile) {
        formData.append("thumbnailFile", formThumbFile);
      } else if (formThumbnail) {
        formData.append("thumbnailUrl", formThumbnail);
      }

      const res = await fetch("/api/videos", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setFormTitle("");
        setFormUrl("");
        setFormCategory("Geral");
        setFormTags("");
        setFormThumbnail("");
        setFormDuration("");
        setFormVideoFile(null);
        setFormThumbFile(null);
        setVideoUploadType("url");
        setThumbUploadType("url");
        setIsModalOpen(false);
        fetchVideos();
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao adicionar vídeo");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFavorite = async (video: VideoItem) => {
    try {
      const res = await fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !video.isFavorite }),
      });
      if (res.ok) {
        setVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, isFavorite: !v.isFavorite } : v))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza de que deseja excluir este vídeo?")) return;

    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setVideos((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateProgress = async (id: string, progress: number) => {
    try {
      await fetch(`/api/videos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress }),
      });
      setVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, progress } : v))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const categories = ["Todos", "Documentários", "Educação", "Entretenimento", "Guias", "Geral"];

  const formatDuration = (sec: number | null) => {
    if (!sec) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch")) {
      const vidId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${vidId}`;
    }
    if (url.includes("youtu.be/")) {
      const vidId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${vidId}`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Video className="w-6 h-6 text-primary" />
            Cine Vault
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Assista, organize e acompanhe o progresso de links de vídeos externos ou arquivos locais.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Vincular Vídeo
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors border ${
                activeCategory === cat
                  ? "bg-primary border-primary/20 text-white"
                  : "bg-card/40 border-border/80 text-muted-foreground hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar vídeos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card/40 border border-border/85 rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Grade de Vídeos */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-video bg-card/60 animate-pulse rounded-2xl border border-border/85 h-64" />
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((vid) => (
            <motion.div
              layoutId={vid.id}
              key={vid.id}
              onClick={() => setActiveVideo(vid)}
              whileTap={{ scale: 0.97 }}
              className="group bg-card/55 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-sm cursor-pointer flex flex-col h-full hover-card-effects"
            >
              <div className="relative aspect-video bg-black/60 shrink-0 overflow-hidden group">
                {vid.thumbnailUrl ? (
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/40">
                    <Film className="w-10 h-10 text-border" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-300">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {vid.duration && (
                  <span className="absolute bottom-2.5 right-2.5 bg-black/80 text-[10px] px-2 py-0.5 rounded text-white font-mono border border-white/5">
                    {formatDuration(vid.duration)}
                  </span>
                )}

                {vid.duration && vid.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(vid.progress / vid.duration) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white/95 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {vid.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {vid.category && (
                      <span className="text-[10px] px-2 py-0.5 bg-muted rounded border border-border/80 text-muted-foreground font-semibold">
                        {vid.category}
                      </span>
                    )}
                    {vid.tags && vid.tags.split(",").slice(0, 2).map(tag => (
                      <span key={tag} className="text-[9px] text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 mt-4 pt-3.5">
                  <span className="text-[10px] text-muted-foreground truncate max-w-44 flex items-center gap-1.5 font-mono">
                    <ExternalLink className="w-3 h-3 text-border shrink-0" />
                    {vid.url}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(vid);
                      }}
                      className={`p-1.5 rounded-lg border cursor-pointer hover:bg-muted/40 transition-colors ${
                        vid.isFavorite
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-border/80 text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${vid.isFavorite ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(vid.id, e)}
                      className="p-1.5 rounded-lg border border-border/80 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-card/15 border border-dashed border-border rounded-2xl">
          <Film className="w-10 h-10 text-muted-foreground mb-3" />
          <h3 className="text-sm font-semibold text-white">Nenhum vídeo vinculado</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Comece vinculando URLs de streaming de vídeo externas ou caminhos locais de mídia.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-3.5 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 transition-all cursor-pointer"
          >
            Adicionar Primeiro Vídeo
          </button>
        </div>
      )}

      {/* MODAL VINCULAR VÍDEO */}
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
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-primary" />
                  Vincular Novo Vídeo
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                    Título do Vídeo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cinemática Espacial 4K"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                  />
                </div>

                {/* Seletores de abas do vídeo (Upload vs URL) */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Origem do Vídeo *
                  </label>
                  <div className="flex bg-muted/30 border border-border p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setVideoUploadType("file")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        videoUploadType === "file" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Arquivo
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoUploadType("url")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        videoUploadType === "url" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      Colar Link URL
                    </button>
                  </div>
                </div>

                {videoUploadType === "file" ? (
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                      Selecionar Arquivo de Vídeo
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      required
                      onChange={(e) => setFormVideoFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary file:cursor-pointer hover:file:bg-primary/20 cursor-pointer bg-muted/20 border border-border p-2.5 rounded-xl"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                      URL de Origem
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Link do YouTube ou arquivo .mp4 direto"
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                      Categoria
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white text-xs focus:outline-none focus:ring-0 transition-all cursor-pointer"
                    >
                      {categories.slice(1).map((cat) => (
                        <option key={cat} value={cat} className="bg-card">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                      Duração (segundos)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 600"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                    />
                  </div>
                </div>

                {/* Seletores de abas da imagem de capa (Upload vs URL) */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Capa do Vídeo
                  </label>
                  <div className="flex bg-muted/30 border border-border p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setThumbUploadType("file")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        thumbUploadType === "file" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Capa
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbUploadType("url")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        thumbUploadType === "url" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      Colar Link URL
                    </button>
                  </div>
                </div>

                {thumbUploadType === "file" ? (
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                      Selecionar Arquivo de Capa
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormThumbFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary file:cursor-pointer hover:file:bg-primary/20 cursor-pointer bg-muted/20 border border-border p-2.5 rounded-xl"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                      URL da Imagem de Capa
                    </label>
                    <input
                      type="text"
                      placeholder="https://imagens.unsplash.com/..."
                      value={formThumbnail}
                      onChange={(e) => setFormThumbnail(e.target.value)}
                      className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                    Tags (separadas por vírgula)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                      <Tag className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="espaco, nebula, cinema"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-end gap-2.5">
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
                    className="px-4 py-2 rounded-xl text-xs bg-primary hover:bg-primary/95 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-primary/10"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Vídeo"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX DO PLAYER DE VÍDEO */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                const videoEl = document.getElementById("preview-video-player") as HTMLVideoElement;
                if (videoEl) {
                  updateProgress(activeVideo.id, Math.floor(videoEl.currentTime));
                }
                setActiveVideo(null);
              }}
              className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            />

            <motion.div
              layoutId={activeVideo.id}
              className="w-full max-w-4xl aspect-video bg-black border border-border rounded-2xl relative z-10 flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-5 pointer-events-none z-20">
                <span className="text-sm font-semibold text-white truncate max-w-[80%] shadow-sm font-medium">
                  {activeVideo.title}
                </span>
                <button
                  onClick={() => {
                    const videoEl = document.getElementById("preview-video-player") as HTMLVideoElement;
                    if (videoEl) {
                      updateProgress(activeVideo.id, Math.floor(videoEl.currentTime));
                    }
                    setActiveVideo(null);
                  }}
                  className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white cursor-pointer pointer-events-auto border border-white/5 transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="flex-1 w-full h-full relative">
                {getEmbedUrl(activeVideo.url) ? (
                  <iframe
                    src={`${getEmbedUrl(activeVideo.url)}?autoplay=1`}
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0 absolute inset-0"
                  />
                ) : (
                  <video
                    id="preview-video-player"
                    src={activeVideo.url}
                    autoPlay
                    controls
                    className="w-full h-full object-contain"
                    onLoadedMetadata={(e) => {
                      const videoEl = e.currentTarget;
                      if (activeVideo.progress > 0) {
                        videoEl.currentTime = activeVideo.progress;
                      }
                    }}
                    onPause={(e) => {
                      updateProgress(activeVideo.id, Math.floor(e.currentTarget.currentTime));
                    }}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

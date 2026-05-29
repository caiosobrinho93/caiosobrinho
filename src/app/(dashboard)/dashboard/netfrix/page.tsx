"use client";

import { useEffect, useState } from "react";
import { useStatsStore } from "@/stores/statsStore";
import { useDataStore } from "@/stores/dataStore";
import { motion, AnimatePresence } from "framer-motion";
import VideoPlayer from "@/components/VideoPlayer";
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
  user?: {
    username: string;
  };
}

export default function NetfrixPage() {
  const { data: videos, isLoading } = useDataStore(s => s.videos);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // Estados do formulário de upload/link
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    useDataStore.getState().fetchVideos(search, "Todos");
  }, [search]);

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
        const newVideo = await res.json();
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
        
        useDataStore.getState().addVideo(newVideo);
        useStatsStore.getState().addVideo(newVideo, newVideo.user?.username || "caio");
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
        const nextFav = !video.isFavorite;
        useDataStore.getState().toggleVideoFavorite(video.id, nextFav);
        useStatsStore.getState().toggleVideoFavorite(video.id, nextFav, video.title, video.user?.username || "caio");
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
        useDataStore.getState().deleteVideo(id);
        useStatsStore.getState().deleteVideo(id);
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
      useDataStore.getState().updateVideoProgress(id, progress);
    } catch (e) {
      console.error(e);
    }
  };

  const formatDuration = (sec: number | null) => {
    if (!sec) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const categories = ["Documentários", "Educação", "Entretenimento", "Guias", "Geral"];

  // Filtragem e agrupamento de lanes
  const favorites = videos.filter(v => v.isFavorite);
  const recentVideos = [...videos].reverse(); // Recentes primeiro
  
  // Escolher o vídeo de destaque para o Billboard Hero Banner
  const billboardVideo = favorites[0] || videos[0] || null;

  const renderLane = (title: string, laneVideos: VideoItem[]) => {
    if (laneVideos.length === 0) return null;
    return (
      <div key={title} className="space-y-3 text-left">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white pl-2 border-l-2 border-primary">
          {title} ({laneVideos.length})
        </h2>
        
        <div className="flex overflow-x-auto gap-4 py-2 pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x scroll-smooth">
          {laneVideos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => setActiveVideo(vid)}
              className="w-64 shrink-0 snap-start group relative border border-white/5 bg-black/40 rounded-lg overflow-hidden cursor-pointer hover:scale-105 hover:border-primary/40 hover:z-20 transition-all duration-300 shadow-md hover:shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
            >
              <div className="relative aspect-video bg-black/60 overflow-hidden">
                {vid.thumbnailUrl ? (
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/40 animate-pulse">
                    <Film className="w-8 h-8 text-border" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-300">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
                  </div>
                </div>

                {vid.duration && (
                  <span className="absolute bottom-2 right-2 bg-black/80 text-[10px] px-1.5 py-0.5 rounded text-white font-mono border border-white/5">
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

              <div className="p-3 space-y-2">
                <h3 className="text-xs font-bold text-white leading-tight truncate group-hover:text-primary transition-colors">
                  {vid.title}
                </h3>
                
                <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-white/5 border border-white/10 px-1 py-0.2 rounded uppercase font-bold shrink-0">
                      {vid.category || "Geral"}
                    </span>
                    {vid.user?.username && (
                      <span className={`user-tag user-tag-${vid.user.username} scale-90`}>
                        {vid.user.username === "caio" ? "Caio" : "Giselle"}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleFavorite(vid)}
                      className={`p-1 rounded border transition-colors cursor-pointer ${
                        vid.isFavorite
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-white/5 hover:text-white"
                      }`}
                      title={vid.isFavorite ? "Remover da minha lista" : "Adicionar à minha lista"}
                    >
                      <Star className={`w-3 h-3 ${vid.isFavorite ? "fill-current text-yellow-400" : ""}`} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(vid.id, e)}
                      className="p-1 rounded border border-white/5 hover:text-red-400 hover:border-red-500/20 cursor-pointer transition-colors"
                      title="Excluir vídeo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 mb-6 text-left gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="text-red-600 font-extrabold tracking-tighter text-2xl font-sans">NETFRIX</span>
            <span className="text-xs bg-red-600/10 border border-red-600/30 text-red-500 font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded">Cine</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Plataforma de streaming pessoal de vídeos vinculados e arquivos locais.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="relative w-44 sm:w-60">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Buscar vídeos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white placeholder-muted-foreground text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-lg shadow-red-600/10 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Vincular
          </button>
        </div>
      </div>

      <div className="px-5 space-y-8">
        {isLoading ? (
          <div className="space-y-8">
            <div className="w-full h-80 bg-white/[0.02] border border-white/5 rounded-xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 w-40 bg-white/[0.02] rounded animate-pulse" />
              <div className="flex gap-4 overflow-hidden">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-64 aspect-video bg-white/[0.02] rounded-lg animate-pulse border border-white/5 shrink-0" />
                ))}
              </div>
            </div>
          </div>
        ) : search.trim() !== "" ? (
          // Vista de Busca (Grade Clássica)
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white pl-2 border-l-2 border-primary text-left">
              Resultados da busca ({videos.length})
            </h2>
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {videos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => setActiveVideo(vid)}
                    className="group relative border border-white/5 bg-black/40 rounded-lg overflow-hidden cursor-pointer hover:scale-105 hover:border-primary/40 hover:z-20 transition-all duration-300 shadow-md text-left"
                  >
                    <div className="relative aspect-video bg-black/60 overflow-hidden">
                      {vid.thumbnailUrl ? (
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/40 animate-pulse">
                          <Film className="w-8 h-8 text-border" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-300">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                          <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {vid.duration && (
                        <span className="absolute bottom-2 right-2 bg-black/80 text-[10px] px-1.5 py-0.5 rounded text-white font-mono border border-white/5">
                          {formatDuration(vid.duration)}
                        </span>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <h3 className="text-xs font-bold text-white truncate leading-tight group-hover:text-primary transition-colors">
                        {vid.title}
                      </h3>
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                        <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                          {vid.category || "Geral"}
                        </span>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleFavorite(vid)}
                            className={`p-1 rounded border transition-colors cursor-pointer ${
                              vid.isFavorite ? "border-primary/20 bg-primary/10 text-primary" : "border-white/5 hover:text-white"
                            }`}
                          >
                            <Star className={`w-3 h-3 ${vid.isFavorite ? "fill-current text-yellow-400" : ""}`} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(vid.id, e)}
                            className="p-1 rounded border border-white/5 hover:text-red-400 hover:border-red-500/20 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-left py-6">Nenhum vídeo atende aos termos de busca.</p>
            )}
          </div>
        ) : videos.length === 0 ? (
          // Estado Vazio
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white/[0.01] border border-dashed border-white/10 rounded-xl">
            <Film className="w-10 h-10 text-muted-foreground mb-3" />
            <h3 className="text-sm font-semibold text-white">Nenhum vídeo vinculado</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
              Dê vida ao Netfrix! Adicione links do YouTube, arquivos de vídeo locais ou transmissões na nuvem.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all cursor-pointer shadow-lg shadow-red-600/10"
            >
              Adicionar Primeiro Vídeo
            </button>
          </div>
        ) : (
          // Vista Netflix Completa (Billboard Hero Banner + Carrosséis Lanes)
          <>
            {/* Billboard Hero Banner */}
            {billboardVideo && (
              <div className="relative w-full h-[50.25vw] md:h-[350px] lg:h-[400px] overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-2xl group text-left">
                {billboardVideo.thumbnailUrl ? (
                  <img
                    src={billboardVideo.thumbnailUrl}
                    alt={billboardVideo.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-[1.01] transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-black to-red-950/20 flex items-center justify-center">
                    <Film className="w-20 h-20 text-white/5" />
                  </div>
                )}
                
                {/* Gradient Masks */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 p-6 md:p-10 space-y-3 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-red-500 tracking-widest uppercase bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded font-mono">
                      DESTAQUE NETFRIX
                    </span>
                    {billboardVideo.category && (
                      <span className="text-[9px] font-bold text-white/50 tracking-widest uppercase bg-white/5 px-2 py-0.5 rounded font-mono border border-white/10">
                        {billboardVideo.category}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-white leading-tight drop-shadow-md line-clamp-2">
                    {billboardVideo.title}
                  </h2>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveVideo(billboardVideo)}
                      className="flex items-center gap-2 px-5 py-2 bg-white text-black hover:bg-white/90 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-lg hover:scale-105"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Assistir
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(billboardVideo)}
                      className={`flex items-center gap-2 px-5 py-2 border text-xs font-bold rounded-lg transition-all cursor-pointer hover:scale-105 ${
                        billboardVideo.isFavorite
                          ? "bg-red-500/10 border-red-500/30 text-red-500"
                          : "bg-black/45 border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${billboardVideo.isFavorite ? "fill-current" : ""}`} />
                      {billboardVideo.isFavorite ? "Minha Lista" : "Adicionar à Lista"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Rows de Categorias / Lanes */}
            <div className="space-y-8">
              {/* Lane 1: Minha Lista (Favoritos) */}
              {renderLane("Minha Lista", favorites)}

              {/* Lane 2: Recém Adicionados */}
              {renderLane("Adicionados Recentemente", recentVideos.slice(0, 10))}

              {/* Lanes por Categoria Física */}
              {categories.map(cat => {
                const laneVideos = videos.filter(v => v.category === cat);
                return renderLane(cat, laneVideos);
              })}
            </div>
          </>
        )}
      </div>

      {/* MODAL VINCULAR VÍDEO */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl relative z-10 overflow-hidden text-left"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/80">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 font-display uppercase tracking-wider">
                  <PlusCircle className="w-4 h-4 text-red-500" />
                  Vincular Vídeo no Netfrix
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                    Título do Vídeo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Trailer Oficial - Interestelar"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-red-500 rounded-lg text-white placeholder-muted-foreground text-xs focus:outline-none transition-all"
                  />
                </div>

                {/* Seletores de abas do vídeo (Upload vs URL) */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                    Origem do Vídeo *
                  </label>
                  <div className="flex bg-muted/30 border border-border p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setVideoUploadType("file")}
                      className={`flex-1 py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        videoUploadType === "file" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Arquivo
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoUploadType("url")}
                      className={`flex-1 py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
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
                    <label className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                      Selecionar Arquivo de Vídeo
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      required
                      onChange={(e) => setFormVideoFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-red-500/10 file:text-red-400 file:cursor-pointer hover:file:bg-red-500/20 cursor-pointer bg-muted/20 border border-border p-3 rounded-lg"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                      URL de Origem
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Link do YouTube ou arquivo .mp4 direto"
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-red-500 rounded-lg text-white placeholder-muted-foreground text-xs focus:outline-none transition-all"
                    />
                  </div>
                )}

                {/* Botão de Opções Avançadas */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    {showAdvanced ? "Ocultar Opções Avançadas" : "Exibir Opções Avançadas"}
                  </button>
                </div>

                {/* Campos Ocultos (Avançados) */}
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden pt-2 border-t border-border/30"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                            Categoria
                          </label>
                          <select
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-red-500 rounded-lg text-white text-xs focus:outline-none cursor-pointer"
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat} className="bg-card">
                                {cat}
                              </option>
                            ))}
                            <option value="Geral" className="bg-card">Geral</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                            Duração (segundos)
                          </label>
                          <input
                            type="number"
                            placeholder="Ex: 600"
                            value={formDuration}
                            onChange={(e) => setFormDuration(e.target.value)}
                            className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-red-500 rounded-lg text-white placeholder-muted-foreground text-xs focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Seletores de abas da imagem de capa (Upload vs URL) */}
                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                          Capa do Vídeo (Thumbnail)
                        </label>
                        <div className="flex bg-muted/30 border border-border p-1 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setThumbUploadType("file")}
                            className={`flex-1 py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                              thumbUploadType === "file" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                            }`}
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Upload Capa
                          </button>
                          <button
                            type="button"
                            onClick={() => setThumbUploadType("url")}
                            className={`flex-1 py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
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
                          <label className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                            Selecionar Arquivo de Capa
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFormThumbFile(e.target.files?.[0] || null)}
                            className="w-full text-xs text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-red-500/10 file:text-red-400 file:cursor-pointer hover:file:bg-red-500/20 cursor-pointer bg-muted/20 border border-border p-3 rounded-lg"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                            URL da Imagem de Capa
                          </label>
                          <input
                            type="text"
                            placeholder="https://imagens.unsplash.com/..."
                            value={formThumbnail}
                            onChange={(e) => setFormThumbnail(e.target.value)}
                            className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-red-500 rounded-lg text-white placeholder-muted-foreground text-xs focus:outline-none transition-all"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
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
                            className="w-full pl-9 pr-3 py-2 bg-muted/40 border border-border focus:border-red-500 rounded-lg text-white placeholder-muted-foreground text-xs focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-2 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setShowAdvanced(false);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:text-white cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-lg text-xs bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/10"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Viculando...
                      </>
                    ) : (
                      "Vincular"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX DO PLAYER DE VÍDEO CYBERPUNK PREMIUM */}
      <AnimatePresence>
        {activeVideo && (
          <VideoPlayer
            video={activeVideo}
            playlist={videos}
            onClose={() => setActiveVideo(null)}
            onUpdateProgress={updateProgress}
            onPlayVideo={(nextVideo) => setActiveVideo(nextVideo)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DownloadCloud,
  Plus,
  Search,
  Trash2,
  Play,
  Pause,
  Copy,
  Check,
  ArrowDown,
  ArrowUp,
  Loader2,
  PlusCircle,
  X,
  FileText,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Download,
  Info,
  Upload
} from "lucide-react";

interface TorrentItem {
  id: string;
  title: string;
  magnet: string;
  status: string; // queued, downloading, seeding, paused, completed
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  size: string;
  notes: string | null;
}

export default function TorrentsPage() {
  const [torrents, setTorrents] = useState<TorrentItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTorrent, setSelectedTorrent] = useState<TorrentItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estados do formulário
  const [formTitle, setFormTitle] = useState("");
  const [torrentSourceType, setTorrentSourceType] = useState<"file" | "magnet">("magnet");
  const [formTorrentFile, setFormTorrentFile] = useState<File | null>(null);
  const [formMagnet, setFormMagnet] = useState("");
  const [formSize, setFormSize] = useState("1.8 GB");
  const [formNotes, setFormNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auxiliar para separar arquivo físico das anotações no campo notes do banco de dados
  const parseNotesAndFile = (notesText: string | null) => {
    if (!notesText) return { fileUrl: null, cleanNotes: "" };
    if (notesText.startsWith("[FILE]:")) {
      const parts = notesText.split("\n");
      const fileUrl = parts[0].substring(7);
      const cleanNotes = parts.slice(1).join("\n");
      return { fileUrl, cleanNotes };
    }
    return { fileUrl: null, cleanNotes: notesText };
  };

  // Buscar torrents
  const fetchTorrents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/torrents");
      if (res.ok) {
        const data = await res.json();
        setTorrents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTorrents();
  }, []);

  // Simulação de velocidade e progresso do cliente torrent em tempo real
  useEffect(() => {
    if (torrents.length === 0) return;

    const interval = setInterval(() => {
      setTorrents((prevTorrents) => {
        let changed = false;
        
        const updated = prevTorrents.map((t) => {
          if (t.status === "downloading") {
            changed = true;
            const newProgress = Math.min(100, t.progress + Math.random() * 1.5 + 0.5);
            const isFinished = newProgress >= 100;
            
            const dlSpeed = isFinished ? 0.0 : parseFloat((10 + Math.random() * 25).toFixed(1));
            const ulSpeed = isFinished
              ? parseFloat((2 + Math.random() * 6).toFixed(1))
              : parseFloat((0.2 + Math.random() * 1.8).toFixed(1));
            
            const nextStatus = isFinished ? "seeding" : "downloading";

            if (isFinished) {
              fetch(`/api/torrents/${t.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "seeding", progress: 100, downloadSpeed: 0, uploadSpeed: ulSpeed }),
              }).catch(console.error);
            }

            return {
              ...t,
              progress: parseFloat(newProgress.toFixed(1)),
              downloadSpeed: dlSpeed,
              uploadSpeed: ulSpeed,
              status: nextStatus,
            };
          }
          
          if (t.status === "seeding") {
            changed = true;
            return {
              ...t,
              downloadSpeed: 0.0,
              uploadSpeed: parseFloat((1.5 + Math.random() * 4).toFixed(1)),
            };
          }
          
          return t;
        });

        return changed ? updated : prevTorrents;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [torrents.length]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;
    if (torrentSourceType === "magnet" && !formMagnet) return;
    if (torrentSourceType === "file" && !formTorrentFile) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", formTitle);
      formData.append("size", formSize);
      formData.append("notes", formNotes);

      if (torrentSourceType === "file" && formTorrentFile) {
        formData.append("file", formTorrentFile);
      } else {
        formData.append("magnet", formMagnet);
      }

      const res = await fetch("/api/torrents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setFormTitle("");
        setFormMagnet("");
        setFormSize("1.8 GB");
        setFormNotes("");
        setFormTorrentFile(null);
        setTorrentSourceType("magnet");
        setIsModalOpen(false);
        fetchTorrents();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Falha ao adicionar torrent");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: TorrentItem) => {
    const nextStatus = item.status === "paused" ? "downloading" : "paused";
    const dlSpeed = nextStatus === "downloading" ? 15.0 : 0.0;
    const ulSpeed = nextStatus === "downloading" ? 0.8 : 0.0;

    try {
      const res = await fetch(`/api/torrents/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          downloadSpeed: dlSpeed,
          uploadSpeed: ulSpeed,
        }),
      });

      if (res.ok) {
        setTorrents((prev) =>
          prev.map((t) =>
            t.id === item.id
              ? { ...t, status: nextStatus, downloadSpeed: dlSpeed, uploadSpeed: ulSpeed }
              : t
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este torrent do catálogo?")) return;

    try {
      const res = await fetch(`/api/torrents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTorrents((prev) => prev.filter((t) => t.id !== id));
        setSelectedTorrent(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const downloadTorrentFile = (item: TorrentItem) => {
    const torrentMetadata = `d8:announce43:udp://tracker.coppersurfer.tk:6969/announce13:announce-listll43:udp://tracker.coppersurfer.tk:6969/announceel44:udp://tracker.opentrackr.org:1337/announceee7:comment29:Nexus Vault Virtual Torrent File10:created by11:Nexus Vault13:creation datei1716643200e4:infod6:lengthi1048576e4:name${item.title.length}:${item.title}12:piece lengthi16384e6:pieces20:12345678901234567890ee`;
    const blob = new Blob([torrentMetadata], { type: "application/x-bittorrent" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.title.replace(/\s+/g, "_")}.torrent`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "downloading":
        return "bg-primary shadow-[0_0_8px_hsl(var(--primary))]";
      case "seeding":
        return "bg-emerald shadow-[0_0_8px_#10b981]";
      case "paused":
        return "bg-amber shadow-[0_0_8px_#f59e0b]";
      default:
        return "bg-muted-foreground/60";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "downloading":
        return "Baixando";
      case "seeding":
        return "Semeando";
      case "paused":
        return "Pausado";
      case "completed":
        return "Concluído";
      default:
        return "Fila";
    }
  };

  const filteredTorrents = torrents.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  // Achar o torrent selecionado ativo na simulação
  const activeSelected = selectedTorrent ? torrents.find(t => t.id === selectedTorrent.id) || selectedTorrent : null;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <DownloadCloud className="w-6 h-6 text-primary" />
            Torrents
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Lista de downloads de arquivos do cofre digital. Clique no título para gerenciar transferências e obter os arquivos.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/10 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Adicionar Torrent
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex justify-end gap-4">
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar torrents por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card/40 border border-border/85 rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Grade Principal Ultra-Clean de Títulos */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-card/60 rounded-2xl border border-border/80" />
          ))}
        </div>
      ) : filteredTorrents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTorrents.map((item) => {
            const isFinished = item.progress >= 100;
            return (
              <motion.div
                key={item.id}
                onClick={() => setSelectedTorrent(item)}
                whileTap={{ scale: 0.97 }}
                className="group cursor-pointer bg-card/45 backdrop-blur-xl border border-border rounded-2xl p-4.5 flex flex-col justify-between h-32 relative overflow-hidden hover-card-effects"
              >
                {/* Linha superior */}
                <div className="flex justify-between items-start gap-2.5">
                  <div className="min-w-0">
                    <h3 className="text-xs font-extrabold text-white group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </h3>
                    <span className="text-[9px] text-muted-foreground font-mono bg-muted/60 border border-border/60 px-1.5 py-0.5 rounded inline-block mt-1 font-semibold">
                      {item.size}
                    </span>
                  </div>
                  {/* Ponto Neon de Status */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                    <span className="text-[9px] font-bold text-muted-foreground/90 uppercase hide-mobile">
                      {getStatusText(item.status)}
                    </span>
                  </div>
                </div>

                {/* Info de Velocidade Curta no Mobile/Desktop */}
                <div className="text-[10px] text-muted-foreground flex justify-between items-center mt-3">
                  <span className="font-semibold">{item.progress}% concluído</span>
                  {item.status === "downloading" && (
                    <span className="font-mono text-primary font-bold flex items-center gap-0.5">
                      <ArrowDown className="w-3 h-3 animate-bounce" />
                      {item.downloadSpeed} M/s
                    </span>
                  )}
                  {item.status === "seeding" && (
                    <span className="font-mono text-emerald font-bold flex items-center gap-0.5">
                      <ArrowUp className="w-3 h-3" />
                      {item.uploadSpeed} M/s
                    </span>
                  )}
                </div>

                {/* Fita de Progresso Fina no Rodapé */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30">
                  <div
                    className={`h-full transition-all duration-500 ${
                      item.status === "seeding" ? "bg-emerald shadow-[0_0_8px_#10b981]" : "bg-primary shadow-[0_0_8px_var(--primary)]"
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-card/15 border border-dashed border-border rounded-2xl">
          <DownloadCloud className="w-10 h-10 text-muted-foreground mb-3 animate-bounce" />
          <h3 className="text-sm font-semibold text-white">Nenhum torrent catalogado</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Adicione e visualize links magnéticos de seus softwares, ISOs ou mídias.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-3.5 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 transition-all cursor-pointer"
          >
            Adicionar Primeiro Torrent
          </button>
        </div>
      )}

      {/* MODAL DE DETALHES DO TORRENT SELECIONADO */}
      <AnimatePresence>
        {activeSelected && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTorrent(null)}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/80">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <DownloadCloud className="w-5 h-5 text-primary" />
                  Detalhes da Transferência
                </h2>
                <button
                  onClick={() => setSelectedTorrent(null)}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Informações detalhadas */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white">{activeSelected.title}</h3>
                  <div className="flex gap-2 items-center mt-1.5">
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 border border-border px-1.5 py-0.5 rounded">
                      Tamanho: {activeSelected.size}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1.5 ${
                      activeSelected.status === "downloading" ? "bg-primary/10 text-primary" : activeSelected.status === "seeding" ? "bg-emerald/10 text-emerald" : "bg-muted text-muted-foreground"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(activeSelected.status)}`} />
                      {getStatusText(activeSelected.status)}
                    </span>
                  </div>
                </div>

                {/* Painel do Gráfico de Simulação */}
                <div className="p-4 bg-muted/20 border border-border/40 rounded-xl space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-semibold">Progresso Geral:</span>
                    <span className="text-white font-mono font-bold">{activeSelected.progress}%</span>
                  </div>
                  
                  {/* Barra de Progresso */}
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-300 ${
                        activeSelected.status === "seeding" ? "bg-emerald" : "bg-primary"
                      }`}
                      style={{ width: `${activeSelected.progress}%` }}
                    />
                  </div>

                  {/* Estatísticas de Velocidade */}
                  <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <span className="text-[9px] text-muted-foreground block font-bold">Download</span>
                        <span className="font-mono text-xs text-white font-bold">{activeSelected.downloadSpeed} MB/s</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <ArrowUp className="w-4 h-4 text-emerald shrink-0" />
                      <div>
                        <span className="text-[9px] text-muted-foreground block font-bold">Upload</span>
                        <span className="font-mono text-xs text-white font-bold">{activeSelected.uploadSpeed} MB/s</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Anotações */}
                {(() => {
                  const { cleanNotes } = parseNotesAndFile(activeSelected.notes);
                  return cleanNotes ? (
                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Anotações</span>
                      <p className="text-xs text-white/85 leading-relaxed font-semibold">{cleanNotes}</p>
                    </div>
                  ) : null;
                })()}

                {/* Magnet Link */}
                {!activeSelected.magnet.includes("virtual-") && (
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-2">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase block">Link Magnético</span>
                    <div className="flex items-center justify-between gap-2.5">
                      <span className="text-[11px] text-white/80 font-mono truncate select-all flex-1">
                        {activeSelected.magnet}
                      </span>
                      <button
                        onClick={() => handleCopy(activeSelected.id, activeSelected.magnet)}
                        className="p-1.5 rounded-lg bg-card hover:bg-muted border border-border text-muted-foreground hover:text-white transition-colors cursor-pointer"
                        title="Copiar link"
                      >
                        {copiedId === activeSelected.id ? <Check className="w-3.5 h-3.5 text-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Botões de uTorrent & Download .torrent (Se Houver) */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
                  <button
                    onClick={() => handleDelete(activeSelected.id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                  </button>

                  <div className="flex gap-2">
                    {/* Botão de simular Play / Pause */}
                    <button
                      onClick={() => handleToggleStatus(activeSelected)}
                      disabled={activeSelected.status === "seeding"}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        activeSelected.status === "seeding"
                          ? "border-border/45 text-muted-foreground/35 cursor-not-allowed"
                          : activeSelected.status === "paused"
                          ? "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
                          : "border-border text-muted-foreground hover:text-white hover:bg-muted/40"
                      }`}
                      title={activeSelected.status === "paused" ? "Retomar" : "Pausar"}
                    >
                      {activeSelected.status === "paused" ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                    </button>

                    {/* Botão Baixar arquivo .torrent (Se Houver) */}
                    {(() => {
                      const { fileUrl } = parseNotesAndFile(activeSelected.notes);
                      if (fileUrl) {
                        return (
                          <a
                            href={fileUrl}
                            download={`${activeSelected.title.replace(/\s+/g, "_")}.torrent`}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            title="Baixar arquivo .torrent real"
                          >
                            <Download className="w-4 h-4" />
                            Baixar .torrent
                          </a>
                        );
                      } else {
                        return (
                          <button
                            onClick={() => downloadTorrentFile(activeSelected)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            title="Baixar arquivo .torrent virtual"
                          >
                            <Download className="w-4 h-4" />
                            Baixar .torrent
                          </button>
                        );
                      }
                    })()}

                    {/* Botão de uTorrent (Abrir Magnet) */}
                    {activeSelected.magnet.startsWith("magnet:?") && !activeSelected.magnet.includes("virtual-") && (
                      <a
                        href={activeSelected.magnet}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-primary/15 hover:bg-primary/25 border border-primary/20 text-primary text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        title="Abrir no uTorrent local"
                      >
                        <LinkIcon className="w-4 h-4" />
                        uTorrent
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ADICIONAR TORRENT */}
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
                  Adicionar Torrent
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
                    Nome do Arquivo / Título *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: GTA V, Need for Speed, etc."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                  />
                </div>

                {/* Seletores de abas do torrent (Upload vs Magnet) */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Origem do Torrent *
                  </label>
                  <div className="flex bg-muted/30 border border-border p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setTorrentSourceType("file")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        torrentSourceType === "file" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload .torrent
                    </button>
                    <button
                      type="button"
                      onClick={() => setTorrentSourceType("magnet")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        torrentSourceType === "magnet" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      Link Magnet
                    </button>
                  </div>
                </div>

                {torrentSourceType === "file" ? (
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                      Selecionar Arquivo .torrent
                    </label>
                    <input
                      type="file"
                      accept=".torrent"
                      required
                      onChange={(e) => setFormTorrentFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary file:cursor-pointer hover:file:bg-primary/20 cursor-pointer bg-muted/20 border border-border p-2.5 rounded-xl"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                      Link Magnet *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="magnet:?xt=urn:btih:..."
                      value={formMagnet}
                      onChange={(e) => setFormMagnet(e.target.value)}
                      className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all font-mono"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                      Tamanho
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 65 GB"
                      value={formSize}
                      onChange={(e) => setFormSize(e.target.value)}
                      className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                      Categoria
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Jogos, Cursos, ISOs"
                      className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                    Anotações Extras
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Descrição sobre o conteúdo do torrent..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all resize-none"
                  />
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
                        Indexando...
                      </>
                    ) : (
                      "Iniciar Download"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

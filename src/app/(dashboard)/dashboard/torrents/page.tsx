"use client";

import React, { useEffect, useState } from "react";
import { useStatsStore } from "@/stores/statsStore";
import { useDataStore } from "@/stores/dataStore";
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
  user?: {
    username: string;
  };
}

export default function TorrentsPage() {
  const { data: torrents, isLoading } = useDataStore(s => s.torrents);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTorrentId, setSelectedTorrentId] = useState<string | null>(null);
  const [detailTorrent, setDetailTorrent] = useState<TorrentItem | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
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

  useEffect(() => {
    useDataStore.getState().fetchTorrents();
  }, []);

  const handleSelectTorrent = async (item: TorrentItem) => {
    setSelectedTorrentId(item.id);
    setDetailTorrent(item);
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/torrents/${item.id}`);
      if (res.ok) {
        const fullData = await res.json();
        setDetailTorrent(fullData);
      }
    } catch (err) {
      console.error("Error loading torrent details:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

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
        
        // Atualiza no cache e na store global
        const newTorrent = await res.json();
        useDataStore.getState().addTorrent(newTorrent);
        useStatsStore.getState().addTorrent();
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



  const handleDelete = async (id: string) => {
    if (!confirm("Remover este torrent do catálogo?")) return;

    try {
      const res = await fetch(`/api/torrents/${id}`, { method: "DELETE" });
      if (res.ok) {
        useDataStore.getState().deleteTorrent(id);
        setSelectedTorrentId(null);
        setDetailTorrent(null);

        // Atualiza a store global localmente
        useStatsStore.getState().deleteTorrent();
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

  const getStatusColor = () => {
    return "bg-emerald shadow-[0_0_8px_#10b981]";
  };

  const getStatusText = () => {
    return "Disponível";
  };

  const filteredTorrents = torrents.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  // Achar o torrent selecionado ativo na simulação
  const activeSelected = selectedTorrentId ? detailTorrent : null;

  return (
    <div className="space-y-6 pb-8">
      {/* Cabeçalho */}
      <div className="px-5 sm:px-0 py-5 flex flex-col items-start text-left border-b border-border/40 mb-6">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-5.5">
          <DownloadCloud className="w-6 h-6 text-primary" />
          Torrents
        </h1>
        <p className="text-xs text-muted-foreground mt-1.5">
          Lista de downloads de arquivos do cofre digital. Clique no título para gerenciar transferências e obter os arquivos.
        </p>
      </div>

      {/* Conteúdo com Padding */}
      <div className="space-y-6 px-5 sm:px-0">
        {/* Opções e Botões */}
        <div className="flex flex-wrap gap-4 items-center justify-start">
          <button
            onClick={() => setIsModalOpen(true)}
            className="frutiger-button rounded-xl shadow-[0_4px_15px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-transform">
  <div className="frutiger-inner px-6 py-2.5 rounded-xl flex items-center justify-center gap-2">
    <div className="frutiger-top-white"></div>
    <span className="frutiger-text flex items-center justify-center gap-2 font-bold drop-shadow-md text-sm">
      <Plus className="w-4 h-4" />
              Adicionar Torrent
    </span>
  </div>
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
            className="w-full pl-10 pr-4 py-2 bg-card/40 border border-border/85 rounded-sm text-white placeholder-muted-foreground text-xs focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Grade Principal Ultra-Clean de Títulos */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-card/60 rounded-sm border border-border/80" />
          ))}
        </div>
      ) : filteredTorrents.length > 0 ? (
        <>
          {/* MOBILE: compact list rows */}
          <div className="sm:hidden flex flex-col gap-5">
            {filteredTorrents.map((item) => (
              <motion.div
                key={item.id}
                onClick={() => handleSelectTorrent(item)}
                whileTap={{ scale: 0.99 }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl nexus-card !p-3 !rounded-xl hover:border-primary/30 hover:bg-card/50 cursor-pointer transition-all"
                
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <DownloadCloud className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-tight">{item.title}</p>
                  <p className="text-sm text-muted-foreground leading-tight mt-0.5 font-mono">{item.size}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                  <span className="text-xs font-bold text-emerald-400 uppercase">OK</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* DESKTOP: original card grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredTorrents.map((item) => {
              return (
                <motion.div
                  key={item.id}
                  onClick={() => handleSelectTorrent(item)}
                  whileTap={{ scale: 0.97 }}
                  className="group cursor-pointer nexus-card cursor-pointer group flex flex-col justify-between min-h-[120px] flex flex-col justify-between min-h-[120px] h-auto relative overflow-hidden transition-all duration-300 hover:border-primary/30 hover:bg-card/30 hover:shadow-[0_0_20px_rgba(143,227,25,0.04)]"
                >
                  {/* Linha superior */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-extrabold text-white group-hover:text-primary transition-colors truncate max-w-[150px]">
                          {item.title}
                        </h3>
                        {item.user?.username && (
                          <span className={`user-tag user-tag-${item.user.username} shrink-0`}>
                            {item.user.username === "caio" ? "Caio" : "Giselle"}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className="text-[10px] text-muted-foreground font-mono bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-md font-semibold">
                          {item.size}
                        </span>
                      </div>
                    </div>
                    {/* Status Dot */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono tracking-wider">
                        OK
                      </span>
                    </div>
                  </div>

                  {/* Info do Arquivo */}
                  <div className="text-[11px] text-muted-foreground flex justify-between items-center mt-4 pt-2 border-t border-border/20">
                    <span className="font-semibold text-white/40">Clique para gerenciar</span>
                    <span className="font-mono text-primary font-bold text-[10px]">
                      PC Link
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-card/15 border border-dashed border-border rounded-sm">
          <DownloadCloud className="w-10 h-10 text-muted-foreground mb-3 animate-bounce" />
          <h3 className="text-sm font-semibold text-white">Nenhum torrent catalogado</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Adicione e visualize links magnéticos de seus softwares, ISOs ou mídias.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="frutiger-button rounded-xl shadow-[0_4px_15px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-transform">
  <div className="frutiger-inner px-6 py-2.5 rounded-xl flex items-center justify-center gap-2">
    <div className="frutiger-top-white"></div>
    <span className="frutiger-text flex items-center justify-center gap-2 font-bold drop-shadow-md text-sm">
      Adicionar Primeiro Torrent
    </span>
  </div>
</button>
        </div>
      )}
      </div>

      {/* MODAL DE DETALHES DO TORRENT SELECIONADO */}
      <AnimatePresence>
        {activeSelected && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedTorrentId(null); setDetailTorrent(null); }}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-card border border-border rounded-sm p-6 shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/80">
                <h2 className="text-sm font-bold text-white flex items-center gap-5">
                  <DownloadCloud className="w-5 h-5 text-primary" />
                  Detalhes do Torrent
                </h2>
                <button
                  onClick={() => { setSelectedTorrentId(null); setDetailTorrent(null); }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Informações detalhadas */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white">{activeSelected.title}</h3>
                  <div className="flex gap-5 items-center mt-1.5">
                    <span className="text-sm text-muted-foreground font-mono bg-muted/60 border border-border px-4 py-2 rounded font-semibold">
                      Tamanho: {activeSelected.size}
                    </span>
                    <span className="text-xs font-bold px-4 py-2 rounded uppercase flex items-center gap-4 bg-emerald/10 text-emerald">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald shadow-[0_0_8px_#10b981]" />
                      Disponível
                    </span>
                  </div>
                </div>

                {/* Anotações */}
                {(() => {
                  const { cleanNotes } = parseNotesAndFile(activeSelected.notes);
                  return cleanNotes ? (
                    <div className="p-3 bg-muted/20 border border-border/40 rounded-sm">
                      <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">Anotações</span>
                      <p className="text-xs text-white/85 leading-relaxed font-semibold">{cleanNotes}</p>
                    </div>
                  ) : null;
                })()}

                {/* Magnet Link */}
                {!activeSelected.magnet.includes("virtual-") && (
                  <div className="p-3 bg-muted/20 border border-border/40 rounded-sm space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase block">Link Magnético</span>
                    <div className="flex items-center justify-between gap-5.5">
                      <span className="text-sm text-white/80 font-mono truncate select-all flex-1">
                        {activeSelected.magnet}
                      </span>
                      <button
                        onClick={() => handleCopy(activeSelected.id, activeSelected.magnet)}
                        className="p-4 rounded-sm bg-card hover:bg-muted border border-border text-muted-foreground hover:text-white transition-colors cursor-pointer"
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
                    className="flex items-center gap-4 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive text-xs font-semibold rounded-sm transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                  </button>

                  <div className="flex gap-5">
                    {/* Botão Baixar arquivo .torrent (Se Houver) */}
                    {(() => {
                      const { fileUrl } = parseNotesAndFile(activeSelected.notes);
                      if (fileUrl) {
                        return (
                          <a
                            href={fileUrl}
                            download={`${activeSelected.title.replace(/\s+/g, "_")}.torrent`}
                            className="flex items-center gap-4 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-sm transition-colors cursor-pointer"
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
                            className="flex items-center gap-4 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-sm transition-colors cursor-pointer"
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
                        className="flex items-center gap-4 px-3.5 py-2 bg-primary/15 hover:bg-primary/25 border border-primary/20 text-primary text-xs font-bold rounded-sm transition-colors cursor-pointer"
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
              className="w-full max-w-md bg-card border border-border rounded-sm p-6 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/80">
                <h2 className="text-base font-bold text-white flex items-center gap-5">
                  <PlusCircle className="w-5 h-5 text-primary" />
                  Adicionar Torrent
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-4 rounded-sm hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-4">
                    Nome do Arquivo / Título *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: GTA V, Need for Speed, etc."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-sm text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                  />
                </div>

                {/* Seletores de abas do torrent (Upload vs Magnet) */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase">
                    Origem do Torrent *
                  </label>
                  <div className="flex bg-muted/30 border border-border p-1 rounded-sm">
                    <button
                      type="button"
                      onClick={() => setTorrentSourceType("file")}
                      className={`flex-1 py-1.5 rounded-sm text-xs font-bold flex items-center justify-center gap-4 transition-colors cursor-pointer ${
                        torrentSourceType === "file" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload .torrent
                    </button>
                    <button
                      type="button"
                      onClick={() => setTorrentSourceType("magnet")}
                      className={`flex-1 py-1.5 rounded-sm text-xs font-bold flex items-center justify-center gap-4 transition-colors cursor-pointer ${
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
                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-4">
                      Selecionar Arquivo .torrent
                    </label>
                    <input
                      type="file"
                      accept=".torrent"
                      required
                      onChange={(e) => setFormTorrentFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary file:cursor-pointer hover:file:bg-primary/20 cursor-pointer bg-muted/20 border border-border p-5.5 rounded-sm"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-4">
                      Link Magnet *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="magnet:?xt=urn:btih:..."
                      value={formMagnet}
                      onChange={(e) => setFormMagnet(e.target.value)}
                      className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-sm text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all font-mono"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-4">
                      Tamanho
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 65 GB"
                      value={formSize}
                      onChange={(e) => setFormSize(e.target.value)}
                      className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-sm text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-4">
                      Categoria
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Jogos, Cursos, ISOs"
                      className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-sm text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-4">
                    Anotações Extras
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Descrição sobre o conteúdo do torrent..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-sm text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-end gap-5.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 rounded-sm text-xs border border-border text-muted-foreground hover:text-white cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="frutiger-button rounded-xl shadow-[0_4px_15px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-transform">
  <div className="frutiger-inner px-6 py-2.5 rounded-xl flex items-center justify-center gap-2">
    <div className="frutiger-top-white"></div>
    <span className="frutiger-text flex items-center justify-center gap-2 font-bold drop-shadow-md text-sm">
      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Indexando...
                        </>
                      ) : (
                        "Indexar Torrent"
                      )}
    </span>
  </div>
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

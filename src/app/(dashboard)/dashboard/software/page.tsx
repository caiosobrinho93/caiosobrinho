"use client";

import React, { useEffect, useState } from "react";
import { useStatsStore } from "@/stores/statsStore";
import { useDataStore } from "@/stores/dataStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Plus,
  Search,
  Trash2,
  Download,
  ExternalLink,
  Loader2,
  PlusCircle,
  X,
  Smartphone,
  Laptop,
  Terminal,
  Grid,
  List,
  Upload,
  Link as LinkIcon
} from "lucide-react";

interface SoftwareItem {
  id: string;
  name: string;
  version: string;
  description: string | null;
  downloadUrl: string | null;
  platform: string;
  iconUrl: string | null;
  category: string | null;
  notes: string | null;
  user?: {
    username: string;
  };
}

export default function SoftwarePage() {
  const { data: softwareList, isLoading } = useDataStore(s => s.software);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSoftwareId, setSelectedSoftwareId] = useState<string | null>(null);
  const [detailSoftware, setDetailSoftware] = useState<SoftwareItem | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Estados do formulário
  const [formName, setFormName] = useState("");
  const [formVersion, setFormVersion] = useState("1.0.0");
  const [formDescription, setFormDescription] = useState("");
  const [installerUploadType, setInstallerUploadType] = useState<"file" | "url">("url");
  const [formInstallerFile, setFormInstallerFile] = useState<File | null>(null);
  const [formDownloadUrl, setFormDownloadUrl] = useState("");
  const [formPlatform, setFormPlatform] = useState("Windows, macOS");
  const [iconUploadType, setIconUploadType] = useState<"file" | "url">("url");
  const [formIconFile, setFormIconFile] = useState<File | null>(null);
  const [formIconUrl, setFormIconUrl] = useState("");
  const [formCategory, setFormCategory] = useState("Utilitários");
  const [formNotes, setFormNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    useDataStore.getState().fetchSoftware();
  }, []);

  const handleSelectSoftware = async (item: SoftwareItem) => {
    setSelectedSoftwareId(item.id);
    setDetailSoftware(item);
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/software/${item.id}`);
      if (res.ok) {
        const fullData = await res.json();
        setDetailSoftware(fullData);
      }
    } catch (err) {
      console.error("Error loading software details:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formVersion || !formPlatform) return;
    if (installerUploadType === "url" && !formDownloadUrl) return;
    if (installerUploadType === "file" && !formInstallerFile) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", formName);
      formData.append("version", formVersion);
      formData.append("description", formDescription);
      formData.append("platform", formPlatform);
      formData.append("category", formCategory);
      formData.append("notes", formNotes);

      if (installerUploadType === "file" && formInstallerFile) {
        formData.append("file", formInstallerFile);
      } else {
        formData.append("downloadUrl", formDownloadUrl);
      }

      if (iconUploadType === "file" && formIconFile) {
        formData.append("iconFile", formIconFile);
      } else if (formIconUrl) {
        formData.append("iconUrl", formIconUrl);
      }

      const res = await fetch("/api/software", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newSoftware = await res.json();
        setFormName("");
        setFormVersion("1.0.0");
        setFormDescription("");
        setFormDownloadUrl("");
        setFormPlatform("Windows, macOS");
        setFormIconUrl("");
        setFormCategory("Utilitários");
        setFormNotes("");
        setFormInstallerFile(null);
        setFormIconFile(null);
        setInstallerUploadType("url");
        setIconUploadType("url");
        setIsModalOpen(false);

        // Atualiza a store global localmente
        useStatsStore.getState().addSoftware();
        useDataStore.getState().addSoftware(newSoftware);
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao registrar software");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza de que deseja excluir este software do catálogo?")) return;

    try {
      const res = await fetch(`/api/software/${id}`, { method: "DELETE" });
      if (res.ok) {
        // Atualiza a store global localmente
        useStatsStore.getState().deleteSoftware();
        useDataStore.getState().deleteSoftware(id);
        setSelectedSoftwareId(null);
        setDetailSoftware(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSoftware = softwareList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory =
      activeCategory === "Todos" || s.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ["Todos", "Produtividade", "Desenvolvimento", "Design", "Utilitários", "Entretenimento", "Geral"];

  const getPlatformIcon = (platform: string) => {
    const lower = platform.toLowerCase();
    if (lower.includes("mac") || lower.includes("windows") || lower.includes("linux")) {
      return <Laptop className="w-3.5 h-3.5" />;
    }
    return <Smartphone className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Cabeçalho */}
      <div className="px-5 sm:px-0 py-5 flex flex-col items-start text-left border-b border-border/40 mb-6">
        <h1 className="font-display text-sm tracking-widest text-white leading-tight flex items-center gap-5">
          <Cpu className="w-5 h-5 text-primary" />
          SOFTWARES
        </h1>
        <p className="text-xs text-muted-foreground mt-1.5 font-medium uppercase tracking-wide">
          Instaladores, Licenças e Versões de Aplicativos
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
              Registrar App
    </span>
  </div>
</button>
        </div>
 
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none ">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors border ${
                activeCategory === cat
                  ? "bg-primary border-primary/20 text-black"
                  : "bg-card/25 border-border/80 text-muted-foreground hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
 
        <div className="flex items-center gap-5 shrink-0 ">
          <div className="relative w-full sm:w-56">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-muted-foreground pointer-events-none">
              <Search className="w-3 h-3 text-primary" />
            </span>
            <input
              type="text"
              placeholder="Buscar softwares..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-card/25 border border-border/80 rounded-sm text-white placeholder-muted-foreground/60 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>
 
          <div className="flex bg-muted/20 border border-border/70 p-0.5 rounded-sm shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded-sm cursor-pointer ${viewMode === "grid" ? "bg-card text-primary" : "text-muted-foreground hover:text-white"}`}
            >
              <Grid className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded-sm cursor-pointer ${viewMode === "list" ? "bg-card text-primary" : "text-muted-foreground hover:text-white"}`}
            >
              <List className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-card/60 border border-border/80 rounded-2xl" />
          ))}
        </div>
      ) : filteredSoftware.length > 0 ? (
        viewMode === "grid" ? (
          /* Visualização em Grade */
          <>
            {/* Desktop + Mobile grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5.5">
              {filteredSoftware.map((item) => (
                <motion.div
                  key={item.id}
                  onClick={() => handleSelectSoftware(item)}
                  whileTap={{ scale: 0.98 }}
                  className="nexus-card p-6 group cursor-pointer flex flex-col justify-between min-h-[110px] h-auto"
                >
                  {/* Decorative Glow */}
                  <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none bg-blue-500/40 group-hover:opacity-40 transition-opacity duration-500" />
                  <div className="absolute -left-20 -bottom-20 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none bg-blue-500/20 group-hover:opacity-30 transition-opacity duration-500" />
                  
                  <div className="flex gap-5.5 items-center relative z-10">
                    <div className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-inner bg-gradient-to-br from-card to-muted">
                      {item.iconUrl ? (
                        <img src={item.iconUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Cpu className="w-4 h-4 text-primary" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-baseline gap-4 min-w-0 flex-wrap ">
                          <h3 className="text-xs font-bold text-white truncate leading-tight group-hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                          <span className="text-xs font-mono text-primary font-bold shrink-0">
                            v{item.version}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          {item.user?.username && (
                            <span className={`user-tag user-tag-${item.user.username}`}>
                              {item.user.username === "caio" ? "Caio" : "Giselle"}
                            </span>
                          )}
                          <span className="text-[10px] px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-muted-foreground font-bold uppercase font-mono">
                            {item.category || "Geral"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex justify-between items-center mt-4 pt-2 border-t border-border/20 relative z-10">
                    <span className="font-semibold text-white/40">Clique para ver detalhes</span>
                    <span className="font-mono text-primary font-bold text-[10px]">HUD Info</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          /* Visualização em Lista */
          <>
            {/* Table (Responsive) */}
            <div className="bg-card/55 border border-border rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider bg-muted/20">
                    <th className="p-4">Nome do App</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4 text-right">Opções</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSoftware.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleSelectSoftware(item)}
                      className="border-b border-border/40 hover:bg-muted/30 group cursor-pointer"
                    >
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-7 h-7 rounded bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden">
                          {item.iconUrl ? (
                            <img src={item.iconUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Cpu className="w-4.5 h-4.5 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-baseline gap-4">
                            <span className="font-semibold text-white leading-tight group-hover:text-primary transition-colors">{item.name}</span>
                            <span className="text-xs font-mono text-primary font-semibold">v{item.version}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground font-semibold">{item.category}</td>
                      <td className="p-4 text-right font-mono text-primary font-bold text-[10px]">Acessar HUD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-card/15 border border-dashed border-border rounded-2xl">
          <Cpu className="w-10 h-10 text-muted-foreground mb-3" />
          <h3 className="text-sm font-semibold text-white">Catálogo de softwares vazio</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Comece registrando seus instaladores e licenças no catálogo.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="frutiger-button rounded-xl shadow-[0_4px_15px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-transform">
  <div className="frutiger-inner px-6 py-2.5 rounded-xl flex items-center justify-center gap-2">
    <div className="frutiger-top-white"></div>
    <span className="frutiger-text flex items-center justify-center gap-2 font-bold drop-shadow-md text-sm">
      Vincular Primeiro Software
    </span>
  </div>
</button>
        </div>
      )}
      </div>

      {/* MODAL REGISTRAR APP */}
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
                  Registrar Aplicativo
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-4 rounded-lg hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-1">
                    Nome do App *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Arc Browser"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-1">
                    Plataformas *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: macOS, Windows, Linux"
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value)}
                    className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                  />
                </div>

                {/* Botão de Opções Avançadas */}
                <div className="pt-1 pb-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-primary hover:underline font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
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
                      className="space-y-3.5 overflow-hidden pt-1.5 border-t border-border/30"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-1">
                            Versão *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: 1.25.0"
                            value={formVersion}
                            onChange={(e) => setFormVersion(e.target.value)}
                            className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-1">
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
                      </div>

                      {/* Seletores de abas do instalador (Upload vs URL) */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase">
                          Instalador do Software *
                        </label>
                        <div className="flex bg-muted/30 border border-border p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setInstallerUploadType("file")}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-4 transition-colors cursor-pointer ${
                              installerUploadType === "file" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                            }`}
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Upload Arquivo
                          </button>
                          <button
                            type="button"
                            onClick={() => setInstallerUploadType("url")}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-4 transition-colors cursor-pointer ${
                              installerUploadType === "url" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                            }`}
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            Colar Link URL
                          </button>
                        </div>
                      </div>

                      {installerUploadType === "file" ? (
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-4">
                            Selecionar Instalador (.exe, .dmg, .zip, etc.)
                          </label>
                          <input
                            type="file"
                            required
                            onChange={(e) => setFormInstallerFile(e.target.files?.[0] || null)}
                            className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary file:cursor-pointer hover:file:bg-primary/20 cursor-pointer bg-muted/20 border border-border p-5.5 rounded-xl"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-4">
                            URL de Download do Instalador
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="https://exemplo.com/instalador.exe"
                            value={formDownloadUrl}
                            onChange={(e) => setFormDownloadUrl(e.target.value)}
                            className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                          />
                        </div>
                      )}

                      {/* Seletores de abas do ícone (Upload vs URL) */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase">
                          Ícone do Aplicativo
                        </label>
                        <div className="flex bg-muted/30 border border-border p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setIconUploadType("file")}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-4 transition-colors cursor-pointer ${
                              iconUploadType === "file" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                            }`}
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Upload Ícone
                          </button>
                          <button
                            type="button"
                            onClick={() => setIconUploadType("url")}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-4 transition-colors cursor-pointer ${
                              iconUploadType === "url" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                            }`}
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            Colar Link URL
                          </button>
                        </div>
                      </div>

                      {iconUploadType === "file" ? (
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-4">
                            Selecionar Arquivo de Ícone
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFormIconFile(e.target.files?.[0] || null)}
                            className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary file:cursor-pointer hover:file:bg-primary/20 cursor-pointer bg-muted/20 border border-border p-5.5 rounded-xl"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-4">
                            URL da Imagem do Ícone
                          </label>
                          <input
                            type="text"
                            placeholder="https://exemplo.com/icone.png"
                            value={formIconUrl}
                            onChange={(e) => setFormIconUrl(e.target.value)}
                            className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-1">
                          Descrição
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Resumo sobre a utilidade do aplicativo..."
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-muted-foreground uppercase mb-1">
                          Notas da Plataforma (Chaves de licença, etc.)
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Licença gratuita pessoal"
                          value={formNotes}
                          onChange={(e) => setFormNotes(e.target.value)}
                          className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-2 border-t border-border flex items-center justify-end gap-5.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setShowAdvanced(false);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs border border-border text-muted-foreground hover:text-white cursor-pointer hover:bg-muted/40 transition-colors"
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
                          Salvando...
                        </>
                      ) : (
                        "Registrar App"
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

      {/* MODAL DETALHES DO SOFTWARE */}
      <AnimatePresence>
        {detailSoftware && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailSoftware(null)}
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
                  <Cpu className="w-5 h-5 text-primary" />
                  Detalhes do Aplicativo
                </h2>
                <button
                  onClick={() => setDetailSoftware(null)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isDetailLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary animate-pulse" />
                  <p className="text-xs text-muted-foreground">Carregando detalhes do banco de dados...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden">
                      {detailSoftware.iconUrl ? (
                        <img src={detailSoftware.iconUrl} alt={detailSoftware.name} className="w-full h-full object-cover" />
                      ) : (
                        <Cpu className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{detailSoftware.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Versão {detailSoftware.version}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Categoria</span>
                      <span className="text-white font-medium">{detailSoftware.category || "Geral"}</span>
                    </div>
                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Plataforma</span>
                      <span className="text-white font-medium">{detailSoftware.platform}</span>
                    </div>
                  </div>

                  {detailSoftware.description && (
                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl text-xs">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-1">Descrição</span>
                      <p className="text-white/80 leading-relaxed">{detailSoftware.description}</p>
                    </div>
                  )}

                  {detailSoftware.notes && (
                    <div className="p-3 bg-muted/20 border border-border/40 rounded-xl text-xs">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-1">Anotações</span>
                      <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{detailSoftware.notes}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        if (confirm("Deseja realmente excluir este software?")) {
                          handleDelete(detailSoftware.id);
                          setDetailSoftware(null);
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>

                    <div className="flex items-center gap-3">
                      {detailSoftware.downloadUrl && (
                        <a
                          href={detailSoftware.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dev-btn-download flex items-center justify-center"
                        >
                          <svg className="svgIcon" viewBox="0 0 384 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path>
                          </svg>
                          <span className="icon2"></span>
                          <span className="tooltip">Download</span>
                        </a>
                      )}
                      <button
                        onClick={() => setDetailSoftware(null)}
                        className="px-4 py-2 border border-border text-muted-foreground hover:text-white hover:bg-muted/40 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

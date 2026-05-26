"use client";

import React, { useEffect, useState } from "react";
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
}

export default function SoftwarePage() {
  const [softwareList, setSoftwareList] = useState<SoftwareItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados do formulário
  const [formName, setFormName] = useState("");
  const [formVersion, setFormVersion] = useState("");
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

  const fetchSoftware = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/software");
      if (res.ok) {
        const data = await res.json();
        setSoftwareList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSoftware();
  }, []);

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
        setFormName("");
        setFormVersion("");
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
        fetchSoftware();
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

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza de que deseja excluir este software do catálogo?")) return;

    try {
      const res = await fetch(`/api/software/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSoftwareList((prev) => prev.filter((s) => s.id !== id));
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
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h1 className="font-display text-sm tracking-widest text-white leading-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            SOFTWARES
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">
            Instaladores, Licenças e Versões de Aplicativos
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-bold btn-3d-pink cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Registrar App
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors border ${
                activeCategory === cat
                  ? "bg-primary border-primary/20 text-white"
                  : "bg-card/40 border-border/80 text-muted-foreground hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-full sm:w-56">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Buscar softwares..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-card/45 border border-border/80 rounded-lg text-white placeholder-muted-foreground/60 text-[10px] focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="flex bg-muted/40 border border-border/70 p-0.5 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded cursor-pointer ${viewMode === "grid" ? "bg-card text-primary" : "text-muted-foreground hover:text-white"}`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded cursor-pointer ${viewMode === "list" ? "bg-card text-primary" : "text-muted-foreground hover:text-white"}`}
            >
              <List className="w-3.5 h-3.5" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredSoftware.map((item) => (
              <motion.div
                key={item.id}
                layoutId={item.id}
                whileTap={{ scale: 0.98 }}
                className="card-cockpit flex flex-col justify-between hover:border-primary/40 transition-colors cursor-pointer group"
              >

                <div>
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted border border-border/80 flex items-center justify-center shrink-0 overflow-hidden shadow-inner bg-gradient-to-br from-card to-muted">
                      {item.iconUrl ? (
                        <img src={item.iconUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Cpu className="w-4.5 h-4.5 text-primary" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-baseline gap-1.5 min-w-0 flex-wrap">
                          <h3 className="text-xs font-bold text-white truncate leading-tight group-hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                          <span className="text-[9px] font-mono text-primary font-bold shrink-0">
                            v{item.version}
                          </span>
                        </div>

                        <span className="text-[9px] px-1.5 py-0.5 bg-muted rounded border border-border/80 text-muted-foreground font-bold uppercase shrink-0">
                          {item.category || "Geral"}
                        </span>
                      </div>

                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-tight font-medium">
                        {item.description || "Nenhuma descrição fornecida."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1 flex-wrap border-t border-border/40 pt-2.5">
                    {item.platform.split(",").map((plat) => (
                      <span
                        key={plat}
                        className="text-[8px] bg-muted/60 text-white border border-border/80 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold uppercase"
                      >
                        {getPlatformIcon(plat)}
                        {plat.trim()}
                      </span>
                    ))}
                    {item.notes && (
                      <p className="text-[9px] text-muted-foreground/70 leading-none truncate max-w-full italic mt-1 sm:mt-0 sm:ml-auto font-medium">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border/40 mt-3 pt-2.5 select-none">
                  {item.downloadUrl && (
                    <a
                      href={item.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold btn-3d-cyan flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Baixar App
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive btn-3d-gray cursor-pointer flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Visualização em Lista */
          <div className="bg-card/55 border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold uppercase tracking-wider bg-muted/20">
                  <th className="p-4">Nome do App</th>
                  <th className="p-4">Plataformas</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSoftware.map((item) => (
                  <tr key={item.id} className="border-b border-border/40 hover:bg-muted/30 group">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden">
                        {item.iconUrl ? (
                          <img src={item.iconUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Cpu className="w-4.5 h-4.5 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-white leading-tight group-hover:text-primary transition-colors">{item.name}</span>
                          <span className="text-[9px] font-mono text-primary font-semibold">v{item.version}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 block truncate max-w-72 font-medium">{item.description}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white font-semibold">{item.platform}</td>
                    <td className="p-4 text-muted-foreground font-semibold">{item.category}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {item.downloadUrl && (
                          <a
                            href={item.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl border border-border/80 hover:bg-primary/10 hover:text-primary hover:border-primary/20 text-white cursor-pointer"
                            title="Link de Download"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            className="mt-4 px-3.5 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 transition-all cursor-pointer"
          >
            Vincular Primeiro Software
          </button>
        </div>
      )}

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
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-primary" />
                  Registrar Aplicativo
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
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
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
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

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
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
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Instalador do Software *
                  </label>
                  <div className="flex bg-muted/30 border border-border p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setInstallerUploadType("file")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        installerUploadType === "file" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Arquivo
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstallerUploadType("url")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
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
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                      Selecionar Instalador (.exe, .dmg, .zip, etc.)
                    </label>
                    <input
                      type="file"
                      required
                      onChange={(e) => setFormInstallerFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary file:cursor-pointer hover:file:bg-primary/20 cursor-pointer bg-muted/20 border border-border p-2.5 rounded-xl"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
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
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase">
                    Ícone do Aplicativo
                  </label>
                  <div className="flex bg-muted/30 border border-border p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setIconUploadType("file")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        iconUploadType === "file" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Ícone
                    </button>
                    <button
                      type="button"
                      onClick={() => setIconUploadType("url")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
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
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                      Selecionar Arquivo de Ícone
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormIconFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary file:cursor-pointer hover:file:bg-primary/20 cursor-pointer bg-muted/20 border border-border p-2.5 rounded-xl"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
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
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
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
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
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
                      "Registrar App"
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

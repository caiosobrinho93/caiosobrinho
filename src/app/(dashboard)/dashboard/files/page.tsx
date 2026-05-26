"use client";

import React, { useEffect, useState, useRef, Fragment } from "react";
import { useStatsStore } from "@/stores/statsStore";
import { useDataStore } from "@/stores/dataStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Plus,
  Search,
  Trash2,
  FolderPlus,
  Upload,
  Grid,
  List,
  ChevronRight,
  File,
  FileText,
  FileImage,
  FileArchive,
  Star,
  X,
  Loader2,
  Folder,
  Download,
  Eye,
  ArrowLeft
} from "lucide-react";

interface FolderItem {
  id: string;
  name: string;
  parentFolderId: string | null;
  user?: {
    username: string;
  };
}

interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  isFavorite: boolean;
  folderId: string | null;
  user?: {
    username: string;
  };
}

export default function FilesPage() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFolderId, setActiveFolderId] = useState<string>("root");
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Estados de arrastar e soltar
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);
  
  // Estados de modais e pré-visualizações
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDirectory = async (force = false) => {
    try {
      setIsLoading(true);
      const result = await useDataStore.getState().fetchFiles(activeFolderId, search, force);
      setFolders(result.folders);
      setFiles(result.files);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [activeFolderId, search]);

  const handleFolderClick = (folder: FolderItem) => {
    setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setActiveFolderId(folder.id);
  };

  const handleBreadcrumbClick = (id: string, index: number) => {
    if (id === "root") {
      setFolderPath([]);
      setActiveFolderId("root");
    } else {
      setFolderPath((prev) => prev.slice(0, index + 1));
      setActiveFolderId(id);
    }
  };

  const handleBackClick = () => {
    if (folderPath.length === 0) return;
    if (folderPath.length === 1) {
      setFolderPath([]);
      setActiveFolderId("root");
    } else {
      const parent = folderPath[folderPath.length - 2];
      setFolderPath((prev) => prev.slice(0, -1));
      setActiveFolderId(parent.id);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName) return;

    setIsCreatingFolder(true);
    try {
      const formData = new FormData();
      formData.append("action", "mkdir");
      formData.append("name", newFolderName);
      if (activeFolderId !== "root") {
        formData.append("folderId", activeFolderId);
      }

      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newFolder = await res.json();
        setNewFolderName("");
        setIsNewFolderOpen(false);
        // Update cache and local state
        useDataStore.getState().addFolder(activeFolderId, newFolder);
        setFolders(prev => [newFolder, ...prev]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    await uploadFile(selectedFile);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("action", "upload");
      formData.append("file", file);
      if (activeFolderId !== "root") {
        formData.append("folderId", activeFolderId);
      }

      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newFile = await res.json();
        
        // Atualiza no cache, na state local e na store global
        useDataStore.getState().addFile(activeFolderId, newFile);
        setFiles(prev => [newFile, ...prev]);
        useStatsStore.getState().addFile(newFile, newFile.user?.username || "caio");
      } else {
        const err = await res.json();
        alert(err.error || "Falha no envio do arquivo");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  // Handlers de arrastar e soltar
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      await uploadFile(droppedFile);
    }
  };

  const handleToggleFavorite = async (file: FileItem) => {
    try {
      const res = await fetch(`/api/files/${file.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !file.isFavorite }),
      });
      if (res.ok) {
        const nextFav = !file.isFavorite;
        useDataStore.getState().toggleFileFavorite(activeFolderId, file.id, nextFav);
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, isFavorite: nextFav } : f))
        );

        // Atualiza a store global localmente
        useStatsStore.getState().toggleFileFavorite(file.id, nextFav, file.name, file.user?.username || "caio");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteItem = async (id: string, type: "file" | "folder") => {
    if (!confirm(`Deseja excluir este ${type === "folder" ? "diretório" : "arquivo"}? Todo o conteúdo armazenado será removido permanentemente.`)) return;

    try {
      const res = await fetch(`/api/files/${id}?type=${type}`, { method: "DELETE" });
      if (res.ok) {
        if (type === "folder") {
          useDataStore.getState().deleteFolder(activeFolderId, id);
          setFolders((prev) => prev.filter((f) => f.id !== id));
        } else {
          const oldFile = files.find((f) => f.id === id);
          if (oldFile) {
            useDataStore.getState().deleteFile(activeFolderId, id);
            // Atualiza a store global localmente
            useStatsStore.getState().deleteFile(id, oldFile.size, oldFile.mimeType);
          }
          setFiles((prev) => prev.filter((f) => f.id !== id));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith("image/")) return <FileImage className="w-5.5 h-5.5 text-cyan" />;
    if (mime.includes("pdf")) return <FileText className="w-5.5 h-5.5 text-rose" />;
    if (mime.includes("zip") || mime.includes("tar") || mime.includes("rar")) return <FileArchive className="w-5.5 h-5.5 text-amber" />;
    return <File className="w-5.5 h-5.5 text-muted-foreground" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="space-y-6 min-h-[80vh] relative"
    >
      {/* Overlay de arrastar e soltar */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-3xl z-40 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none"
          >
            <Upload className="w-14 h-14 text-primary animate-bounce mb-3" />
            <h2 className="text-lg font-bold text-white">Solte para Enviar</h2>
            <p className="text-xs text-muted-foreground mt-1">Solte o arquivo para importá-lo neste diretório do cofre.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div>
          <h1 className="font-display text-xs tracking-widest text-white leading-tight flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            COFRE DE ARQUIVOS
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">
            Armazenamento de Backups, Logs e Mídias Pessoais
          </p>
        </div>
        
        {/* Controle de ações */}
        <div className="flex gap-2 shrink-0 ">
          <button
            onClick={() => setIsNewFolderOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-bold glass-btn cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            Novo Diretório
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-sm text-[10px] font-bold glass-btn glass-btn-primary cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Subir Arquivo
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadFile}
            className="hidden"
          />
        </div>
      </div>
 
      {/* Barra de Ferramentas / Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Breadcrumbs de Navegação */}
        <div className="flex items-center gap-1.5 text-[10px]  font-bold text-muted-foreground overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => handleBreadcrumbClick("root", -1)}
            className="hover:text-primary transition-colors cursor-pointer uppercase"
          >
            Raiz
          </button>
          {folderPath.map((path, idx) => (
            <Fragment key={path.id}>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <button
                onClick={() => handleBreadcrumbClick(path.id, idx)}
                className="hover:text-primary transition-colors cursor-pointer max-w-28 truncate uppercase"
              >
                {path.name}
              </button>
            </Fragment>
          ))}
        </div>
 
        <div className="flex items-center gap-2 shrink-0 ">
          <div className="relative w-full sm:w-56 ">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-muted-foreground pointer-events-none">
              <Search className="w-3 h-3 text-primary" />
            </span>
            <input
              type="text"
              placeholder="Buscar arquivos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-card/25 border border-border/80 rounded-sm text-white placeholder-muted-foreground/60 text-[9px] focus:outline-none focus:border-primary transition-all"
            />
          </div>
 
          <div className="flex bg-muted/20 border border-border/70 p-0.5 rounded-sm shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded-sm cursor-pointer ${viewMode === "grid" ? "bg-card text-primary" : "text-muted-foreground hover:text-white"}`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded-sm cursor-pointer ${viewMode === "list" ? "bg-card text-primary" : "text-muted-foreground hover:text-white"}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      {/* Exibição Principal do Layout */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-card/40 border border-border/80 rounded-sm" />
          ))}
        </div>
      ) : folders.length > 0 || files.length > 0 ? (
        viewMode === "grid" ? (
          /* Visualização em Grade */
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {/* Pastas */}
            {folders.map((folder) => (
              <motion.div
                key={folder.id}
                layoutId={folder.id}
                onClick={() => handleFolderClick(folder)}
                className="glass-panel flex flex-col justify-between cursor-pointer group rounded-sm p-3 border border-border/75 hover:border-primary/45 transition-colors relative"
              >
                <div className="flex justify-between items-start ">
                  <Folder className="w-8 h-8 text-primary fill-primary/5 group-hover:scale-105 transition-transform duration-300" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(folder.id, "folder");
                    }}
                    className="p-1 rounded-sm opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer text-muted-foreground"
                    title="Excluir Pasta"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-white/95 truncate block leading-tight">
                    {folder.name}
                  </span>
                  {folder.user?.username && (
                    <div className="mt-1">
                      <span className={`user-tag user-tag-${folder.user.username}`}>
                        {folder.user.username === "caio" ? "Caio" : "Giselle"}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
 
            {/* Arquivos */}
            {files.map((file) => (
              <motion.div
                key={file.id}
                layoutId={file.id}
                onClick={() => setPreviewItem(file)}
                className="glass-panel flex flex-col justify-between cursor-pointer group rounded-sm p-3 border border-border/75 hover:border-primary/45 transition-colors relative"
              >
                <div className="flex justify-between items-start ">
                  {getFileIcon(file.mimeType)}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(file);
                      }}
                      className={`p-1 rounded-sm cursor-pointer hover:bg-muted ${
                        file.isFavorite ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <Star className={`w-3 h-3 ${file.isFavorite ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(file.id, "file");
                      }}
                      className="p-1 rounded-sm hover:text-destructive hover:bg-destructive/10 cursor-pointer text-muted-foreground"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
 
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-white/95 truncate block leading-tight">
                    {file.name}
                  </span>
                  <div className="flex items-center justify-between gap-1 mt-1">
                    <span className="text-[8px] text-muted-foreground block leading-none">
                      {formatSize(file.size)}
                    </span>
                    {file.user?.username && (
                      <span className={`user-tag user-tag-${file.user.username}`}>
                        {file.user.username === "caio" ? "Caio" : "Giselle"}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Visualização em Lista */
          <div className="bg-card/55 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground font-semibold uppercase tracking-wider bg-muted/20">
                  <th className="p-4">Nome</th>
                  <th className="p-4 hidden sm:table-cell">Tipo</th>
                  <th className="p-4">Tamanho</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {/* Pastas */}
                {folders.map((folder) => (
                  <tr
                    key={folder.id}
                    onClick={() => handleFolderClick(folder)}
                    className="border-b border-border/40 hover:bg-muted/30 cursor-pointer group"
                  >
                    <td className="p-4 flex items-center gap-3 font-semibold text-white">
                      <Folder className="w-4.5 h-4.5 text-primary fill-primary/5 shrink-0" />
                      <span className="truncate max-w-64">{folder.name}</span>
                      {folder.user?.username && (
                        <span className={`user-tag user-tag-${folder.user.username}`}>
                          {folder.user.username === "caio" ? "Caio" : "Giselle"}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell">Pasta</td>
                    <td className="p-4 text-muted-foreground font-mono">--</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(folder.id, "folder");
                        }}
                        className="p-1.5 rounded hover:text-destructive hover:bg-destructive/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer inline-block"
                        title="Excluir Pasta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Arquivos */}
                {files.map((file) => (
                  <tr
                    key={file.id}
                    onClick={() => setPreviewItem(file)}
                    className="border-b border-border/40 hover:bg-muted/30 cursor-pointer group"
                  >
                    <td className="p-4 font-semibold text-white">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="shrink-0">{getFileIcon(file.mimeType)}</div>
                        <span className="truncate max-w-64">{file.name}</span>
                        {file.user?.username && (
                          <span className={`user-tag user-tag-${file.user.username}`}>
                            {file.user.username === "caio" ? "Caio" : "Giselle"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell truncate max-w-40">
                      {file.mimeType}
                    </td>
                    <td className="p-4 text-muted-foreground font-mono">
                      {formatSize(file.size)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(file);
                          }}
                          className={`p-1.5 rounded cursor-pointer ${
                            file.isFavorite ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${file.isFavorite ? "fill-current" : ""}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(file.id, "file");
                          }}
                          className="p-1.5 rounded hover:text-destructive hover:bg-destructive/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
        /* Estado Vazio */
        <div className="py-24 flex flex-col items-center justify-center text-center bg-card/15 border border-dashed border-border rounded-2xl">
          <FolderOpen className="w-10 h-10 text-muted-foreground mb-3" />
          <h3 className="text-sm font-semibold text-white">Diretório Vazio</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Comece a organizar itens enviando arquivos ou criando subpastas.
          </p>
        </div>
      )}

      {/* MODAL CRIAR PASTA */}
      <AnimatePresence>
        {isNewFolderOpen && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewFolderOpen(false)}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-card border border-border rounded-2xl p-5 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/80">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderPlus className="w-4.5 h-4.5 text-primary" />
                  Criar Pasta
                </h2>
                <button
                  onClick={() => setIsNewFolderOpen(false)}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">
                    Nome da Pasta
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Documentos"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all"
                  />
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-end gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsNewFolderOpen(false)}
                    className="px-3.5 py-2 rounded-xl border border-border text-muted-foreground hover:text-white cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingFolder}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-primary/10"
                  >
                    {isCreatingFolder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Criar Diretório
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX DE PRÉ-VISUALIZAÇÃO DE ARQUIVO */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewItem(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-3xl bg-card border border-border rounded-2xl flex flex-col relative z-10 overflow-hidden shadow-2xl max-h-[85vh]"
            >
              {/* Header */}
              <div className="h-14 border-b border-border bg-muted/20 flex items-center justify-between px-5 shrink-0 z-20">
                <div className="flex items-center gap-3 min-w-0">
                  {getFileIcon(previewItem.mimeType)}
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-white truncate block max-w-md">
                      {previewItem.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-none mt-0.5 block font-mono">
                      {previewItem.mimeType} &bull; {formatSize(previewItem.size)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={previewItem.path}
                    download={previewItem.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-muted/60 hover:bg-muted border border-border/80 text-white cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar Arquivo
                  </a>
                  <button
                    onClick={() => setPreviewItem(null)}
                    className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Moldura de Visualização */}
              <div className="flex-1 w-full bg-black/80 flex items-center justify-center overflow-auto p-4 min-h-[300px]">
                {previewItem.mimeType.startsWith("image/") ? (
                  <img
                    src={previewItem.path}
                    alt={previewItem.name}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg border border-border/40"
                  />
                ) : previewItem.mimeType.includes("pdf") ? (
                  <iframe
                    src={previewItem.path}
                    className="w-full h-[60vh] border-0 rounded-lg shadow-md"
                  />
                ) : (
                  /* Pré-visualização Genérica */
                  <div className="text-center py-12 flex flex-col items-center">
                    <File className="w-14 h-14 text-muted-foreground mb-4" />
                    <p className="text-sm font-semibold text-white">Pré-visualização indisponível para este formato</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      Este formato de arquivo não pode ser renderizado diretamente no painel.
                    </p>
                    <a
                      href={previewItem.path}
                      download={previewItem.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 transition-all shadow-md cursor-pointer"
                    >
                      Baixar para Visualizar
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

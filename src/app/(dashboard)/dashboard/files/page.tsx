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
  ChevronDown,
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
  ArrowLeft,
  Calendar,
  User,
  HardDrive
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
  createdAt: string;
  user?: {
    username: string;
  };
}

export default function FilesPage() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [allFolders, setAllFolders] = useState<FolderItem[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFolderId, setActiveFolderId] = useState<string>("root");
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Estados de arrastar e soltar
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);
  
  // Seleção no estilo Windows Explorer
  const [selectedItem, setSelectedItem] = useState<FileItem | FolderItem | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<"file" | "folder" | null>(null);
  
  // Pastas expandidas no painel esquerdo
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true
  });

  // Estados de modais e pré-visualizações
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useStatsStore((s) => s.data);

  // Detectar resolução de tela para comportamento de toque
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Buscar diretório atual
  const fetchDirectory = async (force = false) => {
    try {
      setIsLoading(true);
      const result = await useDataStore.getState().fetchFiles(activeFolderId, search, force);
      // Garantir compatibilidade de tipos no createdAt (Next.js pode serializar de formas variadas)
      const mappedFiles = (result.files || []).map((file: any) => ({
        ...file,
        createdAt: file.createdAt || new Date().toISOString(),
      }));
      setFolders(result.folders || []);
      setFiles(mappedFiles);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar todas as pastas do sistema para construir a árvore lateral
  const fetchAllFolders = async () => {
    try {
      const res = await fetch("/api/files?allFolders=true");
      if (res.ok) {
        const data = await res.json();
        setAllFolders(data.folders || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [activeFolderId, search]);

  useEffect(() => {
    useStatsStore.getState().fetchStats();
    fetchAllFolders();
  }, []);

  // Resolver breadcrumbs a partir de allFolders de forma reativa
  useEffect(() => {
    if (activeFolderId === "root") {
      setFolderPath([]);
    } else {
      const path: { id: string; name: string }[] = [];
      let currentId: string | null = activeFolderId;
      while (currentId && currentId !== "root") {
        const folder = allFolders.find((f) => f.id === currentId);
        if (folder) {
          path.unshift({ id: folder.id, name: folder.name });
          currentId = folder.parentFolderId;
        } else {
          break;
        }
      }
      setFolderPath(path);
    }
  }, [activeFolderId, allFolders]);

  const handleFolderClick = (folder: FolderItem) => {
    setActiveFolderId(folder.id);
    setSelectedItem(null);
    setSelectedItemType(null);
  };

  const handleBreadcrumbClick = (id: string, index: number) => {
    if (id === "root") {
      setActiveFolderId("root");
    } else {
      setActiveFolderId(id);
    }
    setSelectedItem(null);
    setSelectedItemType(null);
  };

  const handleBackClick = () => {
    if (folderPath.length === 0) return;
    if (folderPath.length === 1) {
      setActiveFolderId("root");
    } else {
      const parent = folderPath[folderPath.length - 2];
      setActiveFolderId(parent.id);
    }
    setSelectedItem(null);
    setSelectedItemType(null);
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
        // Atualiza cache e estado local
        useDataStore.getState().addFolder(activeFolderId, newFolder);
        setFolders((prev) => [newFolder, ...prev]);
        
        // Recarregar árvore
        await fetchAllFolders();
        // Expandir a pasta pai atual
        setExpandedFolders(prev => ({ ...prev, [activeFolderId]: true }));
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
        const mappedFile = {
          ...newFile,
          createdAt: newFile.createdAt || new Date().toISOString(),
        };
        
        // Atualiza no cache, no state local e na store global
        useDataStore.getState().addFile(activeFolderId, mappedFile);
        setFiles((prev) => [mappedFile, ...prev]);
        useStatsStore.getState().addFile(mappedFile, mappedFile.user?.username || "caio");
        
        // Selecionar o arquivo enviado automaticamente
        setSelectedItem(mappedFile);
        setSelectedItemType("file");
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

        // Atualizar se for o item selecionado
        if (selectedItem && selectedItemType === "file" && selectedItem.id === file.id) {
          setSelectedItem((prev) => prev ? { ...prev, isFavorite: nextFav } as FileItem : null);
        }
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
        // Limpar seleção se for o item excluído
        if (selectedItem?.id === id) {
          setSelectedItem(null);
          setSelectedItemType(null);
        }

        if (type === "folder") {
          useDataStore.getState().deleteFolder(activeFolderId, id);
          setFolders((prev) => prev.filter((f) => f.id !== id));
          if (activeFolderId === id) {
            setActiveFolderId("root");
          }
          await fetchAllFolders();
        } else {
          const oldFile = files.find((f) => f.id === id);
          if (oldFile) {
            useDataStore.getState().deleteFile(activeFolderId, id);
            useStatsStore.getState().deleteFile(id, oldFile.size, oldFile.mimeType);
          }
          setFiles((prev) => prev.filter((f) => f.id !== id));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getFileIcon = (mime: string, className = "w-5.5 h-5.5") => {
    if (mime.startsWith("image/")) return <FileImage className={`${className} text-cyan-400`} />;
    if (mime.includes("pdf")) return <FileText className={`${className} text-rose-400`} />;
    if (mime.includes("zip") || mime.includes("tar") || mime.includes("rar")) return <FileArchive className={`${className} text-amber-400`} />;
    return <File className={`${className} text-muted-foreground`} />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Toggle expansão de nós na árvore lateral
  const toggleExpandFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // Construir mapa de relação pai-filho das pastas
  const buildFolderMap = () => {
    const map: Record<string, FolderItem[]> = {};
    allFolders.forEach((f) => {
      const parentId = f.parentFolderId || "root";
      if (!map[parentId]) map[parentId] = [];
      map[parentId].push(f);
    });
    return map;
  };

  const folderMap = buildFolderMap();

  // Renderizar nó individual da árvore de diretórios
  const renderFolderTreeNode = (folder: FolderItem, level: number) => {
    const hasChildren = folderMap[folder.id] && folderMap[folder.id].length > 0;
    const isExpanded = !!expandedFolders[folder.id];
    const isActive = activeFolderId === folder.id;
    const isSelected = selectedItem?.id === folder.id && selectedItemType === "folder";

    return (
      <div key={folder.id} className="flex flex-col">
        <div
          onClick={() => {
            setActiveFolderId(folder.id);
            setSelectedItem(folder);
            setSelectedItemType("folder");
          }}
          className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer text-xs transition-all duration-200 group ${
            isActive
              ? "bg-primary/20 text-primary font-bold border-l-2 border-primary"
              : isSelected
              ? "bg-muted/40 text-white"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          <button
            onClick={(e) => toggleExpandFolder(folder.id, e)}
            className={`p-0.5 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-all shrink-0 ${
              hasChildren ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
          <Folder
            className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-105 ${
              isActive ? "text-primary fill-primary/10" : "text-amber-500 fill-amber-500/10"
            }`}
          />
          <span className="truncate flex-1 font-medium">{folder.name}</span>
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-col mt-0.5">
            {folderMap[folder.id].map((child) => renderFolderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Renderizar a árvore completa
  const renderFolderTree = () => {
    const rootFolders = folderMap["root"] || [];
    const isRootActive = activeFolderId === "root";
    const isRootExpanded = !!expandedFolders["root"];

    return (
      <div className="flex flex-col space-y-1">
        <div className="flex flex-col">
          <div
            onClick={() => {
              setActiveFolderId("root");
              setSelectedItem(null);
              setSelectedItemType(null);
            }}
            className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer text-xs transition-all duration-200 group ${
              isRootActive
                ? "bg-primary/20 text-primary font-bold border-l-2 border-primary"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            }`}
            style={{ paddingLeft: "8px" }}
          >
            <button
              onClick={(e) => toggleExpandFolder("root", e)}
              className="p-0.5 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-all shrink-0"
            >
              {isRootExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
            <FolderOpen className={`w-4 h-4 shrink-0 ${isRootActive ? "text-primary" : "text-primary/70"}`} />
            <span className="truncate flex-1 font-semibold uppercase tracking-wider text-[10px]">Cofre de Arquivos</span>
          </div>

          {isRootExpanded && rootFolders.length > 0 && (
            <div className="flex flex-col mt-0.5">
              {rootFolders.map((child) => renderFolderTreeNode(child, 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Clique em espaço vazio no painel central desmarca a seleção
  const handleWorkspaceClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedItem(null);
      setSelectedItemType(null);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="space-y-4 min-h-[85vh] relative flex flex-col text-left"
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
      <div className="flex flex-col items-start px-1">
        <h1 className="font-display text-xs tracking-widest text-white leading-tight flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          COFRE DE ARQUIVOS
        </h1>
        <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-wide">
          Armazenamento de Backups, Logs e Mídias Pessoais
        </p>
      </div>

      {/* Janela de 3 Painéis do Explorer */}
      <div className="flex-1 min-h-[580px] grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_280px] border border-border/40 rounded-2xl overflow-hidden bg-card/10 backdrop-blur-xl shadow-2xl">
        
        {/* COLUNA ESQUERDA - Árvore de Diretórios (Hidden on mobile) */}
        <aside className="hidden md:flex flex-col border-r border-border/40 bg-black/10 p-3 overflow-y-auto shrink-0 select-none">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-primary" />
            Árvore de Pastas
          </div>
          <div className="flex-1">
            {renderFolderTree()}
          </div>
        </aside>

        {/* COLUNA CENTRAL - Gerenciador de Arquivos principal */}
        <main 
          onClick={handleWorkspaceClick}
          className="flex flex-col flex-1 min-w-0 bg-transparent"
        >
          {/* Barra de Ferramentas / Breadcrumbs e Ações */}
          <div className="p-3 border-b border-border/30 bg-black/5 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              {/* Navegação & Breadcrumbs */}
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground overflow-x-auto scrollbar-none py-1">
                <button
                  disabled={folderPath.length === 0}
                  onClick={handleBackClick}
                  className="p-1.5 rounded-lg border border-border/60 hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:hover:border-border/60 disabled:hover:text-muted-foreground cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                
                <button
                  onClick={() => handleBreadcrumbClick("root", -1)}
                  className={`hover:text-primary transition-colors cursor-pointer uppercase text-[10px] tracking-wider font-mono ${activeFolderId === "root" ? "text-primary" : ""}`}
                >
                  Raiz
                </button>
                
                {folderPath.map((path, idx) => (
                  <Fragment key={path.id}>
                    <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground/40" />
                    <button
                      onClick={() => handleBreadcrumbClick(path.id, idx)}
                      className={`hover:text-primary transition-colors cursor-pointer max-w-28 truncate uppercase text-[10px] tracking-wider font-mono ${activeFolderId === path.id ? "text-primary" : ""}`}
                    >
                      {path.name}
                    </button>
                  </Fragment>
                ))}
              </div>

              {/* Ações Criar / Subir */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsNewFolderOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold glass-btn cursor-pointer transition-all hover:border-primary/40 active:scale-[0.98]"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">Nova Pasta</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold glass-btn glass-btn-primary cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Enviar</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadFile}
                  className="hidden"
                />
              </div>
            </div>

            {/* Busca & Modos de Visualização */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-muted-foreground pointer-events-none">
                  <Search className="w-3.5 h-3.5 text-primary" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar no diretório..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-card/30 border border-border/50 rounded-xl text-white placeholder-muted-foreground/60 text-xs focus:outline-none focus:border-primary transition-all font-mono"
                />
              </div>

              <div className="flex bg-muted/20 border border-border/55 p-0.5 rounded-xl shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg cursor-pointer transition-all ${viewMode === "grid" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-white"}`}
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg cursor-pointer transition-all ${viewMode === "list" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-white"}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Área de Arquivos Principal */}
          <div className="flex-1 p-4 overflow-y-auto min-h-[400px]">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 animate-pulse">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-24 bg-card/20 border border-border/40 rounded-xl" />
                ))}
              </div>
            ) : folders.length > 0 || files.length > 0 ? (
              viewMode === "grid" ? (
                /* GRID VIEW */
                <div 
                  onClick={handleWorkspaceClick}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
                >
                  {/* Pastas */}
                  {folders.map((folder) => {
                    const isSelected = selectedItem?.id === folder.id && selectedItemType === "folder";
                    return (
                      <motion.div
                        key={folder.id}
                        layoutId={folder.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(folder);
                          setSelectedItemType("folder");
                          if (isMobile) {
                            handleFolderClick(folder);
                          }
                        }}
                        onDoubleClick={() => handleFolderClick(folder)}
                        className={`flex flex-col justify-between cursor-pointer group rounded-xl p-3 border transition-all relative select-none ${
                          isSelected
                            ? "bg-primary/20 border-primary/60 shadow-lg shadow-primary/5"
                            : "bg-card/20 border-border/50 hover:border-primary/30 hover:bg-card/45"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <Folder className="w-9 h-9 text-amber-500 fill-amber-500/10 group-hover:scale-105 transition-transform duration-300" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(folder.id, "folder");
                            }}
                            className="p-1 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer text-muted-foreground bg-card/60 md:bg-transparent border border-border/60 md:border-transparent"
                            title="Excluir Pasta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="mt-3 text-left">
                          <span className="text-xs font-bold text-white truncate block leading-tight">
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
                    );
                  })}

                  {/* Arquivos */}
                  {files.map((file) => {
                    const isSelected = selectedItem?.id === file.id && selectedItemType === "file";
                    return (
                      <motion.div
                        key={file.id}
                        layoutId={file.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(file);
                          setSelectedItemType("file");
                          if (isMobile) {
                            setPreviewItem(file);
                          }
                        }}
                        onDoubleClick={() => setPreviewItem(file)}
                        className={`flex flex-col justify-between cursor-pointer group rounded-xl p-3 border transition-all relative select-none ${
                          isSelected
                            ? "bg-primary/20 border-primary/60 shadow-lg shadow-primary/5"
                            : "bg-card/20 border-border/50 hover:border-primary/30 hover:bg-card/45"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          {getFileIcon(file.mimeType, "w-9 h-9")}
                          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(file);
                              }}
                              className={`p-1 rounded-lg cursor-pointer hover:bg-white/10 bg-card/60 md:bg-transparent border border-border/60 md:border-transparent ${
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
                              className="p-1 rounded-lg hover:text-destructive hover:bg-destructive/10 cursor-pointer text-muted-foreground bg-card/60 md:bg-transparent border border-border/60 md:border-transparent"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 text-left">
                          <span className="text-xs font-bold text-white truncate block leading-tight">
                            {file.name}
                          </span>
                          <div className="flex items-center justify-between gap-1.5 mt-1">
                            <span className="text-[10px] text-muted-foreground font-mono block leading-none">
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
                    );
                  })}
                </div>
              ) : (
                /* LIST VIEW */
                <div className="bg-card/30 backdrop-blur-xl border border-border/40 rounded-xl overflow-x-auto shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 text-muted-foreground font-semibold uppercase tracking-wider bg-black/10 select-none">
                        <th className="p-3">Nome</th>
                        <th className="p-3 hidden sm:table-cell">Tipo</th>
                        <th className="p-3">Tamanho</th>
                        <th className="p-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Pastas */}
                      {folders.map((folder) => {
                        const isSelected = selectedItem?.id === folder.id && selectedItemType === "folder";
                        return (
                          <tr
                            key={folder.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(folder);
                              setSelectedItemType("folder");
                              if (isMobile) {
                                handleFolderClick(folder);
                              }
                            }}
                            onDoubleClick={() => handleFolderClick(folder)}
                            className={`border-b border-border/30 cursor-pointer group transition-colors ${
                              isSelected ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-white/5"
                            }`}
                          >
                            <td className="p-3 flex items-center gap-2.5 font-bold text-white">
                              <Folder className="w-4.5 h-4.5 text-amber-500 fill-amber-500/5 shrink-0" />
                              <span className="truncate max-w-[120px] xs:max-w-[160px] sm:max-w-64">{folder.name}</span>
                              {folder.user?.username && (
                                <span className={`user-tag user-tag-${folder.user.username}`}>
                                  {folder.user.username === "caio" ? "Caio" : "Giselle"}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-muted-foreground hidden sm:table-cell">Pasta</td>
                            <td className="p-3 text-muted-foreground font-mono">--</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(folder.id, "folder");
                                }}
                                className="p-1.5 rounded hover:text-destructive hover:bg-destructive/10 text-muted-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer inline-block"
                                title="Excluir Pasta"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Arquivos */}
                      {files.map((file) => {
                        const isSelected = selectedItem?.id === file.id && selectedItemType === "file";
                        return (
                          <tr
                            key={file.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(file);
                              setSelectedItemType("file");
                              if (isMobile) {
                                setPreviewItem(file);
                              }
                            }}
                            onDoubleClick={() => setPreviewItem(file)}
                            className={`border-b border-border/30 cursor-pointer group transition-colors ${
                              isSelected ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-white/5"
                            }`}
                          >
                            <td className="p-3 font-bold text-white">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="shrink-0">{getFileIcon(file.mimeType, "w-4.5 h-4.5")}</div>
                                <span className="truncate max-w-[120px] xs:max-w-[160px] sm:max-w-64">{file.name}</span>
                                {file.user?.username && (
                                  <span className={`user-tag user-tag-${file.user.username}`}>
                                    {file.user.username === "caio" ? "Caio" : "Giselle"}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-muted-foreground hidden sm:table-cell truncate max-w-40 font-mono text-[10px]">
                              {file.mimeType}
                            </td>
                            <td className="p-3 text-muted-foreground font-mono">
                              {formatSize(file.size)}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavorite(file);
                                  }}
                                  className={`p-1.5 rounded cursor-pointer ${
                                    file.isFavorite ? "text-primary" : "text-muted-foreground hover:text-white"
                                  }`}
                                >
                                  <Star className={`w-3.5 h-3.5 ${file.isFavorite ? "fill-current" : ""}`} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(file.id, "file");
                                  }}
                                  className="p-1.5 rounded hover:text-destructive hover:bg-destructive/10 text-muted-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* ESTADO VAZIO */
              <div 
                onClick={handleWorkspaceClick}
                className="h-full py-24 flex flex-col items-center justify-center text-center bg-card/5 border border-dashed border-border/40 rounded-2xl select-none"
              >
                <FolderOpen className="w-10 h-10 text-muted-foreground/60 mb-3" />
                <h3 className="text-sm font-bold text-white">Diretório Vazio</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Faça upload de arquivos ou crie pastas para organizar este cofre.
                </p>
              </div>
            )}
          </div>
        </main>

        {/* COLUNA DIREITA - Painel de Detalhes (Hidden on mobile) */}
        <aside className="hidden lg:flex flex-col border-l border-border/40 bg-black/10 p-4 overflow-y-auto shrink-0 select-none">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-border/20 pb-2">
            <Eye className="w-3.5 h-3.5 text-primary" />
            Painel de Detalhes
          </div>

          {selectedItem && selectedItemType === "file" ? (() => {
            const fileItem = selectedItem as FileItem;
            return (
              /* DETALHES DE ARQUIVO */
              <div className="flex flex-col space-y-4 text-left">
                {/* Mini-preview */}
                <div className="w-full h-32 rounded-xl bg-black/30 border border-border/30 flex items-center justify-center overflow-hidden relative">
                  {fileItem.mimeType.startsWith("image/") ? (
                    <img
                      src={fileItem.path}
                      alt={fileItem.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getFileIcon(fileItem.mimeType, "w-12 h-12")
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="bg-black/80 backdrop-blur-md text-[9px] font-mono px-2 py-0.5 rounded border border-border/30 text-muted-foreground">
                      {formatSize(fileItem.size)}
                    </span>
                  </div>
                </div>

                {/* Metadados */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Nome do arquivo</label>
                    <p className="text-xs font-bold text-white truncate" title={fileItem.name}>
                      {fileItem.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Tipo</label>
                      <p className="text-[10px] font-mono text-muted-foreground truncate" title={fileItem.mimeType}>
                        {fileItem.mimeType.split("/")[1] || "Arquivo"}
                      </p>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Autor</label>
                      <div className="mt-0.5">
                        {fileItem.user?.username ? (
                          <span className={`user-tag user-tag-${fileItem.user.username} text-[9px] px-1.5 py-0.5`}>
                            {fileItem.user.username === "caio" ? "Caio" : "Giselle"}
                          </span>
                        ) : (
                          <p className="text-xs font-medium text-muted-foreground">Desconhecido</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-primary" />
                      Data de Criação
                    </label>
                    <p className="text-xs font-medium text-muted-foreground">
                      {new Date(fileItem.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>

                {/* Ações rápidas no rodapé */}
                <div className="pt-4 border-t border-border/20 flex flex-col gap-2">
                  <a
                    href={fileItem.path}
                    download={fileItem.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/10"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar Arquivo
                  </a>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleFavorite(fileItem)}
                      className={`flex-1 py-2 px-3 rounded-xl border border-border/40 hover:bg-white/5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        fileItem.isFavorite ? "text-primary border-primary/30 bg-primary/5" : "text-muted-foreground"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${fileItem.isFavorite ? "fill-current" : ""}`} />
                      Favorito
                    </button>
                    <button
                      onClick={() => handleDeleteItem(fileItem.id, "file")}
                      className="py-2 px-3 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-bold transition-all flex items-center justify-center cursor-pointer shrink-0"
                      title="Excluir permanentemente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setPreviewItem(fileItem)}
                    className="w-full py-1.5 px-3 rounded-xl border border-border/30 hover:border-white/20 text-muted-foreground hover:text-white text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white/2 shrink-0"
                  >
                    <Eye className="w-3 h-3" />
                    Visualizar em Tela Cheia
                  </button>
                </div>
              </div>
            );
          })() : selectedItem && selectedItemType === "folder" ? (() => {
            const folderItem = selectedItem as FolderItem;
            return (
              /* DETALHES DE PASTA */
              <div className="flex flex-col space-y-4 text-left">
                <div className="w-full h-32 rounded-xl bg-black/30 border border-border/30 flex items-center justify-center relative">
                  <Folder className="w-16 h-16 text-amber-500 fill-amber-500/10" />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Nome da Pasta</label>
                    <p className="text-xs font-bold text-white truncate" title={folderItem.name}>
                      {folderItem.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Tipo</label>
                      <p className="text-xs font-medium text-muted-foreground">Diretório</p>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Criado por</label>
                      <div className="mt-0.5">
                        {folderItem.user?.username ? (
                          <span className={`user-tag user-tag-${folderItem.user.username} text-[9px] px-1.5 py-0.5`}>
                            {folderItem.user.username === "caio" ? "Caio" : "Giselle"}
                          </span>
                        ) : (
                          <p className="text-xs font-medium text-muted-foreground">Desconhecido</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/20 flex flex-col gap-2">
                  <button
                    onClick={() => handleFolderClick(folderItem)}
                    className="w-full py-2.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/10 hover:bg-primary/95"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    Abrir Diretório
                  </button>
                  <button
                    onClick={() => handleDeleteItem(folderItem.id, "folder")}
                    className="w-full py-2 px-3 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir Pasta
                  </button>
                </div>
              </div>
            );
          })() : (
            /* DETALHES PADRÃO - ESTATÍSTICAS DE ARMAZENAMENTO */
            <div className="flex flex-col space-y-4 text-left">
              <div className="p-3 bg-card/25 border border-border/30 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Estatísticas do Disco</span>
                </div>
                
                {stats?.storageStats ? (
                  <div className="space-y-3">
                    {/* Barra de Progresso */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                        <span>{stats.storageStats.percentUsed}% Usado</span>
                        <span>{stats.storageStats.usedSize} / {stats.storageStats.totalSize}</span>
                      </div>
                      <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-border/25">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary transition-all duration-500" 
                          style={{ width: `${stats.storageStats.percentUsed}%` }}
                        />
                      </div>
                    </div>

                    {/* Breakdown por categorias */}
                    <div className="pt-2 border-t border-border/20 space-y-2 text-[10px]">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          Imagens
                        </span>
                        <span className="font-mono text-white">{stats.storageStats.imagesSize || "0 B"}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          Documentos
                        </span>
                        <span className="font-mono text-white">{stats.storageStats.docsSize || "0 B"}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          Mídias / Outros
                        </span>
                        <span className="font-mono text-white">{stats.storageStats.othersSize || "0 B"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                )}
              </div>

              <div className="p-3 border border-dashed border-border/30 rounded-xl text-center py-6">
                <File className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground leading-normal max-w-[180px] mx-auto">
                  Selecione um arquivo ou diretório para ver informações detalhadas e ações rápidas.
                </p>
              </div>
            </div>
          )}
        </aside>

      </div>

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
              className="w-full max-w-sm bg-card border border-border/80 rounded-2xl p-5 shadow-2xl relative z-10 overflow-hidden text-left"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/40">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderPlus className="w-4.5 h-4.5 text-primary" />
                  Criar Pasta
                </h2>
                <button
                  onClick={() => setIsNewFolderOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
                    Nome da Pasta
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Documentos"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all font-sans"
                  />
                </div>

                <div className="pt-2 border-t border-border/30 flex items-center justify-end gap-3 text-xs font-semibold">
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
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-primary/10"
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
              className="w-full max-w-3xl bg-card border border-border rounded-2xl flex flex-col relative z-10 overflow-hidden shadow-2xl max-h-[85vh] text-left"
            >
              {/* Header */}
              <div className="h-auto min-h-[4rem] border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 shrink-0 z-20 gap-4">
                <div className="flex items-center gap-3 min-w-0 w-full">
                  <div className="shrink-0">{getFileIcon(previewItem.mimeType)}</div>
                  <div className="min-w-0 pr-2">
                    <span className="text-sm font-semibold text-white truncate block">
                      {previewItem.name}
                    </span>
                    <span className="text-xs text-muted-foreground leading-relaxed mt-1 block font-mono break-words">
                      {previewItem.mimeType} &bull; {formatSize(previewItem.size)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-5 w-full sm:w-auto">
                  <a
                    href={previewItem.path}
                    download={previewItem.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none py-3 px-4 sm:p-3 sm:px-6 rounded-xl bg-primary hover:bg-primary/90 text-black cursor-pointer flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold transition-colors shadow-lg shadow-primary/10"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    Baixar Arquivo
                  </a>
                  <button
                    onClick={() => setPreviewItem(null)}
                    className="p-3 sm:p-3.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-white cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Moldura de Visualização */}
              <div className="flex-1 w-full bg-black/80 flex items-center justify-center overflow-auto p-6 sm:p-8 min-h-[300px]">
                {previewItem.mimeType.startsWith("image/") ? (
                  <img
                    src={previewItem.path}
                    alt={previewItem.name}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg border border-border/40"
                  />
                ) : previewItem.mimeType.includes("pdf") ? (
                  <iframe
                    src={previewItem.path}
                    className="w-full h-[60vh] border-0 rounded-lg shadow-md bg-white"
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
                      className="mt-5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/95 transition-all shadow-md cursor-pointer"
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

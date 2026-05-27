"use client";

import React, { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useStatsStore } from "@/stores/statsStore";
import { useDataStore } from "@/stores/dataStore";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Star,
  Trash2,
  BookOpen,
  Edit3,
  Eye,
  Check,
  Loader2,
  Tag,
  Folder,
  ArrowLeft,
  ChevronRight,
  Lock,
  Fingerprint,
  Expand,
  Minimize,
  Bold,
  Italic,
  List,
  ListOrdered,
  Code
} from "lucide-react";

interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string | null;
  isFavorite: boolean;
  updatedAt: string;
  user?: {
    username: string;
  };
}

// Helper simples de debouncer
function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

function NotesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: notes, isLoading } = useDataStore(s => s.notes);
  const [search, setSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  // Estados do Editor
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");
  
  // Status de salvamento automático
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    if (isFocusMode) {
      document.body.classList.add("focus-mode-active");
    } else {
      document.body.classList.remove("focus-mode-active");
    }
    return () => {
      document.body.classList.remove("focus-mode-active");
    };
  }, [isFocusMode]);
  
  // Responsividade no mobile
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);

  // Estados e Refs para Notas Seguras
  const [revealedNoteIds, setRevealedNoteIds] = useState<string[]>([]);
  const [isPressing, setIsPressing] = useState(false);
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset do estado de pressionamento ao trocar de nota
  useEffect(() => {
    setIsPressing(false);
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
  }, [selectedNote]);

  const isPrivateNote = (note: NoteItem | null) => {
    if (!note) return false;
    const checkString = (str?: string | null) => {
      if (!str) return false;
      const lower = str.toLowerCase();
      return (
        lower.includes("#privado") ||
        lower.includes("#secret") ||
        lower.includes("#seguro") ||
        lower.includes("[privado]")
      );
    };
    return (
      checkString(note.title) ||
      checkString(note.content) ||
      checkString(note.tags) ||
      checkString(note.category)
    );
  };

  const handlePressStart = () => {
    if (!selectedNote) return;
    setIsPressing(true);
    pressTimeoutRef.current = setTimeout(() => {
      setIsPressing(false);
      setRevealedNoteIds(prev => [...prev, selectedNote.id]);
    }, 800);
  };

  const handlePressEnd = () => {
    setIsPressing(false);
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
  };

  useEffect(() => {
    const alreadyLoaded = useDataStore.getState().notes.hasLoaded;
    useDataStore.getState().fetchNotes().then(() => {
      if (!alreadyLoaded && !selectedNote) {
        const data = useDataStore.getState().notes.data;
        if (data.length > 0) loadNote(data[0]);
      }
    });
  }, []);

  // Manipular gatilhos de URL (?new=true)
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      handleCreateNote();
      router.replace("/dashboard/notes");
    }
  }, [searchParams]);

  const loadNote = (note: NoteItem) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategory(note.category || "Geral");
    setEditTags(note.tags || "");
    setSaveStatus("saved");
    setShowSidebarOnMobile(false); // Esconde a lista de notas no celular ao selecionar uma nota
  };

  // Gravar edições via PATCH
  const saveNoteData = async (
    id: string,
    updates: { title?: string; content?: string; category?: string; tags?: string }
  ) => {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setSaveStatus("saved");
        useDataStore.getState().updateNote(id, { ...updates, updatedAt: new Date().toISOString() });
        // Keep selectedNote in sync
        setSelectedNote(prev => prev?.id === id ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : prev);
      } else {
        setSaveStatus("unsaved");
      }
    } catch (e) {
      console.error(e);
      setSaveStatus("unsaved");
    }
  };

  const debouncedSave = useDebounce(saveNoteData, 1000);

  // Mudança nos campos do editor
  const handleFieldChange = (
    field: "title" | "content" | "category" | "tags",
    value: string
  ) => {
    if (!selectedNote) return;

    if (field === "title") setEditTitle(value);
    if (field === "content") setEditContent(value);
    if (field === "category") setEditCategory(value);
    if (field === "tags") setEditTags(value);

    setSaveStatus("unsaved");
    debouncedSave(selectedNote.id, { [field]: value });
  };

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("note-editor-textarea") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editContent;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end, text.length);
    const newText = before + prefix + selected + suffix + after;
    handleFieldChange("content", newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleCreateNote = async () => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Nova Nota de Rascunho",
          content: "",
          category: "Geral",
          tags: "",
        }),
      });

      if (res.ok) {
        const newNote = await res.json();
        useDataStore.getState().addNote(newNote);
        loadNote(newNote);
        
        // Atualiza a store global localmente
        useStatsStore.getState().addNote(newNote, newNote.user?.username || "caio");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta nota permanentemente?")) return;

    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        useDataStore.getState().deleteNote(id);
        if (selectedNote?.id === id) {
          setSelectedNote(null);
          setShowSidebarOnMobile(true);
        }
        
        // Atualiza a store global localmente
        useStatsStore.getState().deleteNote(id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFavorite = async (note: NoteItem) => {
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !note.isFavorite }),
      });
      if (res.ok) {
        const nextFav = !note.isFavorite;
        useDataStore.getState().toggleNoteFavorite(note.id, nextFav);
        setSelectedNote((prev) => (prev?.id === note.id ? { ...prev, isFavorite: nextFav } : prev));
        
        // Atualiza a store global localmente
        useStatsStore.getState().toggleNoteFavorite(note.id, nextFav, note.title, note.user?.username || "caio");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderMarkdown = (md: string) => {
    if (!md) return `<p class="text-muted-foreground/60 italic text-xs">Comece a digitar o conteúdo em Markdown...</p>`;

    let html = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Títulos
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-white mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-white mt-5 mb-2.5 border-b border-border/50 pb-1">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-black text-white mt-6 mb-3">$1</h1>');

    // Negrito, itálico e códigos
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
    html = html.replace(/`(.*)`/gim, '<code class="bg-muted px-4 py-2 rounded text-xs font-mono">$1</code>');

    // Listas
    html = html.replace(/^\s*-\s*(.*$)/gim, '<li class="ml-4 list-disc text-muted-foreground font-medium">$1</li>');
    html = html.replace(/^\s*\*\s*(.*$)/gim, '<li class="ml-4 list-disc text-muted-foreground font-medium">$1</li>');

    // Parágrafos
    html = html.split('\n\n').map(p => {
      if (p.trim().startsWith('<h') || p.trim().startsWith('<li') || p.trim().startsWith('<ul')) return p;
      return `<p class="my-2 text-muted-foreground leading-relaxed text-sm font-medium">${p.replace(/\n/g, '<br/>')}</p>`;
    }).join('\n');

    return html;
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    (n.category && n.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className={`flex border bg-black md:bg-card/45 backdrop-blur-xl overflow-hidden shadow-sm ${isFocusMode ? "fixed inset-0 z-[100] w-screen h-screen rounded-none border-none" : "h-[calc(100vh-140px)] border-border rounded-sm"}`}>
      
      {/* PAINEL LATERAL: Listagem de notas */}
      <div className={`w-full md:w-80 border-r border-border flex flex-col h-full bg-card/30 shrink-0 ${isFocusMode ? "hidden" : showSidebarOnMobile ? "flex" : "hidden md:flex"}`}>
        <div className="p-4 border-b border-border flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs tracking-widest text-white leading-tight flex items-center gap-4">
              <FileText className="w-4 h-4 text-primary" />
              Editor de Notas
            </span>
            <button
              onClick={handleCreateNote}
              className="p-4 rounded-sm glass-btn glass-btn-primary text-black cursor-pointer"
              title="Nova Nota"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Buscar título ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-muted/40 border border-border rounded-sm text-white placeholder-muted-foreground text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-1">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/20 animate-pulse rounded-sm border border-border/40" />
            ))
          ) : filteredNotes.length > 0 ? (
            filteredNotes.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => loadNote(note)}
                  className={`p-3.5 rounded-sm cursor-pointer select-none transition-colors border group ${
                    isSelected
                      ? "bg-primary/10 border-primary/20 text-white"
                      : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-white"
                  }`}
                >
                  <div className="flex justify-between items-baseline gap-5">
                    <span className={`text-xs font-semibold truncate block ${isSelected ? "text-white" : "text-white/80 group-hover:text-primary transition-colors"}`}>
                      {note.title || "Rascunho sem Título"}
                    </span>
                    {note.isFavorite && (
                      <Star className="w-3 h-3 text-primary fill-current shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 text-sm leading-none">
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-2 bg-muted rounded text-muted-foreground font-semibold">
                        {note.category || "Geral"}
                      </span>
                      {note.user?.username && (
                        <span className={`user-tag user-tag-${note.user.username}`}>
                          {note.user.username === "caio" ? "Caio" : "Giselle"}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground/60 font-mono">
                      {new Date(note.updatedAt).toLocaleDateString("pt-BR", {month: "short", day: "numeric"})}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground/60 text-center py-8">Nenhuma nota encontrada.</p>
          )}
        </div>
      </div>

      {/* ÁREA DO EDITOR */}
      <div className={`flex-1 flex flex-col h-full bg-card/10 overflow-hidden ${!showSidebarOnMobile ? "flex" : "hidden md:flex"}`}>
        {selectedNote ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Cabeçalho do Editor — ROW 1: Nav + Write/Preview toggle */}
            <div className="h-11 border-b border-border px-3 flex items-center gap-2 shrink-0 bg-muted/10">
              {!isFocusMode && (
                <button
                  type="button"
                  onClick={() => setShowSidebarOnMobile(true)}
                  className="md:hidden p-1.5 rounded-sm border border-border text-muted-foreground hover:text-white shrink-0"
                  title="Voltar para lista"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}
              {/* Write/Preview toggle */}
              <div className="flex bg-muted/40 border border-border p-0.5 rounded-sm shrink-0">
                <button
                  onClick={() => setActiveTab("write")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    activeTab === "write" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    activeTab === "preview" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Prévia</span>
                </button>
              </div>

              {/* Save status — compact, no text label on mobile */}
              <span className="flex items-center gap-1.5 bg-muted/40 border border-border/80 px-2 py-1 rounded-sm shrink-0 ml-auto">
                {saveStatus === "saving" ? (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                ) : saveStatus === "saved" ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {saveStatus === "saving" ? "Salvando..." : saveStatus === "saved" ? "Salvo" : "Não salvo"}
                </span>
              </span>
            </div>

            {/* Cabeçalho do Editor — ROW 2: Action buttons */}
            <div className="h-10 border-b border-border/60 px-3 flex items-center gap-1.5 shrink-0 bg-muted/5">
              <button
                onClick={() => handleToggleFavorite(selectedNote)}
                className={`p-1.5 rounded-sm border cursor-pointer transition-colors ${
                  selectedNote.isFavorite
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-white hover:bg-muted"
                }`}
                title="Favoritar"
              >
                <Star className={`w-3.5 h-3.5 ${selectedNote.isFavorite ? "fill-current" : ""}`} />
              </button>
              
              <button
                type="button"
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`p-1.5 rounded-sm border cursor-pointer transition-colors ${
                  isFocusMode
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-white hover:bg-muted"
                }`}
                title={isFocusMode ? "Sair do Modo Foco" : "Modo Foco"}
              >
                {isFocusMode ? <Minimize className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => handleDelete(selectedNote.id)}
                className="p-1.5 rounded-sm border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 cursor-pointer transition-colors ml-auto"
                title="Deletar nota"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Wrapper para Título, Categoria e Conteúdo para podermos aplicar o Overlay sobre ambos */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Título e Categoria */}
              <div className="p-4 border-b border-border/60 bg-muted/5 flex flex-col sm:flex-row gap-3 shrink-0">
                <input
                  type="text"
                  placeholder="Título da Nota"
                  value={editTitle}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="flex-1 bg-transparent border-0 font-bold text-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-0 p-0 leading-tight"
                />
                
                <div className="flex gap-5 shrink-0 items-center">
                  <span className="text-sm text-muted-foreground font-bold uppercase tracking-wider hidden sm:inline">Categoria:</span>
                  <input
                    type="text"
                    placeholder="Geral"
                    value={editCategory}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                    className="px-3.5 py-1.5 bg-muted/40 border border-border focus:border-primary rounded-sm text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all font-medium max-w-32"
                  />
                </div>
              </div>

              {/* Conteúdo do Editor / Visualizador */}
              <div className="flex-1 flex flex-col min-h-0 relative">
                {activeTab === "write" ? (
                  <>
                    {/* Formatting Toolbar */}
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-border/60 bg-muted/10 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0">
                      <button onClick={() => insertFormatting("**", "**")} className="p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-[#8fe319] transition-colors focus:text-[#8fe319]">
                        <Bold className="w-4 h-4" />
                      </button>
                      <button onClick={() => insertFormatting("*", "*")} className="p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-[#8fe319] transition-colors focus:text-[#8fe319]">
                        <Italic className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-border mx-1 shrink-0" />
                      <button onClick={() => insertFormatting("- ")} className="p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-[#8fe319] transition-colors focus:text-[#8fe319]">
                        <List className="w-4 h-4" />
                      </button>
                      <button onClick={() => insertFormatting("1. ")} className="p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-[#8fe319] transition-colors focus:text-[#8fe319]">
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-border mx-1 shrink-0" />
                      <button onClick={() => insertFormatting("`", "`")} className="p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-[#8fe319] transition-colors focus:text-[#8fe319]">
                        <Code className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5">
                      <textarea
                        id="note-editor-textarea"
                        value={editContent}
                        onChange={(e) => handleFieldChange("content", e.target.value)}
                        placeholder="# Título&#10;&#10;Escreva as anotações do cofre usando formatação Markdown..."
                        className="w-full h-full min-h-[200px] bg-transparent border-0 resize-none text-white/90 placeholder-muted-foreground/60 text-sm focus:outline-none focus:ring-0 p-0 leading-relaxed font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 overflow-y-auto p-5">
                    <div
                      className="prose prose-invert max-w-none text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(editContent) }}
                    />
                  </div>
                )}
              </div>

              {/* Overlay de Segurança Cyberpunk */}
              {isPrivateNote(selectedNote) && !revealedNoteIds.includes(selectedNote.id) && (
                <div className="absolute inset-0 z-30 backdrop-blur-2xl bg-black/95 flex flex-col items-center justify-center p-6 text-center select-none scanlines">
                  <div className="max-w-md w-full flex flex-col items-center gap-6">
                    {/* Anel de Recarga Animado */}
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 -m-3 scale-110">
                        <svg className="w-24 h-24 -rotate-90 mx-auto">
                          <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                          <motion.circle
                            cx="48" cy="48" r="40" fill="none"
                            stroke="hsl(var(--primary))" strokeWidth="3"
                            strokeDasharray={2 * Math.PI * 40}
                            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                            animate={{ strokeDashoffset: isPressing ? 0 : 2 * Math.PI * 40 }}
                            transition={{ duration: isPressing ? 0.8 : 0.2, ease: isPressing ? "linear" : "easeOut" }}
                            strokeLinecap="round"
                            style={{ filter: 'drop-shadow(0 0 6px hsl(var(--primary)))' }}
                          />
                        </svg>
                      </div>
                      
                      <motion.div 
                        animate={isPressing ? { scale: [1, 1.08, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary relative z-10"
                      >
                        <Fingerprint className="w-8 h-8 neon-pulse" />
                      </motion.div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-black text-white tracking-widest uppercase flex items-center justify-center gap-4 font-display">
                        <Lock className="w-3.5 h-3.5 text-primary" />
                        Acesso Criptografado
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed font-medium">
                        Esta nota foi classificada como privada. Pressione e segure o sensor ou use o desbloqueio rápido.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
                      <button
                        onMouseDown={handlePressStart}
                        onMouseUp={handlePressEnd}
                        onMouseLeave={handlePressEnd}
                        onTouchStart={(e) => { e.preventDefault(); handlePressStart(); }}
                        onTouchEnd={handlePressEnd}
                        className={`w-full py-3 rounded-sm font-bold text-xs uppercase tracking-wider transition-all border cursor-pointer select-none active:scale-[0.98] font-display ${
                          isPressing 
                            ? "bg-primary border-primary text-black shadow-[0_0_15px_rgba(197,254,0,0.4)]" 
                            : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                        }`}
                      >
                        {isPressing ? "Acessando..." : "Segure para Revelar"}
                      </button>

                      <button
                        onClick={() => setRevealedNoteIds(prev => [...prev, selectedNote.id])}
                        className="py-1 text-xs text-muted-foreground hover:text-white uppercase tracking-wider font-bold transition-colors cursor-pointer"
                      >
                        Desbloqueio Rápido (Clique)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <BookOpen className="w-12 h-12 text-muted-foreground mb-3" />
            <h3 className="text-sm font-semibold text-white">Nenhuma nota selecionada</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Selecione uma nota existente na barra lateral ou crie uma nova nota.
            </p>
            <button
              onClick={handleCreateNote}
              className="mt-4 px-3.5 py-2 bg-primary text-white rounded-sm text-xs font-semibold hover:bg-primary/95 transition-all cursor-pointer"
            >
              Criar Primeira Nota
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm">Carregando notas...</div>}>
      <NotesContent />
    </Suspense>
  );
}

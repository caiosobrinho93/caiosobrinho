"use client";

import React, { useEffect, useState, useRef, useCallback, Suspense } from "react";
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
  ChevronRight
} from "lucide-react";

interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string | null;
  isFavorite: boolean;
  updatedAt: string;
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
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isLoading, setIsLoading] = useState(true);

  // Estados do Editor
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");
  
  // Status de salvamento automático
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  const fetchNotes = async (selectFirst = false) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
        if (selectFirst && data.length > 0 && !selectedNote) {
          loadNote(data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(true);
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
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))
        );
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
        setNotes((prev) => [newNote, ...prev]);
        loadNote(newNote);
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
        setNotes((prev) => prev.filter((n) => n.id !== id));
        if (selectedNote?.id === id) {
          setSelectedNote(null);
        }
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
        setNotes((prev) =>
          prev.map((n) => (n.id === note.id ? { ...n, isFavorite: nextFav } : n))
        );
        setSelectedNote((prev) => (prev?.id === note.id ? { ...prev, isFavorite: nextFav } : prev));
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
    html = html.replace(/`(.*)`/gim, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');

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
    <div className="flex h-[calc(100vh-140px)] border border-border bg-card/45 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
      
      {/* PAINEL LATERAL: Listagem de notas */}
      <div className="w-80 border-r border-border flex flex-col h-full bg-card/30 shrink-0">
        <div className="p-4 border-b border-border flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" />
              Editor de Notas
            </span>
            <button
              onClick={handleCreateNote}
              className="p-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white cursor-pointer"
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
              className="w-full pl-9 pr-3 py-1.5 bg-muted/40 border border-border rounded-lg text-white placeholder-muted-foreground text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/20 animate-pulse rounded-lg border border-border/40" />
            ))
          ) : filteredNotes.length > 0 ? (
            filteredNotes.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => loadNote(note)}
                  className={`p-3.5 rounded-xl cursor-pointer select-none transition-colors border group ${
                    isSelected
                      ? "bg-primary/10 border-primary/20 text-white"
                      : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-white"
                  }`}
                >
                  <div className="flex justify-between items-baseline gap-2">
                    <span className={`text-xs font-semibold truncate block ${isSelected ? "text-white" : "text-white/80 group-hover:text-primary transition-colors"}`}>
                      {note.title || "Rascunho sem Título"}
                    </span>
                    {note.isFavorite && (
                      <Star className="w-3 h-3 text-primary fill-current shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 text-[10px] leading-none">
                    <span className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-semibold">
                      {note.category || "Geral"}
                    </span>
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
      <div className="flex-1 flex flex-col h-full bg-card/10 overflow-hidden">
        {selectedNote ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Cabeçalho do Editor */}
            <div className="h-14 border-b border-border px-5 flex items-center justify-between shrink-0 bg-muted/10">
              {/* Write/Preview toggle tab */}
              <div className="flex bg-muted/40 border border-border p-0.5 rounded-lg shrink-0">
                <button
                  onClick={() => setActiveTab("write")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    activeTab === "write" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    activeTab === "preview" ? "bg-card text-white shadow-sm" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Visualizar
                </button>
              </div>

              {/* Status e Ações */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 bg-muted/40 border border-border/80 px-2.5 py-1 rounded-lg">
                  {saveStatus === "saving" ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      Salvando...
                    </>
                  ) : saveStatus === "saved" ? (
                    <>
                      <Check className="w-3 h-3 text-emerald" />
                      Salvo
                    </>
                  ) : (
                    "Alterações não salvas"
                  )}
                </span>

                <button
                  onClick={() => handleToggleFavorite(selectedNote)}
                  className={`p-2 rounded-xl border cursor-pointer hover:bg-muted transition-colors ${
                    selectedNote.isFavorite
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-white"
                  }`}
                >
                  <Star className={`w-4.5 h-4.5 ${selectedNote.isFavorite ? "fill-current" : ""}`} />
                </button>
                
                <button
                  onClick={() => handleDelete(selectedNote.id)}
                  className="p-2 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Título e Categoria */}
            <div className="p-4 border-b border-border/60 bg-muted/5 flex flex-col sm:flex-row gap-3 shrink-0">
              <input
                type="text"
                placeholder="Título da Nota"
                value={editTitle}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                className="flex-1 bg-transparent border-0 font-bold text-lg text-white placeholder-muted-foreground focus:outline-none focus:ring-0 p-0 leading-tight"
              />
              
              <div className="flex gap-2 shrink-0 items-center">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider hidden sm:inline">Categoria:</span>
                <input
                  type="text"
                  placeholder="Geral"
                  value={editCategory}
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                  className="px-3.5 py-1.5 bg-muted/40 border border-border focus:border-primary rounded-xl text-white placeholder-muted-foreground text-xs focus:outline-none focus:ring-0 transition-all font-medium max-w-32"
                />
              </div>
            </div>

            {/* Conteúdo do Editor / Visualizador */}
            <div className="flex-1 overflow-y-auto p-5 relative">
              {activeTab === "write" ? (
                <textarea
                  value={editContent}
                  onChange={(e) => handleFieldChange("content", e.target.value)}
                  placeholder="# Título&#10;&#10;Escreva as anotações do cofre usando formatação Markdown..."
                  className="w-full h-full bg-transparent border-0 resize-none text-white/90 placeholder-muted-foreground/60 text-sm focus:outline-none focus:ring-0 p-0 leading-relaxed font-mono"
                />
              ) : (
                <div
                  className="prose prose-invert max-w-none text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(editContent) }}
                />
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
              className="mt-4 px-3.5 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 transition-all cursor-pointer"
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

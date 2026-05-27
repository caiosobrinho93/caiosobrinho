"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Video,
  Key,
  Image as ImageIcon,
  DownloadCloud,
  FolderOpen,
  Cpu,
  FileText,
  Settings,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Plus
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const items = [
    // Navegação
    { id: "nav-dash", label: "Ir para o Painel Geral", category: "Navegação", icon: LayoutDashboard, action: () => router.push("/dashboard") },
    { id: "nav-vid", label: "Ir para o Cine Vault (Vídeos)", category: "Navegação", icon: Video, action: () => router.push("/dashboard/videos") },
    { id: "nav-pass", label: "Ir para as Senhas", category: "Navegação", icon: Key, action: () => router.push("/dashboard/passwords") },
    { id: "nav-wall", label: "Ir para as Imagens (Wallpapers)", category: "Navegação", icon: ImageIcon, action: () => router.push("/dashboard/wallpapers") },
    { id: "nav-torr", label: "Ir para os Torrents", category: "Navegação", icon: DownloadCloud, action: () => router.push("/dashboard/torrents") },
    { id: "nav-files", label: "Ir para os Arquivos", category: "Navegação", icon: FolderOpen, action: () => router.push("/dashboard/files") },
    { id: "nav-soft", label: "Ir para o Catálogo de Apps (Softwares)", category: "Navegação", icon: Cpu, action: () => router.push("/dashboard/software") },
    { id: "nav-notes", label: "Ir para o Editor de Notas", category: "Navegação", icon: FileText, action: () => router.push("/dashboard/notes") },
    { id: "nav-sett", label: "Ir para as Configurações", category: "Navegação", icon: Settings, action: () => router.push("/dashboard/settings") },

    // Ações
    { id: "act-note", label: "Criar Nova Nota", category: "Ações Rápidas", icon: Plus, action: () => { router.push("/dashboard/notes?new=true"); } },
    { id: "act-pass", label: "Gerar Senha Forte e Segura", category: "Ações Rápidas", icon: Sparkles, action: () => { router.push("/dashboard/passwords?generate=true"); } },
    { id: "act-lock", label: "Bloquear Sessão do Cofre", category: "Ações Rápidas", icon: ShieldAlert, action: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }
    },
  ];

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  const selectedItemRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 w-full h-full z-50 flex items-start justify-center pt-24 px-4 overflow-hidden">
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            ref={containerRef}
            className="w-full max-w-xl bg-card border border-border/85 rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[480px] overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 border-b border-border/80 h-14 shrink-0">
              <Search className="w-4.5 h-4.5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Digite um comando ou atalho de navegação..."
                className="w-full h-full bg-transparent border-0 text-white placeholder-muted-foreground text-sm focus:outline-none focus:ring-0"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-2 border border-border/70 bg-muted/50 rounded text-xs font-mono text-muted-foreground select-none">
                esc
              </kbd>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5.5">
              {filteredItems.length > 0 ? (
                <div>
                  {Array.from(new Set(filteredItems.map((item) => item.category))).map((category) => (
                    <div key={category} className="mb-3">
                      <div className="px-3 py-1.5 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                        {category}
                      </div>
                      
                      <div className="space-y-0.5">
                        {filteredItems
                          .map((item, index) => ({ item, index }))
                          .filter(({ item }) => item.category === category)
                          .map(({ item, index }) => {
                            const isSelected = selectedIndex === index;
                            const Icon = item.icon;
                            
                            return (
                              <div
                                key={item.id}
                                ref={isSelected ? selectedItemRef : null}
                                onClick={() => {
                                  item.action();
                                  onClose();
                                }}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all group ${
                                  isSelected
                                    ? "bg-primary text-white shadow-md shadow-primary/10"
                                    : "text-muted-foreground hover:bg-muted/40 hover:text-white"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-muted-foreground group-hover:text-white"}`} />
                                  <span className="text-sm font-medium">{item.label}</span>
                                </div>
                                {isSelected && (
                                  <span className="flex items-center text-sm gap-2 opacity-80">
                                    Executar <ArrowRight className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Search className="w-8 h-8 text-border mb-3" />
                  <p className="text-sm font-medium">Nenhum resultado encontrado para &ldquo;{query}&rdquo;</p>
                  <p className="text-xs mt-1 text-muted-foreground/60">Tente buscar por termos diferentes.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="h-10 px-4 border-t border-border bg-muted/20 flex items-center justify-between text-sm text-muted-foreground shrink-0 select-none">
              <span>Use as teclas <kbd className="font-mono bg-card px-1 border border-border">↑</kbd> <kbd className="font-mono bg-card px-1 border border-border">↓</kbd> para navegar</span>
              <span>Pressione <kbd className="font-mono bg-card px-1 border border-border">Enter</kbd> para selecionar</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

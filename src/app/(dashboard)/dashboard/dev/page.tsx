"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDataStore } from "@/stores/dataStore";
import { Plus, Search, Code, Layout, Paintbrush, MonitorPlay, Save, Trash2, X, FileCode2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DevComponent {
  id: string;
  title: string;
  description: string | null;
  htmlCode: string | null;
  cssCode: string | null;
  jsCode: string | null;
  category: string | null;
  isFavorite: boolean;
  updatedAt: string;
}

export default function DevPage() {
  const { data: components, isLoading } = useDataStore(s => s.dev);
  const [search, setSearch] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComp, setSelectedComp] = useState<Partial<DevComponent> | null>(null);
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");

  useEffect(() => {
    useDataStore.getState().fetchDev();
  }, []);

  const handleOpenNew = () => {
    setSelectedComp({
      title: "Novo Componente",
      htmlCode: '<div class="meu-componente">\n  <h2>Olá Mundo</h2>\n</div>',
      cssCode: '.meu-componente {\n  padding: 1rem;\n  background: #fff;\n  border-radius: 8px;\n  color: #000;\n}',
      jsCode: 'console.log("Componente montado!");',
      category: "UI",
    });
    setActiveTab("html");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp: DevComponent) => {
    setSelectedComp(comp);
    setActiveTab("html");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedComp) return;
    
    const isNew = !selectedComp.id;
    const url = isNew ? "/api/dev-components" : `/api/dev-components/${selectedComp.id}`;
    const method = isNew ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedComp),
      });

      if (res.ok) {
        const saved = await res.json();
        if (isNew) {
          useDataStore.getState().addDevComponent(saved);
        } else {
          useDataStore.getState().updateDevComponent(saved.id, saved);
        }
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este componente?")) return;
    try {
      const res = await fetch(`/api/dev-components/${id}`, { method: "DELETE" });
      if (res.ok) {
        useDataStore.getState().deleteDevComponent(id);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Build the live preview HTML
  const generatePreviewHtml = (html: string = "", css: string = "", js: string = "") => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 1rem; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background-color: transparent; }
            ${css}
          </style>
        </head>
        <body>
          ${html}
          <script>
            try {
              ${js}
            } catch(e) {
              console.error(e);
            }
          </script>
        </body>
      </html>
    `;
  };

  const filtered = components.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    (c.category && c.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* HEADER */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-5">
            <Code className="w-6 h-6 text-primary" />
            DEV Central
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Sua biblioteca pessoal de componentes e snippets HTML/CSS/JS.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar componentes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white transition-all"
            />
          </div>
          <button onClick={handleOpenNew} className="glass-btn glass-btn-primary shrink-0">
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* GRID DE COMPONENTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel h-48 animate-pulse rounded-xl" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map(comp => (
            <div 
              key={comp.id}
              onClick={() => handleOpenEdit(comp)}
              className="glass-panel group cursor-pointer overflow-hidden flex flex-col h-48 hover:-translate-y-1 transition-all"
            >
              {/* Mini Preview iframe (disabled interactions) */}
              <div className="flex-1 bg-black/40 relative overflow-hidden pointer-events-none">
                <iframe 
                  className="absolute inset-0 w-full h-full transform scale-[0.6] origin-top-left" 
                  style={{ width: '166.66%', height: '166.66%' }}
                  srcDoc={generatePreviewHtml(comp.htmlCode || "", comp.cssCode || "", comp.jsCode || "")} 
                  sandbox="allow-scripts"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              </div>
              
              <div className="p-4 border-t border-white/5 bg-background/80 backdrop-blur-md">
                <div className="flex justify-between items-start gap-5">
                  <h3 className="text-white font-semibold text-sm truncate">{comp.title}</h3>
                  {comp.category && (
                    <span className="text-sm uppercase tracking-wider px-2 py-2 rounded-full bg-primary/20 text-primary whitespace-nowrap">
                      {comp.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <FileCode2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-white font-medium mb-1">Nenhum componente encontrado</h3>
            <p className="text-sm text-muted-foreground">Clique em Adicionar para salvar seu primeiro componente.</p>
          </div>
        )}
      </div>

      {/* EDITOR MODAL */}
      <AnimatePresence>
        {isModalOpen && selectedComp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="glass-panel w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden relative z-10"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                <input
                  type="text"
                  value={selectedComp.title || ""}
                  onChange={e => setSelectedComp({ ...selectedComp, title: e.target.value })}
                  className="bg-transparent text-xl font-bold text-white outline-none border-b border-transparent focus:border-primary/50 px-1 py-2 transition-colors"
                  placeholder="Nome do Componente"
                />
                <div className="flex items-center gap-5">
                  {selectedComp.id && (
                    <button onClick={() => handleDelete(selectedComp.id!)} className="p-5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={handleSave} className="glass-btn glass-btn-primary">
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Salvar</span>
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="p-5 rounded-lg text-muted-foreground hover:bg-white/10 transition-colors ml-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body (Split view) */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                
                {/* Left: Code Editor */}
                <div className="w-full lg:w-1/2 flex flex-col border-r border-white/10 bg-black/40">
                  <div className="flex border-b border-white/10 px-2 py-2 gap-2 bg-black/20">
                    <button 
                      onClick={() => setActiveTab("html")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-5 transition-all ${activeTab === "html" ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
                    >
                      <Layout className="w-4 h-4" /> HTML
                    </button>
                    <button 
                      onClick={() => setActiveTab("css")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-5 transition-all ${activeTab === "css" ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
                    >
                      <Paintbrush className="w-4 h-4" /> CSS
                    </button>
                    <button 
                      onClick={() => setActiveTab("js")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-5 transition-all ${activeTab === "js" ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
                    >
                      <Code className="w-4 h-4" /> JS
                    </button>
                  </div>
                  
                  <div className="flex-1 p-4 relative">
                    {activeTab === "html" && (
                      <textarea 
                        className="w-full h-full bg-transparent text-gray-300 font-mono text-sm resize-none outline-none"
                        value={selectedComp.htmlCode || ""}
                        onChange={e => setSelectedComp({ ...selectedComp, htmlCode: e.target.value })}
                        spellCheck={false}
                        placeholder="<!-- Digite seu HTML aqui -->"
                      />
                    )}
                    {activeTab === "css" && (
                      <textarea 
                        className="w-full h-full bg-transparent text-gray-300 font-mono text-sm resize-none outline-none"
                        value={selectedComp.cssCode || ""}
                        onChange={e => setSelectedComp({ ...selectedComp, cssCode: e.target.value })}
                        spellCheck={false}
                        placeholder="/* Digite seu CSS aqui */"
                      />
                    )}
                    {activeTab === "js" && (
                      <textarea 
                        className="w-full h-full bg-transparent text-gray-300 font-mono text-sm resize-none outline-none"
                        value={selectedComp.jsCode || ""}
                        onChange={e => setSelectedComp({ ...selectedComp, jsCode: e.target.value })}
                        spellCheck={false}
                        placeholder="// Digite seu JavaScript aqui"
                      />
                    )}
                  </div>
                </div>

                {/* Right: Live Preview */}
                <div className="w-full lg:w-1/2 flex flex-col bg-slate-900/50">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center gap-5 text-sm font-medium text-white/70 bg-black/20">
                    <MonitorPlay className="w-4 h-4 text-primary" /> Live Preview
                  </div>
                  <div className="flex-1 relative overflow-hidden bg-white/5">
                    <iframe 
                      className="absolute inset-0 w-full h-full border-none"
                      srcDoc={generatePreviewHtml(selectedComp.htmlCode || "", selectedComp.cssCode || "", selectedComp.jsCode || "")}
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

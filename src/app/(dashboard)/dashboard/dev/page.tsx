"use client";

import React, { useEffect, useState } from "react";
import { useDataStore } from "@/stores/dataStore";
import { Plus, Search, Code, Layout, Paintbrush, MonitorPlay, Save, Trash2, X, FileCode2, Terminal, Maximize2, Zap } from "lucide-react";
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
      htmlCode: '<div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">\n  <div class="shrink-0">\n    <div class="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">✨</div>\n  </div>\n  <div>\n    <div class="text-xl font-medium text-black">Tailwind Pronto!</div>\n    <p class="text-slate-500">Comece a estilizar suas ideias.</p>\n  </div>\n</div>',
      cssCode: '/* O Tailwind já está injetado e pronto para uso! */\n/* Você ainda pode adicionar CSS puro aqui se precisar. */\nbody {\n  background-color: #f8fafc;\n}',
      jsCode: 'console.log("Componente montado com Tailwind!");',
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

  // Build the live preview HTML (INJECTED TAILWIND)
  const generatePreviewHtml = (html: string = "", css: string = "", js: string = "") => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 1rem; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background-color: transparent; }
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
    <div className="flex flex-col h-full space-y-6 pb-8">
      {/* HEADER OVERHAUL */}
      <div className="relative p-6 sm:p-8 rounded-2xl overflow-hidden shadow-2xl bg-[#0a0a0f] border border-white/5 mb-6 mx-5 sm:mx-0 mt-5 sm:mt-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col items-start text-left">
            <h1 className="text-3xl font-display font-extrabold text-white flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30">
                <Terminal className="w-6 h-6 text-primary" />
              </div>
              DEV Central
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              Seu estúdio criativo. Crie, teste e gerencie snippets HTML/CSS/JS. <br className="hidden sm:block"/>
              <span className="text-primary/80 font-semibold flex items-center gap-1 mt-1">
                <Zap className="w-3.5 h-3.5" /> Agora com suporte nativo ao Tailwind CSS!
              </span>
            </p>
          </div>
          <button onClick={handleOpenNew} className="flex items-center gap-2 bg-white text-black hover:bg-white/90 px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-105">
            <Plus className="w-5 h-5" />
            <span>Criar Componente</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="space-y-6 px-5 sm:px-0 flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Pesquisar na biblioteca..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#111116] border border-white/5 rounded-2xl text-sm focus:outline-none focus:border-primary/50 text-white transition-all shadow-inner"
          />
        </div>

        {/* COMPONENT GRID OVERHAUL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-6">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="nexus-card h-[220px] animate-pulse rounded-2xl bg-white/[0.02] border border-white/5" />
            ))
          ) : filtered.length > 0 ? (
            filtered.map(comp => (
              <div 
                key={comp.id}
                onClick={() => handleOpenEdit(comp)}
                className="group cursor-pointer rounded-2xl overflow-hidden flex flex-col h-[220px] bg-[#111116] border border-white/5 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] transition-all duration-300 relative"
              >
                {/* Mini Preview iframe (disabled interactions) */}
                <div className="flex-1 bg-white/[0.02] relative overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 pattern-dots opacity-[0.1] bg-[size:16px_16px]" />
                  <iframe 
                    className="absolute inset-0 w-full h-full transform scale-[0.55] origin-top-left" 
                    style={{ width: '181%', height: '181%' }}
                    srcDoc={generatePreviewHtml(comp.htmlCode || "", comp.cssCode || "", comp.jsCode || "")} 
                    sandbox="allow-scripts"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-300" />
                  
                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
                    <div className="bg-primary/90 text-white px-4 py-2 rounded-full font-semibold text-xs flex items-center gap-2 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <Code className="w-3.5 h-3.5" /> Editar Código
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-[#111116] border-t border-white/5 relative z-10">
                  <div className="flex justify-between items-center gap-3">
                    <h3 className="text-white font-bold text-sm truncate group-hover:text-primary transition-colors">{comp.title}</h3>
                    {comp.category && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md bg-white/5 text-white/60 border border-white/10 whitespace-nowrap">
                        {comp.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center flex flex-col items-center justify-center bg-[#111116] rounded-3xl border border-dashed border-white/10">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-5 shadow-inner">
                <FileCode2 className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Nenhum componente na biblioteca</h3>
              <p className="text-sm text-white/40 max-w-md">
                Você ainda não possui componentes criados. Clique em "Criar Componente" para começar a montar sua biblioteca pessoal com suporte a Tailwind.
              </p>
            </div>
          )}
        </div>

        {/* EDITOR MODAL OVERHAUL (IDE STYLE) */}
        <AnimatePresence>
          {isModalOpen && selectedComp && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden relative z-10 bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl ring-1 ring-white/5"
              >
                {/* Modal Header (IDE Style) */}
                <div className="h-14 px-4 border-b border-[#333333] flex justify-between items-center bg-[#252526]">
                  <div className="flex items-center gap-3 w-1/3">
                    {/* macOS dots */}
                    <div className="flex gap-1.5 mr-2 hidden sm:flex">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <input
                      type="text"
                      value={selectedComp.title || ""}
                      onChange={e => setSelectedComp({ ...selectedComp, title: e.target.value })}
                      className="bg-[#3c3c3c] text-sm font-medium text-[#cccccc] outline-none border border-transparent focus:border-primary/50 px-3 py-1.5 rounded-md w-full max-w-[200px] transition-colors"
                      placeholder="Nome do Componente"
                    />
                  </div>
                  
                  <div className="text-[#858585] text-xs font-mono hidden md:block">
                    {selectedComp.id ? `ID: ${selectedComp.id.substring(0,8)}` : "Modo Criação"} - DEV Central
                  </div>

                  <div className="flex items-center justify-end gap-2 w-1/3">
                    {selectedComp.id && (
                      <button onClick={() => handleDelete(selectedComp.id!)} className="p-2 rounded hover:bg-red-500/20 text-[#cccccc] hover:text-red-400 transition-colors" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={handleSave} className="flex items-center gap-2 bg-primary/20 text-primary hover:bg-primary/30 px-4 py-1.5 rounded text-sm font-semibold transition-colors border border-primary/20">
                      <Save className="w-4 h-4" />
                      <span className="hidden sm:inline">Salvar Ctrl+S</span>
                    </button>
                    <div className="w-px h-5 bg-[#333333] mx-1" />
                    <button onClick={() => setIsModalOpen(false)} className="p-2 rounded text-[#cccccc] hover:bg-[#3c3c3c] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Modal Body (Split view) */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#1e1e1e]">
                  
                  {/* Left: Code Editor (VS Code style) */}
                  <div className="w-full lg:w-1/2 flex flex-col border-r border-[#333333]">
                    {/* Tabs */}
                    <div className="flex bg-[#252526] overflow-x-auto custom-scrollbar">
                      <button 
                        onClick={() => setActiveTab("html")}
                        className={`px-5 py-2.5 text-xs font-mono flex items-center gap-2 border-t-2 transition-colors min-w-[120px] ${activeTab === "html" ? "bg-[#1e1e1e] text-[#e34c26] border-[#e34c26]" : "bg-[#2d2d2d] text-[#969696] border-transparent hover:bg-[#2a2a2b]"}`}
                      >
                        <Layout className="w-3.5 h-3.5" /> index.html
                      </button>
                      <button 
                        onClick={() => setActiveTab("css")}
                        className={`px-5 py-2.5 text-xs font-mono flex items-center gap-2 border-t-2 transition-colors min-w-[120px] border-l border-[#333333] ${activeTab === "css" ? "bg-[#1e1e1e] text-[#264de4] border-[#264de4]" : "bg-[#2d2d2d] text-[#969696] border-transparent hover:bg-[#2a2a2b]"}`}
                      >
                        <Paintbrush className="w-3.5 h-3.5" /> style.css
                      </button>
                      <button 
                        onClick={() => setActiveTab("js")}
                        className={`px-5 py-2.5 text-xs font-mono flex items-center gap-2 border-t-2 transition-colors min-w-[120px] border-l border-[#333333] ${activeTab === "js" ? "bg-[#1e1e1e] text-[#f0db4f] border-[#f0db4f]" : "bg-[#2d2d2d] text-[#969696] border-transparent hover:bg-[#2a2a2b]"}`}
                      >
                        <Code className="w-3.5 h-3.5" /> script.js
                      </button>
                    </div>
                    
                    {/* Textarea Area */}
                    <div className="flex-1 relative bg-[#1e1e1e] group p-4">
                      {/* Fake Line Numbers */}
                      <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#1e1e1e] border-r border-[#333333] text-[#858585] text-xs font-mono text-right py-4 pr-2 select-none flex flex-col pointer-events-none">
                        {[...Array(30)].map((_, i) => <div key={i} className="leading-6">{i + 1}</div>)}
                      </div>
                      
                      {activeTab === "html" && (
                        <textarea 
                          className="w-full h-full pl-8 bg-transparent text-[#d4d4d4] font-mono text-[13px] leading-6 resize-none outline-none custom-scrollbar"
                          value={selectedComp.htmlCode || ""}
                          onChange={e => setSelectedComp({ ...selectedComp, htmlCode: e.target.value })}
                          spellCheck={false}
                          placeholder="<!-- Digite seu HTML aqui (Tailwind suportado!) -->"
                        />
                      )}
                      {activeTab === "css" && (
                        <textarea 
                          className="w-full h-full pl-8 bg-transparent text-[#d4d4d4] font-mono text-[13px] leading-6 resize-none outline-none custom-scrollbar"
                          value={selectedComp.cssCode || ""}
                          onChange={e => setSelectedComp({ ...selectedComp, cssCode: e.target.value })}
                          spellCheck={false}
                          placeholder="/* Estilos personalizados */"
                        />
                      )}
                      {activeTab === "js" && (
                        <textarea 
                          className="w-full h-full pl-8 bg-transparent text-[#d4d4d4] font-mono text-[13px] leading-6 resize-none outline-none custom-scrollbar"
                          value={selectedComp.jsCode || ""}
                          onChange={e => setSelectedComp({ ...selectedComp, jsCode: e.target.value })}
                          spellCheck={false}
                          placeholder="// Lógica JavaScript"
                        />
                      )}
                    </div>
                  </div>

                  {/* Right: Live Preview */}
                  <div className="w-full lg:w-1/2 flex flex-col bg-[#ffffff] relative">
                    <div className="h-10 px-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 text-xs font-medium text-gray-500 shadow-sm z-10">
                      <div className="flex items-center gap-2">
                        <MonitorPlay className="w-4 h-4 text-primary" /> 
                        <span>Browser Preview</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-md shadow-inner text-[10px] font-mono text-gray-400">
                        localhost:3000/preview
                      </div>
                      <Maximize2 className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-600" />
                    </div>
                    <div className="flex-1 relative overflow-hidden bg-white pattern-dots opacity-[0.9] bg-[size:20px_20px]">
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
    </div>
  );
}

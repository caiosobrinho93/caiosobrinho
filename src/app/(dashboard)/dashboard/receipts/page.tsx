"use client";

import React, { useEffect, useState } from "react";
import { useStatsStore } from "@/stores/statsStore";
import { useDataStore } from "@/stores/dataStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck,
  Plus,
  Trash2,
  X,
  Loader2,
  FileText,
  DollarSign,
  Calendar,
  ExternalLink,
  Search,
  Upload,
  Link as LinkIcon,
  Eye,
  Download
} from "lucide-react";

interface ReceiptItem {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  amount: number | null;
  paymentDate: string | null;
  category: string | null;
  userId: string;
  user: {
    username: string;
  };
  createdAt: string;
}

export default function ReceiptsPage() {
  const { data: receipts, isLoading } = useDataStore((s) => s.receipts);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lightbox preview states
  const [previewReceipt, setPreviewReceipt] = useState<ReceiptItem | null>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formPaymentDate, setFormPaymentDate] = useState("");
  const [formCategory, setFormCategory] = useState("Pensão Alimentícia");
  const [formFiles, setFormFiles] = useState<File[]>([]);

  useEffect(() => {
    useDataStore.getState().fetchReceipts();
  }, []);

  const setDateToToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormPaymentDate(today);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;
    if (formFiles.length === 0) {
      alert("Por favor, selecione pelo menos um arquivo de comprovante.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", formTitle);
      formData.append("description", formDescription);
      formData.append("category", formCategory);
      if (formAmount) formData.append("amount", formAmount);
      if (formPaymentDate) formData.append("paymentDate", formPaymentDate);

      formFiles.forEach((file) => {
        formData.append("file", file);
      });

      const res = await fetch("/api/receipts", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newReceipt = await res.json();
        useDataStore.getState().addReceipt(newReceipt);
        
        // Atualizar store global localmente
        useStatsStore.getState().addReceipt();

        setIsModalOpen(false);
        setShowAdvanced(false);
        // Reset
        setFormTitle("");
        setFormDescription("");
        setFormAmount("");
        setFormPaymentDate("");
        setFormCategory("Pensão Alimentícia");
        setFormFiles([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este comprovante?")) return;

    try {
      const res = await fetch(`/api/receipts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Atualizar store global localmente
        useStatsStore.getState().deleteReceipt();
        useDataStore.getState().deleteReceipt(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter based on search query
  const filteredReceipts = receipts.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.category && r.category.toLowerCase().includes(search.toLowerCase())) ||
    (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-primary" />
            Comprovantes de Pagamentos
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5">
            Guarde e organize todos os recibos e comprovantes em um só lugar.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="glass-btn glass-btn-primary self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Adicionar Recibo
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por título, categoria ou descrição..."
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-card/45 border border-border focus:border-primary text-white focus:outline-none placeholder-muted-foreground"
        />
      </div>

      {/* Content list */}
      {isLoading ? (
        <div className="h-[200px] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : filteredReceipts.length > 0 ? (
        <>
          {/* MOBILE: compact list rows (max ~80px each) */}
          <div className="sm:hidden flex flex-col gap-2">
            {filteredReceipts.map((receipt) => (
              <motion.div
                key={receipt.id}
                layout
                onClick={() => { setPreviewReceipt(receipt); setActivePreviewIndex(0); }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl border border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50 cursor-pointer active:scale-[0.99] transition-all"
                style={{ maxHeight: 80 }}
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-tight">{receipt.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                    {receipt.category || "Outros"}
                    {receipt.paymentDate ? ` · ${new Date(receipt.paymentDate).toLocaleDateString("pt-BR")}` : ""}
                  </p>
                </div>

                {/* Amount + actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {receipt.amount !== null && (
                    <span className="text-[11px] font-bold text-primary whitespace-nowrap">
                      R$ {receipt.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(receipt.id); }}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* DESKTOP: original card grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReceipts.map((receipt) => (
              <motion.div
                key={receipt.id}
                layout
                onClick={() => { setPreviewReceipt(receipt); setActivePreviewIndex(0); }}
                className="glass-panel p-5 border border-border/60 hover:border-primary/35 hover:shadow-[0_0_15px_rgba(197,255,26,0.05)] cursor-pointer flex flex-col justify-between h-56 relative overflow-hidden transition-all duration-300 group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">
                        {receipt.category || "Outros"}
                      </span>
                      <h3 className="font-semibold text-sm text-white mt-1.5 truncate" title={receipt.title}>
                        {receipt.title}
                      </h3>
                    </div>
                    <span className={`user-tag user-tag-${receipt.user.username} shrink-0`}>
                      {receipt.user.username === "caio" ? "Caio" : "Giselle"}
                    </span>
                  </div>

                  {receipt.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{receipt.description}</p>
                  )}

                  <div className="pt-2 space-y-1 text-xs text-muted-foreground">
                    {receipt.amount !== null && (
                      <div className="flex items-center gap-1.5 text-white font-semibold">
                        <DollarSign className="w-3.5 h-3.5 text-primary" />
                        R$ {receipt.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    )}
                    {receipt.paymentDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        Pago em: {new Date(receipt.paymentDate).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-4 shrink-0">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(receipt.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  <div className="flex items-center gap-2">
                    {receipt.fileUrl && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewReceipt(receipt); setActivePreviewIndex(0); }}
                        className="p-2 rounded-xl bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-all cursor-pointer flex items-center justify-center"
                        title="Ver Comprovante"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(receipt.id); }}
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer flex items-center justify-center"
                      title="Excluir Comprovante"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="glass-panel p-10 text-center border border-border/50">
          <FileText className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">Nenhum comprovante encontrado</h3>
          <p className="text-xs text-muted-foreground mt-1">Insira seus comprovantes de pagamentos para mantê-los seguros.</p>
        </div>
      )}

      {/* Modal Add Receipt */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-card border border-border p-6 rounded-2xl shadow-2xl relative z-10 glass-panel-solid"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <h3 className="font-bold text-white text-base">Novo Comprovante</h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setShowAdvanced(false);
                  }}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Campos Primários */}
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Título do Comprovante *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Comprovante Celular, Recibo de Internet"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted/50 border border-border focus:border-primary text-white focus:outline-none placeholder-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Valor Pago (R$ - Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted/50 border border-border focus:border-primary text-white focus:outline-none placeholder-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Arquivo(s) do Comprovante * (Máx 2 arquivos)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      required
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                          const list = Array.from(files).slice(0, 2);
                          setFormFiles(list);
                        }
                      }}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted/50 border border-border focus:border-primary text-white focus:outline-none cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-primary/10 file:text-primary file:cursor-pointer hover:file:bg-primary/20"
                    />
                  </div>
                  {formFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formFiles.map((file, idx) => (
                        <div key={idx} className="text-[10px] text-primary font-medium flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {file.name} ({Math.round(file.size / 1024)} KB)
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botão de Opções Avançadas */}
                <div className="pt-1 pb-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-[9px] text-primary hover:underline font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
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
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                          Descrição
                        </label>
                        <textarea
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          placeholder="Detalhes adicionais sobre o comprovante..."
                          rows={2}
                          className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary text-white focus:outline-none placeholder-muted-foreground resize-none text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex justify-between items-center">
                            <span>Data de Pagamento</span>
                            <button
                              type="button"
                              onClick={setDateToToday}
                              className="text-[9px] text-primary hover:underline font-bold uppercase tracking-widest cursor-pointer"
                            >
                              Hoje
                            </button>
                          </label>
                          <input
                            type="date"
                            value={formPaymentDate}
                            onChange={(e) => setFormPaymentDate(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary text-white focus:outline-none text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                            Categoria
                          </label>
                          <select
                            value={formCategory}
                            onChange={(e) => setFormCategory(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border focus:border-primary text-white focus:outline-none cursor-pointer text-xs"
                          >
                            <option value="Pensão Alimentícia" className="bg-card">Pensão Alimentícia</option>
                            <option value="Pagamento de Contas" className="bg-card">Pagamento de Contas</option>
                            <option value="Moradia" className="bg-card">Moradia</option>
                            <option value="Saúde" className="bg-card">Saúde</option>
                            <option value="Alimentação" className="bg-card">Alimentação</option>
                            <option value="Lazer" className="bg-card">Lazer</option>
                            <option value="Outros" className="bg-card">Outros</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-2 border-t border-border flex items-center justify-end gap-2.5">
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
                    className="px-4 py-2 rounded-xl text-xs bg-primary hover:bg-primary/95 text-black font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-primary/10 transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Registrar Comprovante"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX DE PRÉ-VISUALIZAÇÃO DE COMPROVANTE */}
      <AnimatePresence>
        {previewReceipt && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewReceipt(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-3xl bg-[#12161a] border border-border rounded-2xl flex flex-col relative z-10 overflow-hidden shadow-2xl max-h-[85vh] glass-panel-solid"
            >
              {/* Header */}
              <div className="h-14 border-b border-border/80 bg-muted/20 flex items-center justify-between px-5 shrink-0 z-20">
                <div className="flex items-center gap-3 min-w-0">
                  <FileCheck className="w-5 h-5 text-primary animate-pulse shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-white truncate block max-w-md">
                      {previewReceipt.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-none mt-0.5 block font-mono">
                      {previewReceipt.category || "Outros"} &bull; {previewReceipt.amount ? `R$ ${previewReceipt.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(() => {
                    const urls = previewReceipt.fileUrl ? previewReceipt.fileUrl.split(",") : [];
                    const activeUrl = urls[activePreviewIndex] || "";
                    if (!activeUrl) return null;
                    return (
                      <a
                        href={activeUrl}
                        download={`${previewReceipt.title}-${activePreviewIndex + 1}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-muted/60 hover:bg-muted border border-border/80 text-white cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Baixar
                      </a>
                    );
                  })()}
                  <button
                    onClick={() => setPreviewReceipt(null)}
                    className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Selector for multiple files if applicable */}
              {previewReceipt.fileUrl && previewReceipt.fileUrl.split(",").length > 1 && (
                <div className="px-5 py-2 border-b border-border/40 bg-card/65 flex gap-2 shrink-0">
                  {previewReceipt.fileUrl.split(",").map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePreviewIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activePreviewIndex === idx
                          ? "bg-primary text-black"
                          : "bg-muted/40 text-muted-foreground hover:text-white"
                      }`}
                    >
                      Arquivo {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Moldura de Visualização */}
              <div className="flex-1 w-full bg-black/80 flex items-center justify-center overflow-auto p-4 min-h-[350px]">
                {(() => {
                  const urls = previewReceipt.fileUrl ? previewReceipt.fileUrl.split(",") : [];
                  const activeUrl = urls[activePreviewIndex] || "";
                  if (!activeUrl) {
                    return (
                      <div className="text-center py-12 flex flex-col items-center">
                        <FileText className="w-14 h-14 text-muted-foreground mb-4" />
                        <p className="text-sm font-semibold text-white">Nenhum arquivo de comprovante disponível</p>
                      </div>
                    );
                  }

                  const isPdfFile = activeUrl.toLowerCase().endsWith(".pdf");
                  const isImgFile = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(activeUrl.toLowerCase().split('.').pop() || "");

                  if (isImgFile) {
                    return (
                      <img
                        src={activeUrl}
                        alt="Comprovante"
                        className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg border border-border/40"
                      />
                    );
                  } else if (isPdfFile) {
                    return (
                      <iframe
                        src={activeUrl}
                        className="w-full h-[60vh] border-0 rounded-lg shadow-md"
                      />
                    );
                  } else {
                    return (
                      <div className="text-center py-12 flex flex-col items-center">
                        <FileText className="w-14 h-14 text-muted-foreground mb-4" />
                        <p className="text-sm font-semibold text-white font-display">Visualização direta indisponível</p>
                        <a
                          href={activeUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 px-4 py-2 bg-primary text-black font-bold rounded-xl text-xs hover:bg-primary/95 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Baixar para Visualizar
                        </a>
                      </div>
                    );
                  }
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

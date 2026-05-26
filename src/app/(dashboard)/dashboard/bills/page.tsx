"use client";

import React, { useEffect, useState } from "react";
import { useDataStore } from "@/stores/dataStore";
import { useStatsStore } from "@/stores/statsStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Clock,
  User
} from "lucide-react";

interface BillItem {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  dueDate: string;
  type: string; // "pagar", "receber", "agendar"
  status: string; // "pendente", "pago", "recebido", "agendado"
  paymentDate: string | null;
  userId: string;
  user: {
    username: string;
  };
}

export default function BillsPage() {
  const { data: bills, isLoading } = useDataStore((s) => s.bills);
  const [activeTab, setActiveTab] = useState<"todas" | "pagar" | "receber" | "agendar">("todas");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formType, setFormType] = useState("pagar");
  const [formStatus, setFormStatus] = useState("pendente");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    useDataStore.getState().fetchBills();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formAmount || !formDueDate || !formType) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          amount: parseFloat(formAmount),
          dueDate: formDueDate,
          type: formType,
          status: formStatus,
        }),
      });

      if (res.ok) {
        const newBill = await res.json();
        useDataStore.getState().addBill(newBill);
        
        // Atualiza a store global de estatísticas de forma local e imediata
        useStatsStore.getState().addBill(newBill, newBill.user?.username || "caio");

        setIsModalOpen(false);
        // Reset form
        setFormTitle("");
        setFormDescription("");
        setFormAmount("");
        setFormDueDate("");
        setFormType("pagar");
        setFormStatus("pendente");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string, type: string) => {
    let newStatus = "pendente";
    let paymentDate = null;

    if (currentStatus === "pendente") {
      newStatus = type === "pagar" ? "pago" : type === "receber" ? "recebido" : "agendado";
      paymentDate = new Date().toISOString();
    }

    try {
      const res = await fetch(`/api/bills/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          paymentDate,
        }),
      });

      if (res.ok) {
        const updatedBill = await res.json();
        const oldBill = bills.find((b) => b.id === id);
        if (oldBill) {
          // Atualiza a store global
          useStatsStore.getState().toggleBillStatus(id, oldBill.status, updatedBill.status, oldBill.amount, oldBill.type);
        }
        useDataStore.getState().updateBillStatus(id, updatedBill.status, updatedBill.paymentDate);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conta?")) return;

    try {
      const res = await fetch(`/api/bills/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Atualiza a store global
        useStatsStore.getState().deleteBill(id);
        useDataStore.getState().deleteBill(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter bills
  const filteredBills = bills.filter((b) => {
    if (activeTab === "todas") return true;
    return b.type === activeTab;
  });

  // Calculate totals
  const totalPagar = bills
    .filter((b) => b.type === "pagar" && b.status === "pendente")
    .reduce((sum, b) => sum + b.amount, 0);

  const totalReceber = bills
    .filter((b) => b.type === "receber" && b.status === "pendente")
    .reduce((sum, b) => sum + b.amount, 0);

  const totalAgendado = bills
    .filter((b) => b.type === "agendar" && b.status === "pendente")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-primary" />
            Contas Compartilhadas
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5">
            Gerencie contas a pagar, receber e agendamentos familiares.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="glass-btn glass-btn-primary self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Conta
        </button>
      </div>

      {/* Totais Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 border border-red-500/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">A Pagar (Pendentes)</p>
            <p className="text-xl font-bold text-red-400 mt-2">
              R$ {totalPagar.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 border border-emerald-500/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">A Receber (Pendentes)</p>
            <p className="text-xl font-bold text-emerald-400 mt-2">
              R$ {totalReceber.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-5 border border-amber-500/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Agendados (Pendentes)</p>
            <p className="text-xl font-bold text-amber-400 mt-2">
              R$ {totalAgendado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-card/45 border border-border/80 p-1 rounded-xl gap-2 max-w-md">
        {(["todas", "pagar", "receber", "agendar"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer capitalize ${
              activeTab === tab
                ? "bg-primary text-black font-bold shadow-md"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            {tab === "todas" ? "Todas" : tab === "pagar" ? "A Pagar" : tab === "receber" ? "A Receber" : "Agendados"}
          </button>
        ))}
      </div>

      {/* Content list */}
      {isLoading ? (
        <div className="h-[200px] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : filteredBills.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredBills.map((bill) => {
            const isCompleted = bill.status === "pago" || bill.status === "recebido";
            const diffDays = Math.ceil((new Date(bill.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            return (
              <motion.div
                key={bill.id}
                layout
                className={`glass-panel p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  isCompleted 
                    ? "border-border/30 opacity-60" 
                    : bill.type === "pagar" 
                      ? "border-red-500/15" 
                      : bill.type === "receber"
                        ? "border-emerald-500/15"
                        : "border-amber-500/15"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 border rounded-xl shrink-0 ${
                    bill.type === "pagar" 
                      ? "text-red-400 bg-red-500/10 border-red-500/20" 
                      : bill.type === "receber"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`font-semibold text-base text-white ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                        {bill.title}
                      </h3>
                      <span className={`user-tag user-tag-${bill.user.username}`}>
                        {bill.user.username === "caio" ? "Caio" : "Giselle"}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isCompleted
                          ? "bg-muted text-muted-foreground"
                          : bill.type === "pagar"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : bill.type === "receber"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {bill.status}
                      </span>
                    </div>
                    {bill.description && (
                      <p className="text-xs text-muted-foreground mt-1 max-w-lg">{bill.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                      <span>Vencimento: {new Date(bill.dueDate).toLocaleDateString("pt-BR")}</span>
                      {!isCompleted && bill.status === "pendente" && (
                        <span className={diffDays < 0 ? "text-red-400 font-semibold" : diffDays <= 2 ? "text-amber-400 font-semibold" : ""}>
                          {diffDays < 0 ? "Atrasada" : diffDays === 0 ? "Vence hoje" : diffDays === 1 ? "Vence amanhã" : `Vence em ${diffDays} dias`}
                        </span>
                      )}
                      {isCompleted && bill.paymentDate && (
                        <span className="text-emerald-400">
                          {bill.type === "pagar" ? "Paga" : "Recebida"} em: {new Date(bill.paymentDate).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t border-border/30 pt-3 md:border-t-0 md:pt-0 shrink-0">
                  <span className="text-lg font-bold text-white">
                    R$ {bill.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(bill.id, bill.status, bill.type)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isCompleted
                          ? "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40 hover:text-white"
                          : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                      }`}
                      title={isCompleted ? "Marcar como pendente" : "Marcar como concluída"}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bill.id)}
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                      title="Excluir conta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-10 text-center border border-border/50">
          <CreditCard className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">Nenhuma conta cadastrada</h3>
          <p className="text-xs text-muted-foreground mt-1">Crie contas a pagar ou receber para organizar suas finanças.</p>
        </div>
      )}

      {/* Modal Add Bill */}
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
                <h3 className="font-bold text-white text-base">Nova Conta</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Aluguel, Parcela do Carro"
                    className="w-full px-3.5 py-2 rounded-sm bg-muted/30 border border-border focus:border-primary text-white focus:outline-none placeholder-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Valor (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3.5 py-2 rounded-sm bg-muted/30 border border-border focus:border-primary text-white focus:outline-none placeholder-muted-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Data de Vencimento *
                    </label>
                    <input
                      type="date"
                      required
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-sm bg-muted/30 border border-border focus:border-primary text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Tipo *
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => {
                        setFormType(e.target.value);
                        if (e.target.value === "agendar") {
                          setFormStatus("agendado");
                        } else {
                          setFormStatus("pendente");
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-sm bg-muted/30 border border-border focus:border-primary text-white focus:outline-none cursor-pointer"
                    >
                      <option value="pagar" className="bg-card">A Pagar</option>
                      <option value="receber" className="bg-card">A Receber</option>
                      <option value="agendar" className="bg-card">Agendamento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Status Inicial *
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-sm bg-muted/30 border border-border focus:border-primary text-white focus:outline-none cursor-pointer"
                    >
                      {formType === "agendar" ? (
                        <option value="agendado" className="bg-card">Agendado</option>
                      ) : (
                        <>
                          <option value="pendente" className="bg-card">Pendente</option>
                          <option value="pago" className="bg-card">Pago</option>
                          <option value="recebido" className="bg-card">Recebido</option>
                        </>
                      )}
                    </select>
                  </div>
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
                          placeholder="Detalhes adicionais sobre a conta..."
                          rows={2}
                          className="w-full px-3.5 py-2 rounded-sm bg-muted/30 border border-border focus:border-primary text-white focus:outline-none placeholder-muted-foreground resize-none"
                        />
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
                    className="px-3.5 py-2 rounded-sm text-xs border border-border text-muted-foreground hover:text-white cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-sm text-xs bg-primary hover:bg-primary/95 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-primary/10"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Conta"
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

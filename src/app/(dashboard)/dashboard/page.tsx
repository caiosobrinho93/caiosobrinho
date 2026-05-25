"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Video,
  Key,
  FolderOpen,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Activity,
  HardDrive,
  Clock,
  Star,
  Zap,
  ChevronRight,
  Trophy,
  CheckCircle2,
  Circle,
  Trash2,
  RefreshCw,
  CreditCard,
  Check,
  Loader2
} from "lucide-react";

interface Goal {
  id: string;
  title: string;
  isCompleted: boolean;
  xpReward: number;
  createdAt: string;
}

interface StatsData {
  counts: {
    notes: number;
    passwords: number;
    videos: number;
    wallpapers: number;
    software: number;
    torrents: number;
    files: number;
  };
  profile: {
    xp: number;
    level: number;
    username: string;
  };
  goals: Goal[];
  recentItems: Array<{
    id: string;
    title: string;
    type: string;
    date: string;
    details: string;
  }>;
  favorites: Array<{
    id: string;
    title: string;
    type: string;
  }>;
  activityLog: Array<{
    id: string;
    text: string;
    time: string;
    status: string;
  }>;
  financialAccounts: Array<{
    id: string;
    provider: string;
    balance: string;
    status: string;
    lastSync: string;
    trend: string;
  }>;
  storageStats: {
    totalSize: string;
    usedSize: string;
    percentUsed: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados locais para interações de metas
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalXp, setNewGoalXp] = useState(100);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"general" | "goals" | "finance">("general");

  // Estados locais para simulação de sincronização bancária
  const [isSyncingBank, setIsSyncingBank] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error("Falha ao carregar as métricas do painel");
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getModuleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "nota":
      case "note":
        return <FileText className="w-4 h-4 text-emerald" />;
      case "vídeo":
      case "video":
        return <Video className="w-4 h-4 text-cyan" />;
      case "senha":
      case "password":
        return <Key className="w-4 h-4 text-rose" />;
      case "arquivo":
      case "file":
        return <FolderOpen className="w-4 h-4 text-amber" />;
      default:
        return <FileText className="w-4 h-4 text-primary" />;
    }
  };

  const getModuleLink = (type: string) => {
    switch (type.toLowerCase()) {
      case "nota":
      case "note":
        return "/dashboard/notes";
      case "vídeo":
      case "video":
        return "/dashboard/videos";
      case "senha":
      case "password":
        return "/dashboard/passwords";
      case "arquivo":
      case "file":
        return "/dashboard/files";
      default:
        return "/dashboard";
    }
  };

  // Alternar conclusão de metas
  const handleToggleGoal = async (goalId: string, currentStatus: boolean) => {
    if (!data) return;
    try {
      // Otimista
      const updatedGoals = data.goals.map((g) =>
        g.id === goalId ? { ...g, isCompleted: !currentStatus } : g
      );
      const xpReward = data.goals.find((g) => g.id === goalId)?.xpReward || 0;
      const xpDiff = !currentStatus ? xpReward : -xpReward;
      const newXp = Math.max(0, data.profile.xp + xpDiff);
      const newLevel = Math.floor(newXp / 1000) + 1;

      setData({
        ...data,
        profile: { ...data.profile, xp: newXp, level: newLevel },
        goals: updatedGoals,
      });

      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar status da meta");
      }
      
      const result = await response.json();
      // Atualizar com os valores exatos do servidor
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          profile: {
            ...prev.profile,
            xp: result.user.xp,
            level: result.user.level,
          },
          goals: prev.goals.map((g) => (g.id === goalId ? result.goal : g)),
        };
      });
    } catch (err) {
      console.error(err);
      fetchStats(); // Reverte em caso de erro
    }
  };

  // Excluir meta
  const handleDeleteGoal = async (goalId: string) => {
    if (!data) return;
    try {
      const targetGoal = data.goals.find((g) => g.id === goalId);
      if (!targetGoal) return;

      // Otimista
      const updatedGoals = data.goals.filter((g) => g.id !== goalId);
      let newXp = data.profile.xp;
      if (targetGoal.isCompleted) {
        newXp = Math.max(0, data.profile.xp - targetGoal.xpReward);
      }
      const newLevel = Math.floor(newXp / 1000) + 1;

      setData({
        ...data,
        profile: { ...data.profile, xp: newXp, level: newLevel },
        goals: updatedGoals,
      });

      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar meta");
      }
    } catch (err) {
      console.error(err);
      fetchStats();
    }
  };

  // Adicionar meta
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !data) return;
    setIsAddingGoal(true);
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newGoalTitle, xpReward: newGoalXp }),
      });
      if (!response.ok) {
        throw new Error("Erro ao adicionar meta");
      }
      const createdGoal = await response.json();
      setData({
        ...data,
        goals: [...data.goals, createdGoal],
      });
      setNewGoalTitle("");
      setNewGoalXp(100);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingGoal(false);
    }
  };

  // Sincronizar contas bancárias (Simulado)
  const handleSyncFinancials = () => {
    setIsSyncingBank(true);
    setSyncMessage("Conectando aos endpoints seguros de criptografia...");

    setTimeout(() => {
      setSyncMessage("Verificando tokens OAuth e chaves de API...");
    }, 1500);

    setTimeout(() => {
      setSyncMessage("Importando extratos e saldos atuais...");
    }, 3000);

    setTimeout(() => {
      setIsSyncingBank(false);
      setSyncMessage(null);
      if (data) {
        // Atualiza a hora da última sincronização nos dados
        setData({
          ...data,
          financialAccounts: data.financialAccounts.map((acc) => ({
            ...acc,
            lastSync: `Hoje às ${new Date().toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}`,
          })),
        });
      }
    }, 4500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-muted/60 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-card/60 border border-border/80 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-card/60 border border-border/80 rounded-2xl animate-pulse" />
          <div className="h-96 bg-card/60 border border-border/80 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center">
        <TrendingUp className="w-12 h-12 text-destructive mb-3" />
        <h3 className="text-lg font-bold text-white">Erro no Sistema</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{error || "Não foi possível carregar as métricas do painel."}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 transition-all cursor-pointer"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const moduleStats = [
    { name: "Cofre de Arquivos", count: data.counts.files, details: "Armazenamento local", icon: FolderOpen, color: "text-amber bg-amber/10 border-amber/20", href: "/dashboard/files" },
    { name: "Chaveiro AES", count: data.counts.passwords, details: "Criptografados", icon: Key, color: "text-rose bg-rose/10 border-rose/20", href: "/dashboard/passwords" },
    { name: "Cine Vault", count: data.counts.videos, details: "Filmes & Aulas", icon: Video, color: "text-cyan bg-cyan/10 border-cyan/20", href: "/dashboard/videos" },
    { name: "Torrents Ativos", count: data.counts.torrents, details: "Gerenciador", icon: RefreshCw, color: "text-primary bg-primary/10 border-primary/20", href: "/dashboard/torrents" },
  ];

  // Cálculo da barra de XP (cada nível tem 1000 XP)
  const currentLevelXp = data.profile.xp % 1000;
  const xpPercentage = (currentLevelXp / 1000) * 100;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Cabeçalho de Boas-vindas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}, <span className="text-primary neon-text">{data.profile.username.split(" ")[0]}</span> 🌌
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cofre pessoal descriptografado. Todos os sistemas operacionais e integrados.
          </p>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground bg-card/45 backdrop-blur-xl border border-border/80 rounded-xl px-4 py-2.5 shadow-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span>Último acesso: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>

      {/* Navegação por Abas no Mobile (Otimização de Espaço) */}
      <div className="md:hidden flex bg-card/40 border border-border p-1 rounded-xl gap-1">
        <button
          onClick={() => setActiveMobileTab("general")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeMobileTab === "general" ? "bg-primary text-white shadow-md shadow-primary/10 neon-text-subtle" : "text-muted-foreground"
          }`}
        >
          📦 Painel
        </button>
        <button
          onClick={() => setActiveMobileTab("goals")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeMobileTab === "goals" ? "bg-primary text-white shadow-md shadow-primary/10 neon-text-subtle" : "text-muted-foreground"
          }`}
        >
          🎯 Metas
        </button>
        <button
          onClick={() => setActiveMobileTab("finance")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeMobileTab === "finance" ? "bg-primary text-white shadow-md shadow-primary/10 neon-text-subtle" : "text-muted-foreground"
          }`}
        >
          💳 Banco
        </button>
      </div>

      {/* Grade de Métricas */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${activeMobileTab === "general" ? "grid" : "hidden md:grid"}`}>
        {moduleStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              variants={itemVariants}
              onClick={() => router.push(stat.href)}
              className="group cursor-pointer relative overflow-hidden p-5 bg-card/55 backdrop-blur-xl border border-border hover:border-primary/45 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.01] to-transparent pointer-events-none" />
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </div>
              <div className="mt-4">
                <span className="text-[28px] font-extrabold text-white leading-none tracking-tight">
                  {stat.count}
                </span>
                <h3 className="text-sm font-semibold text-white/95 mt-1">{stat.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.details}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Seções em 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Atividades Recentes, Armazenamento e Integração Financeira */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Atividades Recentes */}
          <motion.div
            variants={itemVariants}
            className={`bg-card/55 backdrop-blur-xl border border-border rounded-2xl p-5 ${activeMobileTab === "general" ? "block" : "hidden md:block"}`}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-primary" />
                <h2 className="text-base font-bold text-white">Atividades & Entradas Recentes</h2>
              </div>
              <span className="text-[10px] text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-md uppercase tracking-wider font-semibold">
                Atualizado
              </span>
            </div>

            <div className="space-y-1">
              {data.recentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(getModuleLink(item.type))}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/40 transition-all cursor-pointer group border border-transparent hover:border-border/60"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                      {getModuleIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate leading-tight group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate leading-none mt-1">
                        {item.type} &bull; {item.details}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap ml-4 shrink-0 flex items-center gap-1">
                    {new Date(item.date).toLocaleDateString("pt-BR", {month: 'short', day: 'numeric'})}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Widget de Integração Bancária */}
          <motion.div
            variants={itemVariants}
            className={`bg-card/55 backdrop-blur-xl border border-border rounded-2xl p-5 ${activeMobileTab === "finance" ? "block" : "hidden md:block"}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4.5 h-4.5 text-primary" />
                <div>
                  <h2 className="text-base font-bold text-white">Sincronização Financeira</h2>
                  <p className="text-xs text-muted-foreground">Mercado Pago & Santander</p>
                </div>
              </div>
              <button
                disabled={isSyncingBank}
                onClick={handleSyncFinancials}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                {isSyncingBank ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Sincronizar Contas
              </button>
            </div>

            {/* Mensagem de Sincronização */}
            <AnimatePresence>
              {isSyncingBank && syncMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-2.5 text-xs text-primary"
                >
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>{syncMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mercado Pago */}
              <div className="relative overflow-hidden p-5 rounded-2xl border border-sky-500/10 bg-gradient-to-br from-sky-950/20 to-sky-900/10 flex flex-col justify-between h-40">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 rounded-lg text-[10px] text-sky-400 font-bold tracking-wide uppercase">
                    Mercado Pago
                  </div>
                  <span className="text-[10px] text-sky-400/70 font-semibold">{data.financialAccounts[0].lastSync}</span>
                </div>
                <div className="mt-4">
                  <span className="text-[26px] font-extrabold text-white leading-none tracking-tight block">
                    {data.financialAccounts[0].balance}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium mt-1 inline-flex items-center gap-1">
                    {data.financialAccounts[0].trend}
                  </span>
                </div>
              </div>

              {/* Santander */}
              <div className="relative overflow-hidden p-5 rounded-2xl border border-red-500/10 bg-gradient-to-br from-red-950/20 to-red-900/10 flex flex-col justify-between h-40">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-400 font-bold tracking-wide uppercase">
                    Santander
                  </div>
                  <span className="text-[10px] text-red-400/70 font-semibold">{data.financialAccounts[1].lastSync}</span>
                </div>
                <div className="mt-4">
                  <span className="text-[26px] font-extrabold text-white leading-none tracking-tight block">
                    {data.financialAccounts[1].balance}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium mt-1 inline-flex items-center gap-1">
                    {data.financialAccounts[1].trend}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Análise de Armazenamento */}
          <motion.div
            variants={itemVariants}
            className={`bg-card/55 backdrop-blur-xl border border-border rounded-2xl p-5 ${activeMobileTab === "general" ? "block" : "hidden md:block"}`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4.5 h-4.5 text-primary" />
                <h2 className="text-base font-bold text-white">Análise de Armazenamento</h2>
              </div>
              <span className="text-xs text-muted-foreground">
                <span className="text-white font-semibold">{data.storageStats.usedSize}</span> de {data.storageStats.totalSize}
              </span>
            </div>

            <div className="w-full h-3.5 bg-muted rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-1000"
                style={{ width: `${data.storageStats.percentUsed}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-muted/30 border border-border/70 rounded-xl">
                <span className="text-[10px] text-muted-foreground block">Cine Vault</span>
                <span className="text-sm font-bold text-white mt-0.5 block">14.8 GB</span>
              </div>
              <div className="p-3 bg-muted/30 border border-border/70 rounded-xl">
                <span className="text-[10px] text-muted-foreground block">Arquivos do Cofre</span>
                <span className="text-sm font-bold text-white mt-0.5 block">36.2 GB</span>
              </div>
              <div className="p-3 bg-muted/30 border border-border/70 rounded-xl">
                <span className="text-[10px] text-muted-foreground block">Papéis de Parede</span>
                <span className="text-sm font-bold text-white mt-0.5 block">2.6 GB</span>
              </div>
              <div className="p-3 bg-muted/30 border border-border/70 rounded-xl">
                <span className="text-[10px] text-muted-foreground block">Backups do Sistema</span>
                <span className="text-sm font-bold text-white mt-0.5 block">0.2 GB</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Lado Direito: Gamificação (Nível/XP), Metas, Atalhos e Favoritos */}
        <div className="space-y-6">
          
          {/* Card de Gamificação / XP */}
          <motion.div
            variants={itemVariants}
            className={`relative overflow-hidden bg-card/55 backdrop-blur-xl border border-border rounded-2xl p-5 bg-gradient-to-br from-primary/5 via-transparent to-transparent neon-glow ${activeMobileTab === "goals" ? "block" : "hidden md:block"}`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Trophy className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Nível de Acesso</h2>
                <p className="text-xs text-muted-foreground">Cumpra metas para ganhar XP</p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex justify-between items-end text-xs">
                <span className="font-extrabold text-primary text-sm">Nível {data.profile.level}</span>
                <span className="text-muted-foreground font-semibold">{currentLevelXp} / 1000 XP</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 rounded-full"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground/80 block text-right">
                Total acumulado: {data.profile.xp} XP
              </span>
            </div>
          </motion.div>

          {/* Sistema de Metas */}
          <motion.div
            variants={itemVariants}
            className={`bg-card/55 backdrop-blur-xl border border-border rounded-2xl p-5 ${activeMobileTab === "goals" ? "block" : "hidden md:block"}`}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-primary" />
                Minhas Metas
              </h2>
              <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md font-semibold">
                {data.goals.filter((g) => g.isCompleted).length}/{data.goals.length} Concluídas
              </span>
            </div>

            {/* Listagem de Metas */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {data.goals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      goal.isCompleted
                        ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-100/50"
                        : "bg-muted/30 border-border/50 text-white/90"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleGoal(goal.id, goal.isCompleted)}
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
                      >
                        {goal.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <span className={`text-xs font-semibold truncate ${goal.isCompleted ? "line-through opacity-60" : ""}`}>
                        {goal.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        goal.isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-primary/10 text-primary"
                      }`}>
                        +{goal.xpReward} XP
                      </span>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-muted-foreground/60 hover:text-destructive p-1 rounded hover:bg-muted/80 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {data.goals.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">Nenhuma meta cadastrada.</p>
              )}
            </div>

            {/* Formulário para Nova Meta */}
            <form onSubmit={handleAddGoal} className="mt-4 pt-3 border-t border-border/60 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nova meta..."
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-muted/50 border border-border hover:border-border-hover focus:border-primary rounded-xl text-white outline-none transition-all"
                  required
                />
                <select
                  value={newGoalXp}
                  onChange={(e) => setNewGoalXp(Number(e.target.value))}
                  className="px-2 py-2 text-xs bg-muted/50 border border-border rounded-xl text-white outline-none cursor-pointer transition-all"
                >
                  <option value={50}>50 XP</option>
                  <option value={100}>100 XP</option>
                  <option value={150}>150 XP</option>
                  <option value={200}>200 XP</option>
                </select>
                <button
                  type="submit"
                  disabled={isAddingGoal}
                  className="px-3 bg-primary hover:bg-primary/95 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                >
                  {isAddingGoal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Atalhos Rápidos */}
          <motion.div
            variants={itemVariants}
            className={`bg-card/55 backdrop-blur-xl border border-border rounded-2xl p-5 ${activeMobileTab === "goals" ? "block" : "hidden md:block"}`}
          >
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4.5 h-4.5 text-primary" />
              Atalhos Rápidos
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => router.push("/dashboard/notes?new=true")}
                className="flex items-center gap-2 p-3 bg-muted/40 hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border rounded-xl text-xs font-semibold transition-all cursor-pointer justify-start"
              >
                <Plus className="w-3.5 h-3.5" />
                Criar Nota
              </button>
              <button
                onClick={() => router.push("/dashboard/passwords?generate=true")}
                className="flex items-center gap-2 p-3 bg-muted/40 hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border rounded-xl text-xs font-semibold transition-all cursor-pointer justify-start"
              >
                <Key className="w-3.5 h-3.5" />
                Nova Senha
              </button>
              <button
                onClick={() => router.push("/dashboard/torrents")}
                className="flex items-center gap-2 p-3 bg-muted/40 hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border rounded-xl text-xs font-semibold transition-all cursor-pointer justify-start"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Add Torrent
              </button>
              <button
                onClick={() => router.push("/dashboard/files")}
                className="flex items-center gap-2 p-3 bg-muted/40 hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border rounded-xl text-xs font-semibold transition-all cursor-pointer justify-start"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Enviar Arquivo
              </button>
            </div>
          </motion.div>

          {/* Histórico de Log de Segurança */}
          <motion.div
            variants={itemVariants}
            className={`bg-card/55 backdrop-blur-xl border border-border rounded-2xl p-5 ${activeMobileTab === "finance" ? "block" : "hidden md:block"}`}
          >
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-primary" />
              Operações do Cofre
            </h2>

            <div className="space-y-3.5 relative before:absolute before:inset-y-0.5 before:left-2 before:w-[1px] before:bg-border/60">
              {data.activityLog.map((log) => (
                <div key={log.id} className="flex items-start gap-3 pl-5 relative">
                  <div className={`absolute left-1 w-2.5 h-2.5 rounded-full border border-card ${
                    log.status === "success" ? "bg-emerald" : log.status === "warning" ? "bg-amber" : "bg-primary"
                  }`} />
                  <div className="min-w-0">
                    <p className="text-xs text-white/90 leading-normal">{log.text}</p>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Favoritos */}
          <motion.div
            variants={itemVariants}
            className={`bg-card/55 backdrop-blur-xl border border-border rounded-2xl p-5 ${activeMobileTab === "general" ? "block" : "hidden md:block"}`}
          >
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-4.5 h-4.5 text-primary fill-primary/10" />
              Itens Favoritos ({data.favorites.length})
            </h2>

            <div className="space-y-2">
              {data.favorites.length > 0 ? (
                data.favorites.map((fav) => (
                  <div
                    key={fav.id}
                    onClick={() => router.push(getModuleLink(fav.type))}
                    className="flex items-center gap-2.5 p-2 bg-muted/30 hover:bg-muted/50 rounded-xl cursor-pointer transition-colors border border-border/40"
                  >
                    {getModuleIcon(fav.type)}
                    <span className="text-xs font-semibold text-white/90 truncate flex-1">{fav.title}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum favorito selecionado.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

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
      {/* Cabeçalho de Boas-vindas (Compacto & Cockpit) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h1 className="font-display text-sm tracking-widest text-white leading-tight flex items-center gap-2">
            <span>{getGreeting()}</span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">
              {data.profile.username.split(" ")[0].toUpperCase()}
            </span>
            <span className="text-[10px] bg-primary/10 border border-primary/20 px-1 py-0.5 rounded text-primary">⚡ COCKPIT</span>
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">
            Cofre Criptografado &bull; Sistemas Integrados
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80 bg-muted/30 border border-border/60 rounded-xl px-3 py-1.5 shrink-0">
          <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>Último Acesso: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>

      {/* Navegação por Abas no Mobile (Otimização de Espaço) */}
      <div className="md:hidden flex bg-card/40 border border-border/50 p-1 rounded-lg gap-1">
        <motion.button
          onClick={() => setActiveMobileTab("general")}
          whileTap={{ scale: 0.94 }}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
            activeMobileTab === "general" ? "bg-primary text-white shadow-sm" : "text-muted-foreground"
          }`}
        >
          PAINEL
        </motion.button>
        <motion.button
          onClick={() => setActiveMobileTab("goals")}
          whileTap={{ scale: 0.94 }}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
            activeMobileTab === "goals" ? "bg-primary text-white shadow-sm" : "text-muted-foreground"
          }`}
        >
          METAS
        </motion.button>
        <motion.button
          onClick={() => setActiveMobileTab("finance")}
          whileTap={{ scale: 0.94 }}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
            activeMobileTab === "finance" ? "bg-primary text-white shadow-sm" : "text-muted-foreground"
          }`}
        >
          BANCO
        </motion.button>
      </div>

      {/* Grade de Métricas Compacta (Horizontal) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${activeMobileTab === "general" ? "grid" : "hidden md:grid"}`}>
        {moduleStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              variants={itemVariants}
              onClick={() => router.push(stat.href)}
              whileTap={{ scale: 0.97 }}
              className="group cursor-pointer relative overflow-hidden p-3 bg-card-cockpit flex items-center justify-between border border-primary/20 rounded-xl hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg border ${stat.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-white/95 group-hover:text-primary transition-colors leading-tight truncate">{stat.name}</h3>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">{stat.details}</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <span className="font-display text-sm font-bold text-white group-hover:text-primary transition-colors">
                  {stat.count}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Seções em 2 Colunas (Cockpit Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Lado Esquerdo: Atividades Recentes, Armazenamento e Integração Financeira */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Atividades Recentes */}
          <motion.div
            variants={itemVariants}
            className={`card-cockpit ${activeMobileTab === "general" ? "block" : "hidden md:block"}`}
          >
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-display text-white">Atividades Recentes</h2>
              </div>
              <span className="text-[8px] text-muted-foreground bg-muted/60 border border-border px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Console Ativo
              </span>
            </div>

            <div className="space-y-0.5">
              {data.recentItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(getModuleLink(item.type))}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-all cursor-pointer group border border-transparent hover:border-border/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded bg-card border border-border flex items-center justify-center shrink-0">
                      {getModuleIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate leading-none mt-0.5">
                        {item.type} &bull; {item.details}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold whitespace-nowrap ml-4 shrink-0 flex items-center gap-0.5">
                    {new Date(item.date).toLocaleDateString("pt-BR", {month: "short", day: "numeric"})}
                    <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Widget de Integração Bancária */}
          <motion.div
            variants={itemVariants}
            className={`card-cockpit ${activeMobileTab === "finance" ? "block" : "hidden md:block"}`}
          >
            <div className="flex items-center justify-between gap-4 mb-3 pb-2 border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-primary" />
                <div>
                  <h2 className="text-xs font-display text-white">Sincronização Bancária</h2>
                </div>
              </div>
              <button
                disabled={isSyncingBank}
                onClick={handleSyncFinancials}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white rounded-lg text-[9px] font-bold btn-3d-pink cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSyncingBank ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Sincronizar
              </button>
            </div>

            {/* Mensagem de Sincronização */}
            <AnimatePresence>
              {isSyncingBank && syncMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-3 p-2 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-2 text-[10px] text-primary"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span>{syncMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Mercado Pago */}
              <div className="relative overflow-hidden p-3 rounded-xl border border-sky-500/20 bg-sky-950/10 flex items-center justify-between h-14">
                <div className="flex items-center gap-2">
                  <div className="px-1.5 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded text-[8px] text-sky-400 font-bold uppercase tracking-wider">
                    MP
                  </div>
                  <span className="text-xs text-white font-bold">{data.financialAccounts[0].balance}</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-sky-400/70 block leading-tight">{data.financialAccounts[0].lastSync.split(" às ")[1] || "Sinc."}</span>
                  <span className="text-[9px] text-emerald-400 font-semibold leading-tight">{data.financialAccounts[0].trend}</span>
                </div>
              </div>

              {/* Santander */}
              <div className="relative overflow-hidden p-3 rounded-xl border border-red-500/20 bg-red-950/10 flex items-center justify-between h-14">
                <div className="flex items-center gap-2">
                  <div className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[8px] text-red-400 font-bold uppercase tracking-wider">
                    SAN
                  </div>
                  <span className="text-xs text-white font-bold">{data.financialAccounts[1].balance}</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-red-400/70 block leading-tight">{data.financialAccounts[1].lastSync.split(" às ")[1] || "Sinc."}</span>
                  <span className="text-[9px] text-emerald-400 font-semibold leading-tight">{data.financialAccounts[1].trend}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Análise de Armazenamento */}
          <motion.div
            variants={itemVariants}
            className={`card-cockpit ${activeMobileTab === "general" ? "block" : "hidden md:block"}`}
          >
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-display text-white">Armazenamento</h2>
              </div>
              <span className="text-[10px] text-muted-foreground">
                <span className="text-white font-bold">{data.storageStats.usedSize}</span> / {data.storageStats.totalSize}
              </span>
            </div>

            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
                style={{ width: `${data.storageStats.percentUsed}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2 bg-muted/20 border border-border/40 rounded-lg text-center">
                <span className="text-[9px] text-muted-foreground block leading-tight">Cine Vault</span>
                <span className="text-xs font-bold text-white leading-tight">14.8 GB</span>
              </div>
              <div className="p-2 bg-muted/20 border border-border/40 rounded-lg text-center">
                <span className="text-[9px] text-muted-foreground block leading-tight">Arquivos</span>
                <span className="text-xs font-bold text-white leading-tight">36.2 GB</span>
              </div>
              <div className="p-2 bg-muted/20 border border-border/40 rounded-lg text-center">
                <span className="text-[9px] text-muted-foreground block leading-tight">Wallpapers</span>
                <span className="text-xs font-bold text-white leading-tight">2.6 GB</span>
              </div>
              <div className="p-2 bg-muted/20 border border-border/40 rounded-lg text-center">
                <span className="text-[9px] text-muted-foreground block leading-tight">Backups</span>
                <span className="text-xs font-bold text-white leading-tight">0.2 GB</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Lado Direito: Gamificação (Nível/XP), Metas, Atalhos e Favoritos */}
        <div className="space-y-4">
          
          {/* Card de Gamificação & Metas Fundido */}
          <motion.div
            variants={itemVariants}
            className={`card-cockpit ${activeMobileTab === "goals" ? "block" : "hidden md:block"}`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/50 mb-2">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-primary animate-pulse" />
                <h2 className="text-xs font-display text-white">Central de Metas (Nível {data.profile.level})</h2>
              </div>
              <span className="text-[9px] text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded font-bold font-mono">
                {currentLevelXp}/1000 XP
              </span>
            </div>

            {/* Barra de XP Fina */}
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>

            {/* Listagem de Metas Compacta */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {data.goals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      goal.isCompleted
                        ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-100/50"
                        : "bg-muted/20 border-border/50 text-white/90"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => handleToggleGoal(goal.id, goal.isCompleted)}
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
                      >
                        {goal.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <span className={`text-[11px] font-semibold truncate ${goal.isCompleted ? "line-through opacity-50" : ""}`}>
                        {goal.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${
                        goal.isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-primary/10 text-primary"
                      }`}>
                        +{goal.xpReward} XP
                      </span>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-muted-foreground/60 hover:text-destructive p-0.5 rounded hover:bg-muted/85 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {data.goals.length === 0 && (
                <p className="text-[10px] text-muted-foreground text-center py-4">Sem metas pendentes.</p>
              )}
            </div>

            {/* Formulário para Nova Meta Compacto */}
            <form onSubmit={handleAddGoal} className="mt-3 pt-2 border-t border-border/50 flex gap-1.5">
              <input
                type="text"
                placeholder="Nova meta..."
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-[10px] bg-muted/40 border border-border/80 focus:border-primary rounded-lg text-white outline-none transition-all"
                required
              />
              <select
                value={newGoalXp}
                onChange={(e) => setNewGoalXp(Number(e.target.value))}
                className="px-1 py-1.5 text-[10px] bg-muted/40 border border-border/80 rounded-lg text-white outline-none cursor-pointer"
              >
                <option value={50}>50 XP</option>
                <option value={100}>100 XP</option>
                <option value={150}>150 XP</option>
                <option value={200}>200 XP</option>
              </select>
              <button
                type="submit"
                disabled={isAddingGoal}
                className="px-2 bg-primary hover:bg-primary/95 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 text-[10px] btn-3d-pink font-bold"
              >
                {isAddingGoal ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              </button>
            </form>
          </motion.div>

          {/* Atalhos Rápidos */}
          <motion.div
            variants={itemVariants}
            className={`card-cockpit ${activeMobileTab === "goals" ? "block" : "hidden md:block"}`}
          >
            <h2 className="text-xs font-display text-white mb-2.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Atalhos Rápidos
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => router.push("/dashboard/notes?new=true")}
                className="flex items-center gap-1.5 p-2 bg-muted/20 border border-border rounded-lg text-[9px] font-bold btn-3d-gray cursor-pointer justify-center"
              >
                <Plus className="w-3 h-3 text-primary shrink-0" />
                Criar Nota
              </button>
              <button
                onClick={() => router.push("/dashboard/passwords?generate=true")}
                className="flex items-center gap-1.5 p-2 bg-muted/20 border border-border rounded-lg text-[9px] font-bold btn-3d-gray cursor-pointer justify-center"
              >
                <Key className="w-3 h-3 text-secondary shrink-0" />
                Nova Senha
              </button>
              <button
                onClick={() => router.push("/dashboard/torrents")}
                className="flex items-center gap-1.5 p-2 bg-muted/20 border border-border rounded-lg text-[9px] font-bold btn-3d-gray cursor-pointer justify-center"
              >
                <RefreshCw className="w-3 h-3 text-amber shrink-0" />
                Torrent
              </button>
              <button
                onClick={() => router.push("/dashboard/files")}
                className="flex items-center gap-1.5 p-2 bg-muted/20 border border-border rounded-lg text-[9px] font-bold btn-3d-gray cursor-pointer justify-center"
              >
                <FolderOpen className="w-3 h-3 text-emerald shrink-0" />
                Upload
              </button>
            </div>
          </motion.div>

          {/* Histórico de Log de Operações */}
          <motion.div
            variants={itemVariants}
            className={`card-cockpit ${activeMobileTab === "finance" ? "block" : "hidden md:block"}`}
          >
            <h2 className="text-xs font-display text-white mb-2.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" />
              Operações Recentes
            </h2>

            <div className="space-y-2 relative before:absolute before:inset-y-0.5 before:left-1.5 before:w-[1px] before:bg-border/60">
              {data.activityLog.slice(0, 3).map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 pl-4 relative">
                  <div className={`absolute left-0.5 w-2 h-2 rounded-full border border-card mt-1 ${
                    log.status === "success" ? "bg-emerald-500" : log.status === "warning" ? "bg-amber-400" : "bg-primary"
                  }`} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-white/90 leading-tight font-medium">{log.text}</p>
                    <span className="text-[8px] text-muted-foreground block mt-0.5">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Favoritos */}
          <motion.div
            variants={itemVariants}
            className={`card-cockpit ${activeMobileTab === "general" ? "block" : "hidden md:block"}`}
          >
            <h2 className="text-xs font-display text-white mb-2 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-primary fill-primary/10" />
              Favoritos ({data.favorites.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {data.favorites.length > 0 ? (
                data.favorites.map((fav) => (
                  <div
                    key={fav.id}
                    onClick={() => router.push(getModuleLink(fav.type))}
                    className="flex items-center gap-2 p-1.5 bg-muted/20 hover:bg-muted/40 rounded-lg cursor-pointer transition-colors border border-border/40 min-w-0"
                  >
                    {getModuleIcon(fav.type)}
                    <span className="text-[10px] font-bold text-white/95 truncate flex-1 leading-tight">{fav.title}</span>
                  </div>
                ))
              ) : (
                <p className="text-[9px] text-muted-foreground text-center py-2 col-span-2">Sem favoritos.</p>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}

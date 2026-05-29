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
  ChevronUp,
  ChevronDown,
  Trophy,
  CheckCircle2,
  Circle,
  Trash2,
  RefreshCw,
  CreditCard,
  Check,
  Loader2,
  FileCheck,
  User,
  Settings,
  Info,
  Lock,
  Upload,
  X,
  Code
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
    receipts: number;
    bills: number;
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
    createdBy?: string;
  }>;
  favorites: Array<{
    id: string;
    title: string;
    type: string;
    createdBy?: string;
  }>;
  upcomingBills?: any[];
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
    videosSize?: string;
    docsSize?: string;
    imagesSize?: string;
    othersSize?: string;
  };
}

import { useStatsStore } from "@/stores/statsStore";
import { useDataStore } from "@/stores/dataStore";
import RssTechWidget from "@/components/RssTechWidget";

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading, error, fetchStats, toggleGoal, deleteGoal, addGoal, setSyncStatus } = useStatsStore();
  const { data: devComps, isLoading: isDevLoading } = useDataStore(s => s.dev);

  // Estados locais para interações de metas
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalXp, setNewGoalXp] = useState(100);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  // Estados adicionais para Recompensas
  const [rewards, setRewards] = useState<any[]>([]);
  const [isClaimingReward, setIsClaimingReward] = useState<string | null>(null);



  const fetchRewards = async () => {
    try {
      const res = await fetch("/api/rewards");
      if (res.ok) {
        const rData = await res.json();
        setRewards(rData);
      }
    } catch (err) {
      console.error("Failed to fetch rewards:", err);
    }
  };

  useEffect(() => {
    fetchStats(true);
    fetchRewards();
    useDataStore.getState().fetchDev();
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
        return <Video className="w-4 h-4 text-primary" />;
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
        return "/dashboard/netfrix";
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
      // Otimista local
      toggleGoal(goalId, !currentStatus);

      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar status da meta");
      }
    } catch (err) {
      console.error(err);
      fetchStats(true); // Reverte forçando fetch do banco em caso de erro
    }
  };

  // Excluir meta
  const handleDeleteGoal = async (goalId: string) => {
    if (!data) return;
    try {
      // Otimista local
      deleteGoal(goalId);

      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar meta");
      }
    } catch (err) {
      console.error(err);
      fetchStats(true); // Reverte
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
      addGoal(createdGoal);
      setNewGoalTitle("");
      setNewGoalXp(100);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingGoal(false);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    setIsClaimingReward(rewardId);
    try {
      const res = await fetch(`/api/rewards/${rewardId}/claim`, {
        method: "POST"
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Falha ao resgatar recompensa");
        return;
      }

      const result = await res.json();
      alert(`🎉 Pix resgatado com sucesso!\nFoi gerado um boleto/conta no valor de R$ ${result.bill.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} na aba Contas pendentes para seu parceiro te pagar.`);
      
      // Recarregar os dados
      await fetchRewards();
      await fetchStats(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsClaimingReward(null);
    }
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
        <div className="h-10 w-64 bg-muted/60  rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-card/60 border border-border/80 rounded-2xl " />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-card/60 border border-border/80 rounded-2xl " />
          <div className="h-96 bg-card/60 border border-border/80 rounded-2xl " />
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
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/95 transition-all cursor-pointer font-bold"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const moduleStats = [
    { name: "Senhas", count: data.counts.passwords, details: "Credenciais seguras", icon: Key, color: "text-rose bg-rose/10 border-rose/20", href: "/dashboard/passwords" },
    { name: "Cofre de Arquivos", count: data.counts.files, details: "Arquivos locais", icon: FolderOpen, color: "text-amber bg-amber/10 border-amber/20", href: "/dashboard/files" },
    { name: "Contas Ativas", count: data.counts.bills, details: "Pagar & Receber", icon: CreditCard, color: "text-emerald bg-emerald/10 border-emerald/20", href: "/dashboard/bills" },
    { name: "Comprovantes", count: data.counts.receipts, details: "Recibos salvos", icon: FileCheck, color: "text-primary bg-cyan/10 border-cyan/20", href: "/dashboard/receipts" },
  ];

  // Cálculo da barra de XP (cada nível tem 1000 XP)
  const currentLevelXp = data.profile.xp % 1000;
  const xpPercentage = (currentLevelXp / 1000) * 100;

  if (!data) return null; // Type-guard for compiler safety



  const renderWidgetHeader = (title: string, icon: React.ReactNode, idx: number, extraActions?: React.ReactNode) => {
    return (
      <div className="p-[10px] flex items-center justify-between border-b border-border/40 font-display mb-4">
        <div className="flex items-center gap-4">
          {icon}
          <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider">{title}</h2>
        </div>
        
        <div className="flex items-center gap-5 pointer-events-auto">
          {extraActions}
        </div>
      </div>
    );
  };

  const renderRecentActivities = (idx: number) => {
    if (!data) return null;
    return (
      <motion.div
        layout
        key="recent_activities"
        variants={itemVariants}
        className="glass-panel neon-glow-card lg:col-span-2 block"
      >
        {renderWidgetHeader("Atividades Recentes", <Clock className="w-3.5 h-3.5 text-primary" />, idx, (
          <span className="text-xs text-muted-foreground bg-muted/15 border border-border px-4 py-2 rounded-sm font-bold uppercase tracking-wider font-display">
            Console Ativo
          </span>
        ))}
        <div className="space-y-0.5">
          {data.recentItems.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(getModuleLink(item.type))}
              className="flex items-center justify-between p-4 rounded-sm hover:bg-muted/15 transition-all cursor-pointer group border border-transparent hover:border-border/30"
            >
              <div className="flex items-center gap-5.5 min-w-0">
                <div className="w-6.5 h-6.5 rounded-sm bg-card border border-border flex items-center justify-center shrink-0">
                  {getModuleIcon(item.type)}
                </div>
                <div className="min-w-0 ">
                  <div className="flex items-center gap-5">
                    <p className="text-sm font-bold text-white truncate leading-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    {item.createdBy && (
                      <span className={`user-tag user-tag-${item.createdBy}`}>
                        {item.createdBy === "caio" ? "Caio" : "Giselle"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate leading-none mt-0.5 uppercase tracking-wide font-mono">
                    {item.type} // {item.details}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-semibold whitespace-nowrap ml-4 shrink-0 flex items-center gap-0.5 font-mono">
                {new Date(item.date).toLocaleDateString("pt-BR", {month: "short", day: "numeric"})}
                <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderStorage = (idx: number) => {
    if (!data) return null;
    return (
      <motion.div
        layout
        key="storage"
        variants={itemVariants}
        className="glass-panel neon-glow-card lg:col-span-2 block"
      >
        {renderWidgetHeader("Armazenamento", <HardDrive className="w-3.5 h-3.5 text-primary" />, idx, (
          <span className="text-muted-foreground text-sm font-mono">
            <span className="text-white font-bold">{data.storageStats.usedSize} ({data.storageStats.percentUsed}%)</span> / {data.storageStats.totalSize}
          </span>
        ))}

        <div className="px-[15px] pb-[15px] space-y-4">
          <div className="w-full h-1 bg-muted rounded-none overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
              style={{ width: `${data.storageStats.percentUsed}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 ">
            <div className="p-4 bg-muted/10 border border-border/40 rounded-sm text-center">
              <span className="text-xs text-muted-foreground block leading-tight uppercase font-display">Cine Vault</span>
              <span className="text-xs font-bold text-white leading-tight font-mono">{data.storageStats.videosSize || "0 B"}</span>
            </div>
            <div className="p-4 bg-muted/10 border border-border/40 rounded-sm text-center">
              <span className="text-xs text-muted-foreground block leading-tight uppercase font-display">Arquivos</span>
              <span className="text-xs font-bold text-white leading-tight font-mono">{data.storageStats.docsSize || "0 B"}</span>
            </div>
            <div className="p-4 bg-muted/10 border border-border/40 rounded-sm text-center">
              <span className="text-xs text-muted-foreground block leading-tight uppercase font-display">Imagens</span>
              <span className="text-xs font-bold text-white leading-tight font-mono">{data.storageStats.imagesSize || "0 B"}</span>
            </div>
            <div className="p-4 bg-muted/10 border border-border/40 rounded-sm text-center">
              <span className="text-xs text-muted-foreground block leading-tight uppercase font-display">Outros</span>
              <span className="text-xs font-bold text-white leading-tight font-mono">{data.storageStats.othersSize || "0 B"}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGoals = (idx: number) => {
    if (!data) return null;
    return (
      <motion.div
        layout
        key="goals"
        variants={itemVariants}
        className="glass-panel neon-glow-card lg:col-span-1 block"
      >
        {renderWidgetHeader(`Central de Metas`, <Trophy className="w-3.5 h-3.5 text-primary " />, idx, (
          <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-sm font-bold font-mono">
            {currentLevelXp}/1000 XP
          </span>
        ))}

        <div className="px-[15px] pb-[15px] flex flex-col gap-2.5">
          {/* Barra de XP Fina */}
          <div className="w-full h-1 bg-muted rounded-none overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-none"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>

          {/* Listagem de Metas Compacta */}
          <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {data.goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`flex items-center justify-between p-4 rounded-sm border transition-all ${
                    goal.isCompleted
                      ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-100/50"
                      : "bg-muted/10 border-border/40 text-white/90"
                  }`}
                >
                  <div className="flex items-center gap-5 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleGoal(goal.id, goal.isCompleted)}
                      className="text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
                    >
                      {goal.isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Circle className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className={`text-sm font-bold truncate ${goal.isCompleted ? "line-through opacity-50" : ""}`}>
                      {goal.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-1.5">
                    <span className={`text-[7px] px-1 py-2 rounded-sm font-bold ${
                      goal.isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-primary/10 text-primary"
                    }`}>
                      +{goal.xpReward} XP
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-muted-foreground/60 hover:text-destructive p-0.5 rounded hover:bg-muted/30 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {data.goals.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">Sem metas pendentes.</p>
            )}
          </div>

          {/* Formulário para Nova Meta Compacto */}
          <form onSubmit={handleAddGoal} className="pt-2 border-t border-border/40 flex gap-2">
            <input
              type="text"
              placeholder="Nova meta..."
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              className="flex-1 px-2 py-1 text-xs bg-muted/20 border border-border/80 focus:border-primary rounded-sm text-white outline-none transition-all"
              required
            />
            <select
              value={newGoalXp}
              onChange={(e) => setNewGoalXp(Number(e.target.value))}
              className="px-1 py-1 text-xs bg-muted/20 border border-border/80 rounded-sm text-white outline-none cursor-pointer font-mono"
            >
              <option value={50}>50 XP</option>
              <option value={100}>100 XP</option>
              <option value={150}>150 XP</option>
              <option value={200}>200 XP</option>
            </select>
            <button
              type="submit"
              disabled={isAddingGoal}
              className="px-2 bg-primary hover:bg-primary/95 text-black rounded-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 text-xs glass-btn glass-btn-primary font-bold"
            >
              {isAddingGoal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3 h-3" />}
            </button>
          </form>
        </div>
      </motion.div>
    );
  };

  const renderRewards = (idx: number) => {
    if (!data) return null;
    return (
      <motion.div
        layout
        key="rewards"
        variants={itemVariants}
        className="glass-panel neon-glow-card lg:col-span-1 block"
      >
        {renderWidgetHeader("Baú de Prêmios Pix", <Trophy className="w-3.5 h-3.5 text-primary" />, idx, (
          <span className="text-xs text-muted-foreground uppercase font-bold font-display">
            Co-op Shop
          </span>
        ))}

        <div className="px-[15px] pb-[15px]">
          <p className="text-[9.5px] text-muted-foreground leading-tight mb-2.5">
            Troque seu XP acumulado por Pix reais pagos pelo seu parceiro! O resgate gera automaticamente uma cobrança pendente.
          </p>

          <div className="space-y-2">
            {rewards.map((reward) => {
              const canClaim = data.profile.xp >= reward.costXp && reward.status === "disponivel";
              const isClaimed = reward.status === "resgatado";
              
              return (
                <div
                  key={reward.id}
                  className={`p-5 border rounded-sm flex items-center justify-between gap-3 transition-colors ${
                    isClaimed
                      ? "bg-muted/5 border-border/20 opacity-60"
                      : canClaim
                      ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                      : "bg-card/30 border-border/40"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-extrabold text-white leading-tight">{reward.title}</span>
                      {isClaimed && (
                        <span className="text-[7px] px-1 py-0.2 bg-primary/10 border border-primary/20 text-primary rounded-sm font-mono uppercase shrink-0">
                          Resgatado por {reward.claimedBy === "caio" ? "Caio" : "Giselle"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-5 mt-0.5 text-[8.5px] text-muted-foreground leading-none">
                      <span>Valor: <strong className="text-emerald-400 font-mono font-bold">R$ {reward.amount.toFixed(2)}</strong></span>
                      <span>•</span>
                      <span>Custo: <strong className="text-primary font-mono font-bold">{reward.costXp} XP</strong></span>
                    </div>
                  </div>

                  {!isClaimed && (
                    <button
                      type="button"
                      onClick={() => handleClaimReward(reward.id)}
                      disabled={!canClaim || isClaimingReward !== null}
                      className={`px-2.5 py-1 rounded-sm text-xs font-black uppercase tracking-wider shrink-0 cursor-pointer transition-colors ${
                        canClaim
                          ? "bg-primary text-black hover:bg-primary/90"
                          : "bg-muted/20 border border-border text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {isClaimingReward === reward.id ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      ) : (
                        "Resgatar"
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderShortcuts = (idx: number) => {
    if (!data) return null;
    return (
      <motion.div
        layout
        key="shortcuts"
        variants={itemVariants}
        className="glass-panel neon-glow-card lg:col-span-1 block"
      >
        {renderWidgetHeader("Atalhos Rápidos", <Zap className="w-3 h-3 text-primary" />, idx)}
        
        <div className="grid grid-cols-2 gap-2 px-[15px] pb-[15px]">
          <button
            type="button"
            onClick={() => router.push("/dashboard/notes?new=true")}
            className="flex items-center gap-1.5 p-2.5 bg-muted/15 border border-border rounded-lg text-xs font-bold glass-btn cursor-pointer justify-center h-[50px] !p-2.5"
          >
            <Plus className="w-3 h-3 text-primary shrink-0" />
            Criar Nota
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/passwords?generate=true")}
            className="flex items-center gap-1.5 p-2.5 bg-muted/15 border border-border rounded-lg text-xs font-bold glass-btn cursor-pointer justify-center h-[50px] !p-2.5"
          >
            <Key className="w-3 h-3 text-secondary shrink-0" />
            Nova Senha
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/torrents")}
            className="flex items-center gap-1.5 p-2.5 bg-muted/15 border border-border rounded-lg text-xs font-bold glass-btn cursor-pointer justify-center h-[50px] !p-2.5"
          >
            <RefreshCw className="w-3 h-3 text-amber shrink-0" />
            Torrent
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/files")}
            className="flex items-center gap-1.5 p-2.5 bg-muted/15 border border-border rounded-lg text-xs font-bold glass-btn cursor-pointer justify-center h-[50px] !p-2.5"
          >
            <FolderOpen className="w-3 h-3 text-emerald shrink-0" />
            Upload
          </button>
        </div>
      </motion.div>
    );
  };

  const renderDevComponents = (idx: number) => {
    return (
      <motion.div
        layout
        key="dev_components_widget"
        variants={itemVariants}
        className="glass-panel neon-glow-card lg:col-span-1 block"
      >
        {renderWidgetHeader("Biblioteca de Componentes", <Code className="w-3.5 h-3.5 text-primary" />, idx, (
          <Link href="/dashboard/dev" className="text-xs text-primary hover:underline font-bold font-mono">
            Ver Todos
          </Link>
        ))}
        <div className="px-[15px] pb-[15px] space-y-4">
          <p className="text-[10px] text-muted-foreground leading-tight">
            Seus botões e trechos de código interativos salvos na DEV Central. Toque neles para testar!
          </p>
          <div className="flex flex-wrap gap-4 items-center justify-center min-h-[60px] bg-black/20 rounded-xl p-3 border border-white/5 relative overflow-hidden">
            {isDevLoading ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : devComps.length > 0 ? (
              devComps.slice(0, 3).map((comp) => {
                const isDownloadBtn = comp.title.toLowerCase().includes("download");
                const is3dBtn = comp.title.toLowerCase().includes("3d");

                if (isDownloadBtn) {
                  return (
                    <div key={comp.id} className="relative group/btn scale-90 cursor-pointer" onClick={() => alert("Download iniciado (simulado)!")}>
                      <button className="dev-btn-download pointer-events-none">
                        <svg className="svgIcon" viewBox="0 0 384 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                          <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path>
                        </svg>
                        <span className="icon2"></span>
                        <span className="tooltip">{comp.title}</span>
                      </button>
                    </div>
                  );
                }

                if (is3dBtn) {
                  return (
                    <div key={comp.id} className="scale-90 h-12 flex items-center justify-center pt-2">
                      <button type="button" className="dev-btn-3d" onClick={() => alert("3D Click!")}>
                        <div className="dev-btn-3d-top">Click me!</div>
                        <div className="dev-btn-3d-bottom"></div>
                        <div className="dev-btn-3d-base"></div>
                      </button>
                    </div>
                  );
                }

                return (
                  <button
                    key={comp.id}
                    onClick={() => alert(`Componente "${comp.title}" clicado!`)}
                    className="px-3.5 py-1.5 rounded-xl bg-secondary/80 hover:bg-secondary text-primary border border-border/80 hover:border-primary/30 text-xs font-bold transition-all"
                  >
                    {comp.title}
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground/60 text-center py-2">Sem componentes salvos.</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderOperations = (idx: number) => {
    if (!data) return null;
    return (
      <motion.div
        layout
        key="operations"
        variants={itemVariants}
        className="glass-panel neon-glow-card lg:col-span-1 block"
      >
        {renderWidgetHeader("Operações Recentes", <Activity className="w-3 h-3 text-primary" />, idx)}

        <div className="px-[15px] pb-[15px]">
          <div className="space-y-1.5 relative before:absolute before:inset-y-0.5 before:left-1.5 before:w-[1px] before:bg-border/40 text-xs">
          {data.activityLog.slice(0, 3).map((log) => (
            <div key={log.id} className="flex items-start gap-5.5 pl-3.5 relative">
              <div className={`absolute left-[3px] w-1.5 h-1.5 border border-card mt-1 ${
                log.status === "success" ? "bg-emerald-500" : log.status === "warning" ? "bg-amber-400" : "bg-primary"
              }`} />
              <div className="min-w-0">
                <p className="text-sm text-white/95 leading-tight font-bold">{log.text}</p>
                <span className="text-xs text-muted-foreground block mt-0.5 font-mono">{log.time}</span>
              </div>
            </div>
          ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderFavorites = (idx: number) => {
    if (!data) return null;
    return (
      <motion.div
        layout
        key="favorites"
        variants={itemVariants}
        className="glass-panel neon-glow-card lg:col-span-1 block"
      >
        {renderWidgetHeader(`Favoritos (${data.favorites.length})`, <Star className="w-3 h-3 text-primary fill-primary/10" />, idx)}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-[15px] pb-[15px]">
          {data.favorites.length > 0 ? (
            data.favorites.map((fav) => (
              <div
                key={fav.id}
                onClick={() => router.push(getModuleLink(fav.type))}
                className="flex items-center gap-4 p-4 bg-muted/10 hover:bg-muted/20 rounded-sm cursor-pointer transition-colors border border-border/40 min-w-0"
              >
                {getModuleIcon(fav.type)}
                <span className="text-xs font-bold text-white/95 truncate flex-1 leading-tight flex items-center justify-between gap-4">
                  <span className="truncate">{fav.title}</span>
                  {fav.createdBy && (
                    <span className={`user-tag user-tag-${fav.createdBy} shrink-0`}>
                      {fav.createdBy === "caio" ? "Caio" : "Giselle"}
                    </span>
                  )}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2 col-span-2">Sem favoritos.</p>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >






      {/* Grade de Métricas Compacta (Horizontal) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 grid">
        {moduleStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              variants={itemVariants}
              onClick={() => router.push(stat.href)}
              whileTap={{ scale: 0.97 }}
              className="group cursor-pointer relative overflow-hidden p-3 h-[60px] glass-panel neon-glow-card flex items-center justify-between border border-primary/10 rounded-sm hover:border-primary/45 transition-colors"
            >
              <div className="flex items-center gap-5 min-w-0">
                <div className={`p-4 rounded-sm border ${stat.color} shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-display font-semibold text-white/95 group-hover:text-primary transition-colors leading-tight truncate">{stat.name}</h3>
                  <p className="text-xs  text-muted-foreground leading-tight mt-0.5 truncate">{stat.details}</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className=" text-base font-bold text-white group-hover:text-primary transition-colors">
                  {stat.count}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Seções em 2 Colunas (Cockpit Grid) - Organizado e Linear */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Coluna da Esquerda (Largura 2) - Principais Módulos */}
        <div className="lg:col-span-2 space-y-4">
          {renderRecentActivities(0)}
          {renderStorage(2)}
        </div>

        {/* Coluna da Direita (Largura 1) - Atalhos, Util e Info */}
        <div className="space-y-4">
          {renderShortcuts(5)}
          {renderDevComponents(6)}
          <RssTechWidget
            key="rss_tech"
            idx={7}
            renderHeader={renderWidgetHeader}
            itemVariants={itemVariants}
          />
          {renderOperations(8)}
          {renderFavorites(9)}
        </div>
      </div>
    </motion.div>
  );
}

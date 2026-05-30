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
  Code,
  Bell
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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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
    { name: "Senhas", count: data.counts.passwords, details: "Credenciais seguras", icon: Key, color: "text-rose-500 bg-rose-500/10 border-rose-500/30", href: "/dashboard/passwords" },
    { name: "Cofre de Arquivos", count: data.counts.files, details: "Arquivos locais", icon: FolderOpen, color: "text-amber-500 bg-amber-500/10 border-amber-500/30", href: "/dashboard/files" },
    { name: "Contas Ativas", count: data.counts.bills, details: "Pagar & Receber", icon: CreditCard, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30", href: "/dashboard/bills" },
    { name: "Comprovantes", count: data.counts.receipts, details: "Recibos salvos", icon: FileCheck, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30", href: "/dashboard/receipts" },
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
        className="nexus-card min-w-[280px] h-fit max-h-[500px] overflow-y-auto flex flex-col lg:col-span-2 relative group/panel overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover/panel:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
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
              className="flex items-center justify-between p-4 bg-white/5 rounded-[6px] hover:bg-white/10 transition-all cursor-pointer group border border-transparent hover:border-border/30 relative z-10"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                {item.createdBy ? (
                  <img src={item.createdBy === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} alt={item.createdBy} className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10 bg-black" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
                    {getModuleIcon(item.type)}
                  </div>
                )}
                <div className="min-w-0 ">
                  <p className="text-sm font-bold text-white truncate leading-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate leading-none mt-1 uppercase tracking-wide font-mono flex items-center gap-1.5">
                    {getModuleIcon(item.type)} <span>{item.type} // {item.details}</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold whitespace-nowrap ml-2 sm:ml-4 shrink-0 hidden sm:flex items-center gap-0.5 font-mono">
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
        className="nexus-card min-w-[280px] h-fit max-h-[500px] overflow-y-auto flex flex-col lg:col-span-2 relative group/panel overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover/panel:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
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
            <div className="p-3 bg-muted/10 border border-border/40 rounded-sm text-center">
              <span className="text-xs text-muted-foreground block leading-tight uppercase font-display">Cine Vault</span>
              <span className="text-xs font-bold text-white leading-tight font-mono">{data.storageStats.videosSize || "0 B"}</span>
            </div>
            <div className="p-3 bg-muted/10 border border-border/40 rounded-sm text-center">
              <span className="text-xs text-muted-foreground block leading-tight uppercase font-display">Arquivos</span>
              <span className="text-xs font-bold text-white leading-tight font-mono">{data.storageStats.docsSize || "0 B"}</span>
            </div>
            <div className="p-3 bg-muted/10 border border-border/40 rounded-sm text-center">
              <span className="text-xs text-muted-foreground block leading-tight uppercase font-display">Imagens</span>
              <span className="text-xs font-bold text-white leading-tight font-mono">{data.storageStats.imagesSize || "0 B"}</span>
            </div>
            <div className="p-3 bg-muted/10 border border-border/40 rounded-sm text-center">
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
        className="nexus-card h-full flex flex-col lg:col-span-1 relative group/panel overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover/panel:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
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
                  className={`flex items-center justify-between p-4 rounded-[6px] border transition-all relative z-10 ${
                    goal.isCompleted
                      ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-100/50"
                      : "bg-white/5 border-border/40 text-white/90 hover:bg-white/10"
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
        className="nexus-card h-full flex flex-col lg:col-span-1 relative group/panel overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover/panel:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
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
                  className={`p-5 border rounded-[6px] flex items-center justify-between gap-3 transition-colors relative z-10 ${
                    isClaimed
                      ? "bg-muted/5 border-border/20 opacity-60"
                      : canClaim
                      ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                      : "bg-white/5 border-border/40 hover:bg-white/10"
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
        className="nexus-card min-w-[280px] h-fit max-h-[500px] overflow-y-auto flex flex-col lg:col-span-1 relative group/panel overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover/panel:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
        {renderWidgetHeader("Atalhos Rápidos", <Zap className="w-3 h-3 text-primary" />, idx)}
        
        <div className="grid grid-cols-2 gap-2 px-[15px] pb-[15px]">
          <button
            type="button"
            onClick={() => router.push("/dashboard/notes?new=true")}
            className="flex items-center gap-1.5 p-2 sm:p-2.5 bg-muted/15 border border-border rounded-lg text-xs font-bold glass-btn cursor-pointer justify-center h-[42px] sm:h-[50px]"
          >
            <Plus className="w-3 h-3 text-primary shrink-0" />
            Criar Nota
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/passwords?generate=true")}
            className="flex items-center gap-1.5 p-2 sm:p-2.5 bg-muted/15 border border-border rounded-lg text-xs font-bold glass-btn cursor-pointer justify-center h-[42px] sm:h-[50px]"
          >
            <Key className="w-3 h-3 text-secondary shrink-0" />
            Nova Senha
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/torrents")}
            className="flex items-center gap-1.5 p-2 sm:p-2.5 bg-muted/15 border border-border rounded-lg text-xs font-bold glass-btn cursor-pointer justify-center h-[42px] sm:h-[50px]"
          >
            <RefreshCw className="w-3 h-3 text-amber shrink-0" />
            Torrent
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/files")}
            className="flex items-center gap-1.5 p-2 sm:p-2.5 bg-muted/15 border border-border rounded-lg text-xs font-bold glass-btn cursor-pointer justify-center h-[42px] sm:h-[50px]"
          >
            <FolderOpen className="w-3 h-3 text-emerald shrink-0" />
            Upload
          </button>
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
        className="nexus-card min-w-[280px] h-fit max-h-[500px] overflow-y-auto flex flex-col lg:col-span-1 relative group/panel overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover/panel:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
        {renderWidgetHeader("Operações Recentes", <Activity className="w-3 h-3 text-primary" />, idx)}

        <div className="px-[15px] pb-[15px]">
          <div className="space-y-1.5 relative before:absolute before:inset-y-0.5 before:left-1.5 before:w-[1px] before:bg-border/40 text-xs">
          {data.activityLog.slice(0, 3).map((log) => (
            <div key={log.id} className="flex items-start gap-5.5 pl-3.5 relative">
              <div className={`absolute left-[3px] w-1.5 h-1.5 border border-card mt-1 ${
                log.status === "success" ? "bg-emerald-500" : log.status === "warning" ? "bg-amber-400" : "bg-primary"
              }`} />
              <div className="min-w-0 bg-white/5 p-2.5 rounded-[6px] relative z-10 w-full hover:bg-white/10 transition-colors">
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
        className="nexus-card min-w-[280px] h-fit max-h-[500px] overflow-y-auto flex flex-col lg:col-span-1 relative group/panel overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover/panel:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
        {renderWidgetHeader(`Favoritos (${data.favorites.length})`, <Star className="w-3 h-3 text-primary fill-primary/10" />, idx)}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-[15px] pb-[15px]">
          {data.favorites.length > 0 ? (
            data.favorites.map((fav) => (
              <div
                key={fav.id}
                onClick={() => router.push(getModuleLink(fav.type))}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-[6px] cursor-pointer transition-colors border border-border/40 min-w-0 relative z-10 group"
              >
                {fav.createdBy ? (
                  <img src={fav.createdBy === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} alt={fav.createdBy} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 border border-white/10 bg-black" />
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
                    {getModuleIcon(fav.type)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-bold text-white/95 truncate block group-hover:text-primary transition-colors">{fav.title}</span>
                </div>
                <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                  {getModuleIcon(fav.type)}
                </div>
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

      {/* 🔮 Spatial Hero Header */}
      <motion.div variants={itemVariants} className="glass-panel min-w-[280px] p-5 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8 relative overflow-hidden group mb-4 sm:mb-8 border-none bg-black/40 -mx-3 -mt-4 sm:mx-0 sm:mt-0 !rounded-none sm:!rounded-2xl">
        
        {data?.profile?.coverImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-70 mix-blend-screen"
            style={{ backgroundImage: `url(${data.profile.coverImage})` }}
          />
        )}
        
        {/* Efeito de Vinheta 3D (Bordas escuras) */}
        <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.9)_100%)] pointer-events-none z-0" />
        
        {!data?.profile?.coverImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none z-0" />
        )}
        
        <div className="flex flex-col md:flex-row items-center gap-5 sm:gap-8 z-10 w-full md:w-auto">
          <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-full border border-white/20 overflow-hidden shrink-0 shadow-[0_0_40px_rgba(255,255,255,0.1)] relative group-hover:scale-105 transition-transform duration-500">
            <img src={data?.profile?.username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} className="w-full h-full object-cover" alt="User" />
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight flex flex-col">
              <span className="text-sm sm:text-lg md:text-xl text-white/50 font-medium mb-1">Bem-vindo(a) de volta,</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{data?.profile?.username || 'Usuário'}</span>
            </h1>
            
            <div className="mt-4 sm:mt-6 max-w-md w-full mx-auto md:mx-0">
               {/* XP Bar */}
               <div className="flex justify-between text-[10px] sm:text-xs font-mono text-white/60 mb-1.5 sm:mb-2">
                  <span>Nível {data?.profile?.level || 1}</span>
                  <span className="text-primary font-bold">{currentLevelXp}/1000 XP</span>
               </div>
               <div className="w-full h-1 sm:h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000" style={{ width: `${xpPercentage}%` }} />
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grade de Métricas Compacta (Horizontal) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {moduleStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              variants={itemVariants}
              onClick={() => router.push(stat.href)}
              whileTap={{ scale: 0.97 }}
              className="nexus-card group cursor-pointer relative overflow-hidden p-3 sm:p-4 h-auto min-h-[60px] sm:min-h-[70px] flex items-center justify-between border border-primary/10 hover:border-primary/45 transition-colors"
            >
              {/* Glow Effects */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-primary/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="flex items-center gap-3 sm:gap-4 min-w-0 relative z-10">
                <div className={`p-2.5 sm:p-3.5 rounded-xl border ${stat.color} shrink-0 bg-black/40 shadow-inner`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-display font-semibold text-white/95 group-hover:text-primary transition-colors leading-tight truncate">{stat.name}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight mt-0.5 truncate hidden sm:block">{stat.details}</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2 relative z-10">
                <span className="text-base sm:text-lg font-black text-white group-hover:text-primary transition-colors font-mono">
                  {stat.count}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Seções em 2 Colunas (Cockpit Grid) - Organizado e Linear */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Coluna da Esquerda (Largura 2) - Principais Módulos */}
        <div className="lg:col-span-2 space-y-4">
          {renderRecentActivities(0)}
          {renderStorage(2)}
        </div>

        {/* Coluna da Direita (Largura 1) - Atalhos, Util e Info */}
        <div className="space-y-4">
          {renderShortcuts(5)}
          
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

      {/* Notifications Modal */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              onClick={() => setIsNotificationsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-panel p-6 flex flex-col z-10 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Bell className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Notificações</h2>
                </div>
                <button onClick={() => setIsNotificationsOpen(false)} className="text-white/50 hover:text-white transition-colors cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-none">
                {[
                  { id: 1, title: 'Nova Meta Adicionada', desc: 'Sua meta foi criada.', time: 'Agora mesmo', read: false },
                  { id: 2, title: 'Atualização do Sistema', desc: 'Nexus Vault v2.0 disponível.', time: 'Há 2 horas', read: false },
                  { id: 3, title: 'Backup Concluído', desc: 'Seu cofre foi salvo com sucesso.', time: 'Ontem', read: false }
                ].map((notif) => (
                  <div key={notif.id} className={`p-4 rounded-xl border ${notif.read ? 'bg-white/5 border-white/10' : 'bg-primary/10 border-primary/30'} flex flex-col gap-1`}>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white text-sm">{notif.title}</span>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-primary mt-1"></span>}
                    </div>
                    <span className="text-white/60 text-xs">{notif.desc}</span>
                    <span className="text-white/40 text-[10px] mt-1 font-mono">{notif.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

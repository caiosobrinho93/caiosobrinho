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
  X
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
import RssTechWidget from "@/components/RssTechWidget";

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading, error, fetchStats, toggleGoal, deleteGoal, addGoal, setSyncStatus } = useStatsStore();

  // Estados locais para interações de metas
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalXp, setNewGoalXp] = useState(100);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"general" | "finance">("general");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("activeMobileTab");
        if (saved && (saved === "general" || saved === "finance")) {
          setActiveMobileTab(saved as any);
        }
      } catch (err) {
        console.warn("sessionStorage is not available:", err);
      }
    }
  }, []);

  const changeMobileTab = (tab: "general" | "finance") => {
    setActiveMobileTab(tab);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("activeMobileTab", tab);
      } catch (err) {
        console.warn("sessionStorage is not available:", err);
      }
    }
  };

  // Estados locais para sincronização e gerenciamento de contas bancárias reais
  const [isSyncingBank, setIsSyncingBank] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [selectedAccountForSync, setSelectedAccountForSync] = useState<any>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState<string | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Formulario de Nova Conta
  const [accountProvider, setAccountProvider] = useState("Nubank");
  const [accountBalance, setAccountBalance] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountSyncType, setAccountSyncType] = useState("manual");
  const [accountApiKey, setAccountApiKey] = useState("");
  const [accountApiSecret, setAccountApiSecret] = useState("");

  // Dados de upload OFX/CSV
  const [syncFileContent, setSyncFileContent] = useState("");
  const [syncFileName, setSyncFileName] = useState("");
  const [syncFileType, setSyncFileType] = useState("ofx");
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Estados adicionais para Recompensas e Opções Avançadas
  const [showAdvancedNewAccount, setShowAdvancedNewAccount] = useState(false);
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

  // Sincronizar contas bancárias (Real com OFX / Open Finance)
  const handleSyncFinancials = async (accId: string, type: string, extraData?: any) => {
    setIsSyncingBank(true);
    setSyncLogs([]);
    setSyncMessage("Iniciando processo de sincronização segura...");
    
    // Logs de interface visual
    const addLog = (msg: string) => {
      setSyncLogs(prev => [...prev, msg]);
      setSyncMessage(msg);
    };

    addLog("Estabelecendo conexão criptografada com o Supabase...");

    try {
      const payload: any = {
        accountId: accId,
        syncType: type
      };

      if (type === "ofx" && extraData) {
        payload.fileContent = extraData.content;
        payload.fileType = extraData.type;
        addLog(`Lendo e parseando arquivo extrato .${extraData.type}...`);
      } else if (type === "openfinance") {
        addLog("Autenticando via chaves de API do Open Finance...");
      }

      const res = await fetch("/api/bank-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro de conexão com o banco");
      }

      const result = await res.json();
      
      if (result.logs && result.logs.length > 0) {
        for (let i = 0; i < result.logs.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 400));
          setSyncLogs(prev => [...prev, result.logs[i]]);
        }
      }

      addLog("Sincronização realizada com sucesso! Concluído.");
      
      // Atualiza os dados de estatísticas locais e XP
      await fetchStats(true);
      
    } catch (err: any) {
      console.error(err);
      addLog(`❌ Falha: ${err.message || "Erro desconhecido"}`);
    } finally {
      setIsSyncingBank(false);
    }
  };

  const handleCreateBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountProvider) return;
    setIsCreatingAccount(true);

    try {
      const res = await fetch("/api/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: accountProvider,
          balance: parseFloat(accountBalance) || 0.0,
          accountNumber,
          syncType: "openfinance", // Sempre cria como Open Finance
          apiKey: accountApiKey,
          apiSecret: accountApiSecret
        })
      });

      if (res.ok) {
        setIsNewAccountModalOpen(false);
        setAccountBalance("");
        setAccountNumber("");
        setAccountApiKey("");
        setAccountApiSecret("");
        setShowAdvancedNewAccount(false);
        await fetchStats(true); // recarregar contas
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingAccount(false);
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

  const handleDeleteBankAccount = async (id: string) => {
    if (!confirm("Deseja realmente deletar esta conta bancária do sistema?")) return;
    setIsDeletingAccount(id);

    try {
      const res = await fetch(`/api/bank-accounts/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        await fetchStats(true); // recarregar
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingAccount(null);
    }
  };

  // Handler de leitura do extrato OFX/CSV local
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSyncFileName(file.name);
    const type = file.name.split(".").pop()?.toLowerCase() || "ofx";
    setSyncFileType(type);

    const reader = new FileReader();
    reader.onload = (event) => {
      setSyncFileContent(event.target?.result as string || "");
    };
    reader.readAsText(file);
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
          className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/95 transition-all cursor-pointer"
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
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/40 font-display">
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
        className={`glass-panel lg:col-span-2 ${activeMobileTab === "general" ? "block" : "hidden md:block"}`}
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

  const renderBankSync = (idx: number) => {
    if (!data) return null;
    return (
      <motion.div
        layout
        key="bank_sync"
        variants={itemVariants}
        className={`glass-panel lg:col-span-2 ${activeMobileTab === "finance" ? "block" : "hidden md:block"}`}
      >
        {renderWidgetHeader("Sincronização Bancária", <CreditCard className="w-3.5 h-3.5 text-primary" />, idx, (
          <button
            onClick={() => setIsAccountsModalOpen(true)}
            className="flex items-center gap-2 px-2 py-1 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-sm text-xs font-bold cursor-pointer transition-colors"
          >
            <Settings className="w-2.5 h-2.5" />
            Gerenciar Contas
          </button>
        ))}

        <AnimatePresence>
          {isSyncingBank && syncMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-2 p-4 bg-primary/5 border border-primary/20 rounded-sm flex items-center gap-5 text-xs text-primary"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>{syncMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {data.financialAccounts && data.financialAccounts.length > 0 ? (
            data.financialAccounts.map((acc) => {
              const prov = acc.provider.toLowerCase();
              let borderColor = "border-primary/20";
              let bgHoverColor = "hover:bg-primary/5";
              let tagBg = "bg-primary/10 text-primary border-primary/20";
              let nameTag = acc.provider.substring(0, 3).toUpperCase();

              if (prov.includes("nubank")) {
                borderColor = "border-border/25";
                bgHoverColor = "hover:bg-fuchsia-950/5";
                tagBg = "bg-fuchsia-500/10 text-primary-400 border-border/25";
              } else if (prov.includes("santander")) {
                borderColor = "border-red-500/25";
                bgHoverColor = "hover:bg-red-950/5";
                tagBg = "bg-red-500/10 text-red-400 border-red-500/25";
              } else if (prov.includes("mercado pago") || prov.includes("mp")) {
                borderColor = "border-sky-500/25";
                bgHoverColor = "hover:bg-sky-950/5";
                tagBg = "bg-sky-500/10 text-sky-400 border-sky-500/25";
                nameTag = "MP";
              } else if (prov.includes("itaú") || prov.includes("itau")) {
                borderColor = "border-amber-500/25";
                bgHoverColor = "hover:bg-amber-950/5";
                tagBg = "bg-amber-500/10 text-amber-400 border-amber-500/25";
              } else if (prov.includes("inter")) {
                borderColor = "border-orange-500/25";
                bgHoverColor = "hover:bg-orange-950/5";
                tagBg = "bg-orange-500/10 text-orange-400 border-orange-500/25";
              }

              return (
                <div
                  key={acc.id}
                  onClick={() => {
                    setSelectedAccountForSync(acc);
                    setSyncLogs([]);
                    setSyncFileName("");
                    setSyncFileContent("");
                    setIsSyncModalOpen(true);
                  }}
                  className={`relative overflow-hidden p-5 rounded-sm border ${borderColor} bg-card/45 ${bgHoverColor} transition-all flex items-center justify-between h-12 cursor-pointer group`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`px-1 py-2 border rounded-sm text-xs font-bold uppercase tracking-wider ${tagBg}`}>
                      {nameTag}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-white font-bold">{acc.balance}</span>
                      <span className="text-[7.5px] text-muted-foreground leading-none mt-0.5 uppercase tracking-wide font-mono">
                        {acc.syncType === "ofx" ? "Extrato OFX" : acc.syncType === "openfinance" ? "Open Finance" : "Manual"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-xs text-muted-foreground block leading-tight group-hover:text-primary transition-colors font-mono">
                      {acc.lastSync || "Pendente"}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold leading-tight mt-0.5 font-mono">
                      {acc.trend}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-3 border border-dashed border-border/60 rounded-sm text-center col-span-2 text-xs text-muted-foreground">
              Nenhuma conta cadastrada. Clique em "Gerenciar Contas" para começar.
            </div>
          )}
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
        className={`glass-panel lg:col-span-2 ${activeMobileTab === "general" ? "block" : "hidden md:block"}`}
      >
        {renderWidgetHeader("Armazenamento", <HardDrive className="w-3.5 h-3.5 text-primary" />, idx, (
          <span className="text-muted-foreground text-sm font-mono">
            <span className="text-white font-bold">{data.storageStats.usedSize}</span> / {data.storageStats.totalSize}
          </span>
        ))}

        <div className="w-full h-1 bg-muted rounded-none overflow-hidden mb-2">
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
        className={`glass-panel lg:col-span-1 ${activeMobileTab === "general" ? "block" : "hidden md:block"}`}
      >
        {renderWidgetHeader(`Central de Metas`, <Trophy className="w-3.5 h-3.5 text-primary " />, idx, (
          <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-sm font-bold font-mono">
            {currentLevelXp}/1000 XP
          </span>
        ))}

        {/* Barra de XP Fina */}
        <div className="w-full h-1 bg-muted rounded-none overflow-hidden mb-2.5">
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
        <form onSubmit={handleAddGoal} className="mt-2.5 pt-2 border-t border-border/40 flex gap-2">
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
        className={`glass-panel lg:col-span-1 ${activeMobileTab === "general" ? "block" : "hidden md:block"}`}
      >
        {renderWidgetHeader("Baú de Prêmios Pix", <Trophy className="w-3.5 h-3.5 text-primary" />, idx, (
          <span className="text-xs text-muted-foreground uppercase font-bold font-display">
            Co-op Shop
          </span>
        ))}

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
        className={`glass-panel lg:col-span-1 ${activeMobileTab === "general" ? "block" : "hidden md:block"}`}
      >
        {renderWidgetHeader("Atalhos Rápidos", <Zap className="w-3 h-3 text-primary" />, idx)}
        
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard/notes?new=true")}
            className="flex items-center gap-1.5 p-2.5 bg-muted/15 border border-border rounded-lg text-xs font-bold glass-btn cursor-pointer justify-center h-[50px]"
          >
            <Plus className="w-3 h-3 text-primary shrink-0" />
            Criar Nota
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/passwords?generate=true")}
            className="flex items-center gap-1.5 p-2.5 bg-muted/15 border border-border rounded-lg text-xs font-bold glass-btn cursor-pointer justify-center h-[50px]"
          >
            <Key className="w-3 h-3 text-secondary shrink-0" />
            Nova Senha
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/torrents")}
            className="flex items-center gap-1.5 p-2.5 bg-muted/15 border border-border rounded-lg text-xs font-bold glass-btn cursor-pointer justify-center h-[50px]"
          >
            <RefreshCw className="w-3 h-3 text-amber shrink-0" />
            Torrent
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/files")}
            className="flex items-center gap-1.5 p-2.5 bg-muted/15 border border-border rounded-lg text-xs font-bold glass-btn cursor-pointer justify-center h-[50px]"
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
        className={`glass-panel lg:col-span-1 ${activeMobileTab === "finance" ? "block" : "hidden md:block"}`}
      >
        {renderWidgetHeader("Operações Recentes", <Activity className="w-3 h-3 text-primary" />, idx)}

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
        className={`glass-panel lg:col-span-1 ${activeMobileTab === "general" ? "block" : "hidden md:block"}`}
      >
        {renderWidgetHeader(`Favoritos (${data.favorites.length})`, <Star className="w-3 h-3 text-primary fill-primary/10" />, idx)}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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




      <div className="md:hidden flex bg-card/30 border border-border/50 p-0.5 rounded-sm gap-0.5">
        <motion.button
          onClick={() => changeMobileTab("general")}
          whileTap={{ scale: 0.94 }}
          className={`flex-1 py-1 text-xs font-display font-semibold rounded-sm transition-all cursor-pointer ${
            activeMobileTab === "general" ? "bg-primary text-black shadow-sm" : "text-muted-foreground"
          }`}
        >
          PAINEL
        </motion.button>
        <motion.button
          onClick={() => changeMobileTab("finance")}
          whileTap={{ scale: 0.94 }}
          className={`flex-1 py-1 text-xs font-display font-semibold rounded-sm transition-all cursor-pointer ${
            activeMobileTab === "finance" ? "bg-primary text-black shadow-sm" : "text-muted-foreground"
          }`}
        >
          BANCO
        </motion.button>
      </div>

      {/* Grade de Métricas Compacta (Horizontal) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5.5 ${activeMobileTab === "general" ? "grid" : "hidden md:grid"}`}>
        {moduleStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              variants={itemVariants}
              onClick={() => router.push(stat.href)}
              whileTap={{ scale: 0.97 }}
              className="group cursor-pointer relative overflow-hidden p-3 h-[60px] glass-panel flex items-center justify-between border border-primary/10 rounded-sm hover:border-primary/45 transition-colors"
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
          {renderBankSync(1)}
          {renderStorage(2)}
        </div>

        {/* Coluna da Direita (Largura 1) - Atalhos, Util e Info */}
        <div className="space-y-4">
          {renderShortcuts(5)}
          <RssTechWidget
            key="rss_tech"
            idx={6}
            renderHeader={renderWidgetHeader}
            itemVariants={itemVariants}
            activeMobileTab={activeMobileTab}
          />
          {renderOperations(7)}
          {renderFavorites(8)}
        </div>
      </div>

      {/* MODAL 1: GERENCIAR CONTAS BANCÁRIAS */}
      <AnimatePresence>
        {isAccountsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-neutral-950 border border-border p-5 rounded-lg text-foreground flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
                <div className="flex items-center gap-5">
                  <CreditCard className="w-4.5 h-4.5 text-primary " />
                  <span className="font-display text-xs font-bold text-white uppercase tracking-wider">Gerenciar Contas Bancárias</span>
                </div>
                <button
                  onClick={() => setIsAccountsModalOpen(false)}
                  className="p-1 rounded-md bg-muted/20 hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lista de Contas */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {data.financialAccounts && data.financialAccounts.length > 0 ? (
                  data.financialAccounts.map((acc: any) => (
                    <div
                      key={acc.id}
                      className="p-3 border border-border/80 bg-card/25 rounded-sm flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-5">
                          <span className="text-xs font-bold text-white leading-tight">{acc.provider}</span>
                          <span className="text-[7px] px-1 py-0.2 bg-primary/10 border border-primary/20 text-primary rounded-sm font-mono uppercase">
                            {acc.syncType}
                          </span>
                        </div>
                        {acc.accountNumber && (
                          <span className="text-xs text-muted-foreground block mt-0.5 font-mono">Conta: {acc.accountNumber}</span>
                        )}
                        <span className="text-sm text-emerald-400 font-bold block mt-1">Saldo: {acc.balance}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0">
                        <button
                          disabled={isDeletingAccount !== null}
                          onClick={() => handleDeleteBankAccount(acc.id)}
                          className="p-4 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 cursor-pointer disabled:opacity-50 transition-colors"
                          title="Excluir Conta"
                        >
                          {isDeletingAccount === acc.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhuma conta bancária conectada.</p>
                )}
              </div>

              <div className="pt-4 border-t border-border/60 mt-4 flex justify-between gap-3 shrink-0">
                <button
                  onClick={() => setIsAccountsModalOpen(false)}
                  className="px-3 py-1.5 bg-muted/20 border border-border text-muted-foreground hover:text-white rounded-sm text-sm font-bold cursor-pointer transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setIsNewAccountModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-primary text-black rounded-sm text-sm font-bold glass-btn glass-btn-primary cursor-pointer flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Cadastrar Conta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CADASTRO DE NOVA CONTA BANCÁRIA */}
      <AnimatePresence>
        {isNewAccountModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-neutral-950 border border-border p-5 rounded-lg text-foreground flex flex-col max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4 shrink-0">
                <div className="flex items-center gap-5">
                  <Plus className="w-4.5 h-4.5 text-primary" />
                  <span className="font-display text-xs font-bold text-white uppercase tracking-wider">Cadastrar Conta Bancária (Open Finance)</span>
                </div>
                <button
                  onClick={() => {
                    setIsNewAccountModalOpen(false);
                    setShowAdvancedNewAccount(false);
                  }}
                  className="p-1 rounded-md bg-muted/20 hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* TUTORIAL OPEN FINANCE */}
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-sm mb-3.5 text-[9.5px]">
                <div className="flex items-center gap-4 text-primary font-bold uppercase mb-4">
                  <Info className="w-3.5 h-3.5" />
                  Como conectar sua conta?
                </div>
                <ol className="list-decimal pl-3.5 space-y-1 text-muted-foreground leading-relaxed">
                  <li>Acesse o aplicativo do seu banco (ex: Nubank, Santander) em seu celular.</li>
                  <li>Vá em <strong>Configurações &gt; Desenvolvedores</strong> ou <strong>Open Finance</strong>.</li>
                  <li>Crie uma nova credencial ou token Pix de leitura.</li>
                  <li>Copie o <strong>Client ID</strong> e <strong>Client Secret</strong> gerados e cole-os nas "Opções Avançadas" abaixo para ativar a leitura de saldos automáticos.</li>
                </ol>
              </div>

              <form onSubmit={handleCreateBankAccount} className="space-y-3.5 text-sm flex-1">
                {/* Provedor / Instituição */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground text-muted-foreground uppercase font-bold tracking-wide">Instituição Financeira</label>
                  <select
                    value={accountProvider}
                    onChange={(e) => setAccountProvider(e.target.value)}
                    className="w-full p-5 bg-card border border-border rounded-sm text-white focus:border-primary focus:outline-none cursor-pointer"
                  >
                    <option value="Nubank">Nubank</option>
                    <option value="Santander">Santander</option>
                    <option value="Mercado Pago">Mercado Pago</option>
                    <option value="Itaú">Itaú</option>
                    <option value="Banco Inter">Banco Inter</option>
                    <option value="Caixa Econômica">Caixa Econômica</option>
                    <option value="Bradesco">Bradesco</option>
                    <option value="Outro Banco">Outro Banco</option>
                  </select>
                </div>

                {/* Titularidade / Identificação de User */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground text-muted-foreground uppercase font-bold tracking-wide">Saldo Inicial (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      required
                      value={accountBalance}
                      onChange={(e) => setAccountBalance(e.target.value)}
                      className="w-full p-5 bg-card border border-border rounded-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground text-muted-foreground uppercase font-bold tracking-wide">Número da Conta</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 12345-6"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full p-5 bg-card border border-border rounded-sm text-white focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Botão de Opções Avançadas */}
                <div className="pt-1.5 pb-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedNewAccount(!showAdvancedNewAccount)}
                    className="text-xs text-primary hover:underline font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    {showAdvancedNewAccount ? "Ocultar Opções Avançadas" : "Exibir Opções Avançadas"}
                  </button>
                </div>

                {/* Campos Ocultos de API (Avançados) */}
                <AnimatePresence>
                  {showAdvancedNewAccount && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-card/60 border border-border rounded-sm space-y-2.5 overflow-hidden"
                    >
                      <div className="flex items-center gap-4 text-primary text-[8.5px] uppercase font-bold mb-1">
                        <Lock className="w-3.5 h-3.5" />
                        Credenciais Open Finance (API)
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground text-muted-foreground uppercase">Client ID / App Key (Público)</label>
                        <input
                          type="text"
                          placeholder="Chave pública do banco ou token Pix de leitura"
                          value={accountApiKey}
                          onChange={(e) => setAccountApiKey(e.target.value)}
                          className="w-full p-5 bg-card border border-border rounded-sm text-white focus:border-primary focus:outline-none font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground text-muted-foreground uppercase">Client Secret / API Token (Privado)</label>
                        <input
                          type="password"
                          placeholder="Chave secreta ou certificado digital do banco"
                          value={accountApiSecret}
                          onChange={(e) => setAccountApiSecret(e.target.value)}
                          className="w-full p-5 bg-card border border-border rounded-sm text-white focus:border-primary focus:outline-none font-mono"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4 border-t border-border/60 mt-4 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewAccountModalOpen(false);
                      setShowAdvancedNewAccount(false);
                    }}
                    className="px-3 py-1.5 bg-muted/20 border border-border text-muted-foreground hover:text-white rounded-sm text-sm font-bold cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingAccount}
                    className="px-3 py-1.5 bg-primary text-black rounded-sm text-sm font-bold glass-btn glass-btn-primary cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {isCreatingAccount ? "Salvando..." : "Salvar Conta"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: SINCRONIZAÇÃO DE CONTA BANCÁRIA */}
      <AnimatePresence>
        {isSyncModalOpen && selectedAccountForSync && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-neutral-950 border border-border p-5 rounded-lg text-foreground flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
                <div className="flex items-center gap-5">
                  <RefreshCw className={`w-4.5 h-4.5 text-primary ${isSyncingBank ? "animate-spin" : ""}`} />
                  <span className="font-display text-xs font-bold text-white uppercase tracking-wider">
                    Sincronizar {selectedAccountForSync.provider}
                  </span>
                </div>
                <button
                  onClick={() => setIsSyncModalOpen(false)}
                  className="p-1 rounded-md bg-muted/20 hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Corpo da Sincronização */}
              <div className="space-y-4 text-sm">
                {/* Caso 1: Sincronização OFX / CSV */}
                {selectedAccountForSync.syncType === "ofx" && (
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/10 border border-border/80 rounded-sm">
                      <span className="text-[8.5px] uppercase font-bold text-primary block mb-1">Passo a Passo</span>
                      <p className="text-muted-foreground leading-relaxed text-[9.5px]">
                        Abra o aplicativo ou site do seu banco real, acesse o extrato bancário e exporte o arquivo no formato <strong>OFX</strong> (Open Financial Exchange) ou <strong>CSV</strong>. Em seguida, arraste e solte o arquivo abaixo para processar lançamentos e saldos reais.
                      </p>
                    </div>

                    {/* Area de Upload */}
                    <div className="border border-dashed border-border/80 hover:border-primary/50 transition-colors p-6 text-center rounded-sm relative flex flex-col items-center justify-center cursor-pointer bg-card/10">
                      <input
                        type="file"
                        accept=".ofx,.csv"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-7 h-7 text-muted-foreground mb-2 group-hover:text-primary" />
                      <span className="text-[9.5px] text-white font-bold">
                        {syncFileName ? syncFileName : "Selecionar arquivo OFX / CSV"}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        Arraste ou clique para selecionar do seu dispositivo
                      </span>
                    </div>

                    {syncFileContent && (
                      <button
                        onClick={() => handleSyncFinancials(selectedAccountForSync.id, "ofx", { content: syncFileContent, type: syncFileType })}
                        disabled={isSyncingBank}
                        className="w-full py-2 bg-primary text-black font-bold rounded-sm text-sm uppercase cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        {isSyncingBank ? "Processando..." : "Processar e Atualizar Saldo"}
                      </button>
                    )}
                  </div>
                )}

                {/* Caso 2: Open Finance */}
                {selectedAccountForSync.syncType === "openfinance" && (
                  <div className="space-y-3">
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-sm flex items-start gap-5.5">
                      <Info className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-xs uppercase font-bold text-white block">Conexão Segura Ativa</span>
                        <p className="text-muted-foreground text-[8.5px] leading-relaxed">
                          Esta conta está vinculada via API Open Finance. A sincronização lerá os tokens criptografados e atualizará as despesas/receitas programadas para hoje de forma automática.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 border border-border/80 bg-card/25 rounded-sm font-mono text-[8.5px] space-y-1">
                      <div><span className="text-muted-foreground">API KEY:</span> <span className="text-white">{selectedAccountForSync.apiKey ? `${selectedAccountForSync.apiKey.substring(0, 10)}...` : "Não cadastrada"}</span></div>
                      <div><span className="text-muted-foreground">API SECRET:</span> <span className="text-white">{selectedAccountForSync.apiSecret ? "••••••••••••••••" : "Não cadastrada"}</span></div>
                    </div>

                    <button
                      onClick={() => handleSyncFinancials(selectedAccountForSync.id, "openfinance")}
                      disabled={isSyncingBank}
                      className="w-full py-2 bg-primary text-black font-bold rounded-sm text-sm uppercase cursor-pointer disabled:opacity-50 transition-colors flex items-center justify-center gap-4"
                    >
                      {isSyncingBank ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Autenticando Conexão...
                        </>
                      ) : (
                        "Sincronizar via Open Finance"
                      )}
                    </button>
                  </div>
                )}

                {/* Caso 3: Manual */}
                {selectedAccountForSync.syncType === "manual" && (
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/10 border border-border/80 rounded-sm">
                      <span className="text-[8.5px] uppercase font-bold text-muted-foreground block mb-1">Recálculo Manual</span>
                      <p className="text-muted-foreground leading-relaxed text-[9.5px]">
                        Nenhum parâmetro de integração está configurado para esta conta. A sincronização manual simplesmente somará todas as receitas marcadas como "recebidas" e subtrairá as despesas marcadas como "pagas" no site, ajustando o saldo atual.
                      </p>
                    </div>

                    <button
                      onClick={() => handleSyncFinancials(selectedAccountForSync.id, "manual")}
                      disabled={isSyncingBank}
                      className="w-full py-2 bg-primary text-black font-bold rounded-sm text-sm uppercase cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      {isSyncingBank ? "Sincronizando..." : "Sincronizar Manualmente"}
                    </button>
                  </div>
                )}

                {/* Área de Logs da Sincronização */}
                {syncLogs.length > 0 && (
                  <div className="p-3 bg-neutral-900 border border-border rounded-sm max-h-48 overflow-y-auto space-y-1.5 font-mono text-[8.5px]">
                    <span className="text-[7.5px] text-muted-foreground uppercase block font-bold tracking-wide border-b border-border/50 pb-1">Logs de Sincronização</span>
                    {syncLogs.map((log, idx) => (
                      <div key={idx} className="text-white/90 leading-tight">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/60 mt-4 flex justify-end shrink-0">
                <button
                  onClick={() => setIsSyncModalOpen(false)}
                  disabled={isSyncingBank}
                  className="px-3 py-1.5 bg-muted/20 border border-border text-muted-foreground hover:text-white rounded-sm text-sm font-bold cursor-pointer disabled:opacity-50 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

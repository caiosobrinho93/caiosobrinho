"use client";

import React, { useState, useEffect } from "react";
import { useStatsStore } from "@/stores/statsStore";
import { 
  User, 
  Award, 
  Flame, 
  Target, 
  Trophy, 
  Sparkles, 
  Calendar,
  Lock,
  Unlock,
  CheckCircle,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function ProfilePage() {
  const { data, fetchStats, isLoading } = useStatsStore();
  const [activeTab, setActiveTab] = useState<"overview" | "goals" | "rewards">("overview");
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalXp, setNewGoalXp] = useState(100);
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false);
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);

  useEffect(() => {
    useStatsStore.getState().fetchStats();
    // Carregar recompensas reivindicadas do localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nexus_claimed_rewards");
      if (saved) {
        setClaimedRewards(JSON.parse(saved));
      }
    }
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-primary font-bold tracking-widest uppercase">Carregando Perfil Gamer</span>
      </div>
    );
  }

  const { profile, goals, counts } = data;
  const currentLevelXp = profile.xp % 1000;
  const xpPercentage = (currentLevelXp / 1000) * 100;
  const totalGoalsCompleted = goals.filter(g => g.isCompleted).length;

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#c5ff1a", "#06b6d4", "#a78bfa", "#10b981"]
    });
  };

  const handleToggleGoal = async (id: string, isCompleted: boolean) => {
    try {
      const res = await fetch(`/api/dashboard/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });
      if (res.ok) {
        useStatsStore.getState().toggleGoal(id, isCompleted);
        if (isCompleted) {
          triggerConfetti();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    setIsSubmittingGoal(true);
    try {
      const res = await fetch("/api/dashboard/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newGoalTitle, xpReward: newGoalXp }),
      });

      if (res.ok) {
        const goal = await res.json();
        useStatsStore.getState().addGoal(goal);
        setNewGoalTitle("");
        setNewGoalXp(100);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingGoal(false);
    }
  };

  const handleClaimReward = (rewardId: string, minLevel: number) => {
    if (profile.level < minLevel || claimedRewards.includes(rewardId)) return;
    
    const nextClaimed = [...claimedRewards, rewardId];
    setClaimedRewards(nextClaimed);
    localStorage.setItem("nexus_claimed_rewards", JSON.stringify(nextClaimed));
    
    // Blast confetti!
    triggerConfetti();
  };

  // Recompensas da loja gamer
  const gamerRewards = [
    { id: "accent_color", title: "Tema Customizado", desc: "Desbloqueia a paleta de cores customizada nas Configurações.", level: 2, icon: Sparkles },
    { id: "glow_effect", title: "Efeito Brilho Neon Máximo", desc: "Intensifica os brilhos e scanlines de neon no cockpit.", level: 4, icon: Zap },
    { id: "hacker_badge", title: "Badge Hacker de Elite", desc: "Exibe o título hacker em seu perfil de jogador.", level: 6, icon: Trophy },
    { id: "matrix_theme", title: "Tema Matrix Clássico", desc: "Acesso completo à predefinição Matrix Green.", level: 8, icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HUD HEADER - Gamer Card */}
      <div className={`p-5 rounded-sm border relative overflow-hidden bg-slate-950/70 border-[#c5ff1a]/25 shadow-xl shadow-black/40 scanlines`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar Glow Container */}
            <div className={`relative w-20 h-20 rounded-full border-2 overflow-hidden flex items-center justify-center shrink-0 ${
              profile.username === "Giselle"
                ? "border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.4)]"
                : "border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            }`}>
              <img 
                src={profile.username === "Giselle" ? "/avatar-giselle.png" : "/avatar-caio.png"} 
                className="w-full h-full object-cover" 
                alt={profile.username} 
              />
              <span className={`absolute -bottom-1 px-2 py-2 text-xs font-black rounded uppercase text-black leading-none ${
                profile.username === "Giselle" ? "bg-fuchsia-400" : "bg-cyan-400"
              }`}>
                {profile.username === "Giselle" ? "P2" : "P1"}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 justify-center sm:justify-start">
                <h1 className="text-xl font-black text-white tracking-widest uppercase font-display">
                  {profile.username}
                </h1>
                <span className={`text-xs font-black px-2 py-2 rounded border tracking-wider uppercase inline-block ${
                  profile.username === "Giselle"
                    ? "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400"
                    : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                }`}>
                  {profile.username === "Giselle" ? "Hacker Co-op" : "Admin Master"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
                Classe: Operador do Sistema • Status: Online
              </p>
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start pt-2">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-400 bg-amber-400/5 px-2.5 py-1 border border-amber-400/10 rounded-sm">
                  <Flame className="w-3.5 h-3.5" />
                  <span>STREAK: 7 DIAS</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/5 px-2.5 py-1 border border-primary/10 rounded-sm">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>GOALS: {totalGoalsCompleted}/{goals.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gamer Rank / Nível Display */}
          <div className="flex flex-col items-center md:items-end justify-center bg-card/25 border border-border/80 px-5 py-4 rounded-sm min-w-[160px] text-center md:text-right">
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Nível Geral</span>
            <span className="text-3xl font-black text-white leading-tight font-display tracking-wider">
              {profile.level}
            </span>
            <span className="text-sm text-primary font-bold uppercase tracking-wider mt-1">{profile.xp} XP TOTAL</span>
          </div>
        </div>

        {/* Dynamic XP Bar */}
        <div className="mt-6 space-y-2 relative z-10">
          <div className="flex justify-between items-end text-sm font-black uppercase tracking-widest">
            <span className="text-white">XP para Próximo Nível</span>
            <span className="text-muted-foreground font-mono">{currentLevelXp} / 1000 XP</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-sm overflow-hidden border border-border/60 relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full xp-bar-fill ${
                profile.username === "Giselle"
                  ? "bg-gradient-to-r from-fuchsia-500 via-pink-500 to-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.5)]"
                  : "bg-gradient-to-r from-primary via-cyan-400 to-primary shadow-[0_0_10px_rgba(197,254,0,0.5)]"
              }`}
            />
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-border bg-card/25 p-0.5 rounded-sm shrink-0">
        {[
          { id: "overview", label: "Visão Geral", icon: User },
          { id: "goals", label: "Desafios & Metas", icon: Target },
          { id: "rewards", label: "Loja de Recompensas", icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3.5 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-5 cursor-pointer transition-all ${
                activeTab === tab.id 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:text-white hover:bg-muted/15"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREAS */}
      <div className="min-h-[300px]">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Stat Cards - counts */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2 flex items-center gap-5">
                <TrendingUp className="w-4 h-4 text-primary" />
                Arsenal do Cofre
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Senhas", count: counts.passwords, detail: "Credenciais criptografadas" },
                  { name: "Notas Seguras", count: counts.notes, detail: "Documentos e rascunhos" },
                  { name: "Arquivos", count: counts.files, detail: "Binários armazenados" },
                  { name: "Imagens", count: counts.wallpapers, detail: "Imagens UHD salvas" },
                  { name: "Cine Vault", count: counts.videos, detail: "Vídeos e links" },
                  { name: "Torrents", count: counts.torrents, detail: "Indexadores arquivados" },
                ].map((item) => (
                  <div key={item.name} className="p-4 bg-card/25 border border-border rounded-sm hover:border-primary/25 transition-all group">
                    <span className="text-sm text-muted-foreground uppercase font-bold tracking-wider">{item.name}</span>
                    <p className="text-2xl font-black text-white mt-1 group-hover:text-primary transition-colors">{item.count}</p>
                    <p className="text-xs text-muted-foreground/60 leading-none mt-1.5">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak & Active Stats details */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2 flex items-center gap-5">
                <Calendar className="w-4 h-4 text-primary" />
                Atividade
              </h3>
              
              <div className="p-5 bg-card/25 border border-border rounded-sm space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Histórico de Login</p>
                  <p className="text-xs text-white leading-relaxed font-semibold">Login diário consecutivo ativo. Ganhe bônus de XP conectando-se todos os dias.</p>
                </div>
                
                <div className="border-t border-border/60 pt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-semibold">Streak Atual:</span>
                    <span className="text-white font-bold">7 Dias 🔥</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-semibold">Maior Streak:</span>
                    <span className="text-white font-bold">14 Dias 🏆</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-semibold">Metas Cumpridas:</span>
                    <span className="text-primary font-bold">{totalGoalsCompleted}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "goals" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* List of current goals */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-5">
                  <Target className="w-4 h-4 text-primary" />
                  Metas & Desafios Ativos
                </h3>
                <span className="text-sm px-2 py-2 bg-primary/10 border border-primary/20 text-primary font-black uppercase rounded-sm">
                  {totalGoalsCompleted}/{goals.length} Feito
                </span>
              </div>

              <div className="space-y-2.5">
                {goals.length > 0 ? (
                  goals.map((goal) => (
                    <div 
                      key={goal.id} 
                      onClick={() => handleToggleGoal(goal.id, !goal.isCompleted)}
                      className={`p-4 rounded-sm border cursor-pointer select-none transition-all flex items-center justify-between gap-4 active:scale-[0.99] hover:border-primary/30 ${
                        goal.isCompleted 
                          ? "bg-emerald-950/10 border-emerald-500/20 opacity-60 text-muted-foreground" 
                          : "bg-card/20 border-border text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          goal.isCompleted 
                            ? "bg-emerald-500 border-emerald-400 text-black" 
                            : "border-border text-transparent"
                        }`}>
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-xs font-semibold truncate leading-tight ${goal.isCompleted ? "line-through" : ""}`}>
                          {goal.title}
                        </span>
                      </div>
                      
                      <span className={`text-sm font-black shrink-0 px-2 py-2 rounded ${
                        goal.isCompleted 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : "bg-primary/10 text-primary border border-primary/20"
                      }`}>
                        +{goal.xpReward} XP
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-10 bg-card/10 border border-dashed border-border rounded-sm">
                    Nenhuma meta cadastrada no painel.
                  </p>
                )}
              </div>
            </div>

            {/* Create Goal Form */}
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-5">
                <PlusCircle className="w-4 h-4 text-primary" />
                Criar Novo Desafio
              </h3>

              <form onSubmit={handleCreateGoal} className="p-4 bg-card/25 border border-border rounded-sm space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-black text-muted-foreground uppercase tracking-wider mb-4">
                    Título da Meta
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sincronizar contas do mês"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-sm text-white placeholder-muted-foreground text-xs focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-black text-muted-foreground uppercase tracking-wider mb-4">
                    Recompensa de XP
                  </label>
                  <select
                    value={newGoalXp}
                    onChange={(e) => setNewGoalXp(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-primary rounded-sm text-white text-xs focus:outline-none transition-all"
                  >
                    <option value={50}>50 XP (Fácil)</option>
                    <option value={100}>100 XP (Médio)</option>
                    <option value={200}>200 XP (Difícil)</option>
                    <option value={500}>500 XP (Lendário)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingGoal}
                  className="w-full py-2.5 bg-primary text-black font-extrabold text-xs uppercase tracking-wider hover:bg-primary/95 transition-all rounded-sm cursor-pointer shadow-md shadow-primary/10"
                >
                  Adicionar Meta
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "rewards" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-5">
              <Award className="w-4 h-4 text-primary" />
              Recompensas por Nível
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gamerRewards.map((reward) => {
                const isClaimed = claimedRewards.includes(reward.id);
                const isUnlocked = profile.level >= reward.level;
                const Icon = reward.icon;

                return (
                  <div 
                    key={reward.id}
                    className={`p-4 rounded-sm border flex items-center justify-between gap-4 transition-all ${
                      isClaimed 
                        ? "bg-slate-950/20 border-border/40 opacity-50"
                        : isUnlocked 
                        ? "bg-primary/5 border-primary/20 hover:border-primary/40 shadow-lg shadow-primary/5"
                        : "bg-black/40 border-border/80"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 border ${
                        isClaimed
                          ? "bg-muted border-border text-muted-foreground"
                          : isUnlocked 
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-muted/10 border-border/60 text-muted-foreground/60"
                      }`}>
                        {isUnlocked ? <Icon className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      </div>
                      
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-4">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{reward.title}</h4>
                          <span className="text-xs font-black text-muted-foreground">LV {reward.level}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-normal">{reward.desc}</p>
                      </div>
                    </div>

                    <button
                      disabled={!isUnlocked || isClaimed}
                      onClick={() => handleClaimReward(reward.id, reward.level)}
                      className={`px-3 py-1.5 rounded-sm font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        isClaimed
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : isUnlocked
                          ? "bg-primary text-black hover:bg-primary/95 shadow-md shadow-primary/15"
                          : "bg-black/50 border border-border text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {isClaimed ? "Reivindicada" : isUnlocked ? "Reivindicar" : "Bloqueada"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

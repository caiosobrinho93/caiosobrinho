"use client";

import React, { useEffect, useState } from "react";
import { useStatsStore } from "@/stores/statsStore";
import { useDataStore } from "@/stores/dataStore";
import { useRouter } from "next/navigation";
import { 
  User, 
  Settings, 
  ShieldCheck, 
  Bell, 
  Moon, 
  LogOut,
  ChevronRight,
  Sparkles,
  Smartphone,
  Lock,
  Trophy,
  Activity,
  HardDrive,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playClickSound, playHoverSound } from "@/components/CyberAudio";

export default function ProfilePage() {
  const router = useRouter();
  const { data, isLoading, fetchStats } = useStatsStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = async () => {
    playClickSound();
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        useStatsStore.setState({ data: null, hasLoaded: false, isLoading: false, error: null });
        useDataStore.setState({
          bills: { data: [], hasLoaded: false, isLoading: false },
          receipts: { data: [], hasLoaded: false, isLoading: false },
          notes: { data: [], hasLoaded: false, isLoading: false },
          passwords: { data: [], hasLoaded: false, isLoading: false },
          videos: { data: [], hasLoaded: false, isLoading: false, lastQuery: "" },
          wallpapers: { data: [], hasLoaded: false, isLoading: false },
          software: { data: [], hasLoaded: false, isLoading: false },
          torrents: { data: [], hasLoaded: false, isLoading: false },
          filesCache: {},
          dev: { data: [], hasLoaded: false, isLoading: false }
        });
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5 min-h-[50vh]">
        <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest animate-pulse">Estabelecendo Conexão...</span>
      </div>
    );
  }

  const { profile, counts, storageStats } = data;
  const currentLevelXp = profile.xp % 1000;
  const xpPercentage = (currentLevelXp / 1000) * 100;
  
  // Format user display metadata
  const partnerName = profile.username === "caio" ? "Giselle" : "Caio";

  return (
    <div className="w-full max-w-md mx-auto bg-transparent text-foreground pb-24 md:pb-12 px-4 safe-area-bottom gpu-accelerated">
      
      {/* Top Header - Avatar & Name */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center pt-4 pb-6"
      >
        <div className="relative group select-none">
          {/* Neon Ring Glow */}
          <div className="absolute inset-0 rounded-full bg-primary/25 blur-xl group-hover:bg-primary/40 transition-all duration-500 scale-105" />
          
          {/* Avatar Outer Ring */}
          <div className="relative w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-primary via-primary/40 to-primary shadow-[0_0_20px_var(--primary)]">
            <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
              <img 
                src={profile.username === "Giselle" ? "/avatar-giselle.png" : "/avatar-caio.png"} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" 
                alt={profile.username} 
              />
            </div>
          </div>
          
          {/* Level Tag Overlay */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black border border-primary/30 text-white font-mono text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5)] tracking-wider">
            LEVEL {profile.level}
          </div>
        </div>

        <h1 className="text-xl font-black text-white tracking-wider uppercase mt-4 font-display">
          {profile.username}
        </h1>
        <p className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-widest mt-1.5 leading-none">
          Co-op Administrator
        </p>

        {/* Level / XP Progress Bar */}
        <div className="mt-5 w-full bg-black/40 border border-white/5 p-3 rounded-2xl">
          <div className="flex justify-between items-center text-[10px] font-bold font-mono text-muted-foreground uppercase mb-1.5">
            <span>XP DO NÍVEL</span>
            <span className="text-white">{currentLevelXp} / 1000</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/[0.03]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-emerald-400 xp-bar-fill shadow-primary/50"
            />
          </div>
        </div>
      </motion.div>

      {/* Grid statistics items */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-3 gap-2 mb-6"
      >
        <div className="p-3 bg-black/40 border border-white/5 rounded-2xl text-center flex flex-col justify-center">
          <span className="text-[18px] font-black text-white leading-tight font-mono">{counts.passwords}</span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Senhas</span>
        </div>
        <div className="p-3 bg-black/40 border border-white/5 rounded-2xl text-center flex flex-col justify-center">
          <span className="text-[18px] font-black text-white leading-tight font-mono">{counts.files}</span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Arquivos</span>
        </div>
        <div className="p-3 bg-black/40 border border-white/5 rounded-2xl text-center flex flex-col justify-center">
          <span className="text-[18px] font-black text-primary leading-tight font-mono">{storageStats.percentUsed}%</span>
          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Disco</span>
        </div>
      </motion.div>

      {/* iOS-like Settings Groups */}
      <div className="space-y-4">
        
        {/* Group 1: Perfil & Conta */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden shadow-sm divide-y divide-white/[0.04]"
        >
          <SettingRow 
            icon={User} 
            label="Informações Pessoais" 
            sub="Visualizar perfil e cargo no cofre"
            onClick={() => {
              playClickSound();
              alert(`Informações do Usuário:\nNome: ${profile.username === "caio" ? "Caio" : "Giselle"}\nTipo: Administrador do Sistema\nParceiro Co-op: ${partnerName}`);
            }}
          />
          <SettingRow 
            icon={Smartphone} 
            label="Dispositivos Ativos" 
            sub="2 terminais autorizados"
            onClick={() => {
              playClickSound();
              alert("Segurança do Terminal: Este dispositivo e o terminal do seu parceiro são os únicos autorizados a descriptografar o cofre.");
            }}
          />
        </motion.div>

        {/* Group 2: Cofre & Segurança */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden shadow-sm divide-y divide-white/[0.04]"
        >
          <SettingRow 
            icon={ShieldCheck} 
            label="Privacidade & Auditoria" 
            sub="Criptografia militar de grau de cofre"
            onClick={() => {
              playClickSound();
              router.push("/dashboard/settings");
            }}
          />
          <SettingRow 
            icon={Lock} 
            label="WebAuthn & Biometria" 
            sub="Acesso biométrico via hardware"
            onClick={() => {
              playClickSound();
              router.push("/dashboard/settings");
            }}
          />
        </motion.div>

        {/* Group 3: Customização */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden shadow-sm divide-y divide-white/[0.04]"
        >
          <SettingRow 
            icon={Moon} 
            label="Aparência Visual" 
            rightText="Cyber Limon" 
            onClick={() => {
              playClickSound();
              router.push("/dashboard/settings");
            }}
          />
          <SettingRow 
            icon={Bell} 
            label="Telegram Notificações" 
            rightText="Ativo" 
            onClick={() => {
              playClickSound();
              router.push("/dashboard/settings");
            }}
          />
          <SettingRow 
            icon={Sparkles} 
            label="Efeitos Visuais" 
            rightText="FPS Máx" 
            onClick={() => {
              playClickSound();
              router.push("/dashboard/settings");
            }}
          />
        </motion.div>

        {/* Partner Connection card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.3 }}
          className="p-4 bg-gradient-to-r from-black/60 to-black/20 border border-white/5 rounded-2xl flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0">
              <img 
                src={profile.username === "Giselle" ? "/avatar-caio.png" : "/avatar-giselle.png"} 
                className="w-full h-full object-cover" 
                alt={partnerName} 
              />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-white leading-tight">Parceiro Conectado</p>
              <p className="text-[9px] text-muted-foreground uppercase mt-0.5 tracking-wider font-mono">{partnerName} • Online</p>
            </div>
          </div>
          <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse shrink-0" />
        </motion.div>

        {/* Logout Button */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.35 }}
          className="pt-2 pb-6"
        >
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20 text-red-400 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider active:scale-[0.98] transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? "Bloqueando..." : "Bloquear Terminal"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function SettingRow({ 
  icon: Icon, 
  label, 
  sub, 
  rightText, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  sub?: string; 
  rightText?: string; 
  onClick?: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      onMouseEnter={playHoverSound}
      className="w-full flex items-center justify-between px-4 py-3 bg-transparent hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors text-left cursor-pointer"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl text-primary shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[13px] font-bold text-white block leading-tight">{label}</span>
          {sub && <span className="text-[10px] text-muted-foreground block mt-0.5 leading-tight truncate">{sub}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground ml-3">
        {rightText && <span className="text-[11px] font-mono text-primary font-bold">{rightText}</span>}
        <ChevronRight className="w-4 h-4 opacity-30" />
      </div>
    </button>
  );
}

"use client";

import React, { useEffect } from "react";
import { useStatsStore } from "@/stores/statsStore";
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
  Trophy
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { data, isLoading } = useStatsStore();

  useEffect(() => {
    useStatsStore.getState().fetchStats();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-8 h-8 border-4 border-[#8fe319] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { profile } = data;
  const currentLevelXp = profile.xp % 1000;
  const xpPercentage = (currentLevelXp / 1000) * 100;

  return (
    <div className="w-full max-w-lg mx-auto bg-transparent text-foreground pb-20 md:pb-8">
      {/* Top Header - Avatar & Name */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col items-center pt-6 pb-6"
      >
        <div className="relative w-28 h-28 rounded-full border-4 border-[#8fe319] shadow-[0_0_20px_rgba(143,227,25,0.3)] overflow-hidden mb-4">
          <img 
            src={profile.username === "Giselle" ? "/avatar-giselle.png" : "/avatar-caio.png"} 
            className="w-full h-full object-cover" 
            alt={profile.username} 
          />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {profile.username}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5 font-medium">
          Administrador
        </p>

        {/* Level / XP Pill */}
        <div className="mt-5 flex flex-col items-center w-full px-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-[#8fe319]" />
            <span className="text-sm font-semibold">Nível {profile.level}</span>
            <span className="text-xs text-muted-foreground ml-1 font-medium">({currentLevelXp} / 1000 XP)</span>
          </div>
          <div className="w-full max-w-[200px] h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="h-full bg-[#8fe319] shadow-[0_0_10px_rgba(143,227,25,0.6)]"
            />
          </div>
        </div>
      </motion.div>

      {/* Settings Groups */}
      <div className="px-4 space-y-6">
        
        {/* Group 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="divide-y divide-border/50">
            <SettingRow icon={User} label="Informações Pessoais" />
            <SettingRow icon={Smartphone} label="Dispositivos Conectados" />
          </div>
        </motion.div>

        {/* Group 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="divide-y divide-border/50">
            <SettingRow icon={ShieldCheck} label="Privacidade e Segurança" />
            <SettingRow icon={Lock} label="Senhas e Autenticação" />
          </div>
        </motion.div>

        {/* Group 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="divide-y divide-border/50">
            <SettingRow icon={Moon} label="Aparência" rightText="Escuro" />
            <SettingRow icon={Bell} label="Notificações" rightText="Ativado" />
            <SettingRow icon={Sparkles} label="Efeitos Visuais" rightText="Máximo" />
          </div>
        </motion.div>

        {/* Group 4 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
          className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="divide-y divide-border/50">
            <SettingRow icon={Settings} label="Configurações Avançadas" />
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          className="pt-2 pb-6"
        >
          <button className="w-full bg-card border border-border/50 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-red-500 font-semibold active:scale-[0.98] transition-transform shadow-sm">
            <LogOut className="w-5 h-5" />
            Sair da Conta
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, label, rightText }: { icon: any, label: string, rightText?: string }) {
  return (
    <button className="w-full flex items-center justify-between px-4 py-3.5 bg-card hover:bg-muted/30 transition-colors active:bg-muted/50 text-left">
      <div className="flex items-center gap-3.5">
        <div className="p-1.5 bg-[#8fe319]/10 rounded-lg text-[#8fe319]">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[15px] font-medium text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        {rightText && <span className="text-[14px]">{rightText}</span>}
        <ChevronRight className="w-4 h-4 opacity-40" />
      </div>
    </button>
  );
}

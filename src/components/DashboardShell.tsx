"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Video,
  Key,
  Image as ImageIcon,
  DownloadCloud,
  FolderOpen,
  Cpu,
  FileText,
  Settings,
  Code,
  Search,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Database,
  Terminal,
  User,
  CreditCard,
  FileCheck,
  RefreshCw,
  Calculator,
  Pin,
  Music,
  LayoutGrid,
  Star
} from "lucide-react";
import CommandPalette from "./CommandPalette";

import { useSettingsStore } from "@/stores/settingsStore";
import { APP_VERSION } from "@/lib/version";
import { useStatsStore } from "@/stores/statsStore";
import { useDataStore } from "@/stores/dataStore";
import { playClickSound, playHoverSound } from "./CyberAudio";
import SynthwaveRadio from "./SynthwaveRadio";
import CyberCalculator from "./CyberCalculator";
import FloatingHUDNotes from "./FloatingHUDNotes";

// BottomBar sub-component
function BottomBar({
  username,
  isCentralOptionsOpen,
  setIsCentralOptionsOpen,
}: {
  username: string;
  isCentralOptionsOpen: boolean;
  setIsCentralOptionsOpen: (v: (prev: boolean) => boolean) => void;
}) {
  const stats = useStatsStore((s) => s.data);
  const xpInLevel = stats ? stats.profile.xp % 1000 : 0;
  const xpPct = (xpInLevel / 1000) * 100;
  const level = stats ? stats.profile.level : 1;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-[50px] flex items-center justify-between px-4 border-t border-white/[0.06] bg-black/95 backdrop-blur-xl safe-area-bottom">
      {/* Left: Menu button */}
      <motion.button
        onClick={() => setIsCentralOptionsOpen((v) => !v)}
        whileTap={{ scale: 0.88 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer ${
          isCentralOptionsOpen
            ? "bg-white/10 border-white/20 text-white"
            : "bg-transparent border-transparent text-white/60 hover:text-white"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isCentralOptionsOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <X className="w-5 h-5" />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <LayoutGrid className="w-5 h-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Center: App name */}
      <span className="text-xs font-bold text-white/30 tracking-widest uppercase select-none">NEXUS</span>

      {/* Right: Avatar + Level + XP bar */}
      <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Lv {level}</span>
          </div>
          <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/50 shrink-0">
          <img
            src={username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"}
            alt={username}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
    </div>
  );
}

interface DashboardShellProps {
  children: React.ReactNode;
  username: string;
}

export default function DashboardShell({ children, username }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const { accentColor, density, themePreset, customTheme } = useSettingsStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCentralOptionsOpen, setIsCentralOptionsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isStickyNotesOpen, setIsStickyNotesOpen] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Verifica se há uma nova versão disponível no servidor (Vercel) comparando com a atual (Local)
  useEffect(() => {
    if (!mounted) return;

    const checkVersion = async () => {
      try {
        // Adiciona um timestamp na query string para burlar cache do navegador
        const response = await fetch(`/api/version?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          if (data.version && data.version !== APP_VERSION) {
            console.log(`[Update Check] Nova versão disponível. Local: ${APP_VERSION}, Servidor: ${data.version}`);
            setIsUpdateAvailable(true);
          }
        }
      } catch (err) {
        console.error("[Update Check] Falha ao verificar versão:", err);
      }
    };

    // Executa imediatamente e a cada 30 segundos
    checkVersion();
    const interval = setInterval(checkVersion, 30000);
    return () => clearInterval(interval);
  }, [mounted]);

  const handleUpdateApp = async () => {
    setIsUpdating(true);
    try {
      // 1. Limpa todos os caches do Service Worker
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // 2. Remove registro do Service Worker
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }

      // 3. Recarrega a página forçando bypass de cache
      window.location.reload();
    } catch (err) {
      console.error("[Update App] Erro ao limpar caches:", err);
      window.location.reload();
    }
  };

  // Sincroniza a cor das barras do celular Android/iOS (PWA) para preto puro
  useEffect(() => {
    if (!mounted) return;

    const metaColor = "#000000"; // Sempre preto conforme solicitação

    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", metaColor);
  }, [mounted]);

  
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCentralOptionsOpen(false);
  }, [pathname]);

  // Command Palette listener (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        // Reset stores to clear cached session data
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
    }
  };

  const navItems = [
    { name: "Painel Geral", href: "/dashboard", icon: LayoutDashboard },
    { name: "Cine Vault", href: "/dashboard/videos", icon: Video },
    { name: "Senhas", href: "/dashboard/passwords", icon: Key },
    { name: "Imagens", href: "/dashboard/wallpapers", icon: ImageIcon },
    { name: "Torrents", href: "/dashboard/torrents", icon: DownloadCloud },
    { name: "Arquivos", href: "/dashboard/files", icon: FolderOpen },
    { name: "Softwares", href: "/dashboard/software", icon: Cpu },
    { name: "Notas", href: "/dashboard/notes", icon: FileText },
    { name: "Contas", href: "/dashboard/bills", icon: CreditCard },
    { name: "Comprovantes", href: "/dashboard/receipts", icon: FileCheck },
    { name: "DEV Central", href: "/dashboard/dev", icon: Code },
    { name: "Configurações", href: "/dashboard/settings", icon: Settings },
  ];

  const currentItem = navItems.find((item) => pathname === item.href) || { name: "Painel Geral" };

  // Determinar classes visuais conforme o tema selecionado
  let themeBgClass = "bg-preset-synth";
  let neonIntensityClass = "neon-intensity-medium";
  let animationSpeedClass = "animation-speed-normal";
  let gridStyleClass = "grid-style-fine";
  let customStyle: React.CSSProperties = {};

  if (mounted) {
    if (themePreset === "synth-violet") {
      themeBgClass = "bg-preset-synth";
      neonIntensityClass = "neon-intensity-medium";
      animationSpeedClass = "animation-speed-normal";
      gridStyleClass = "grid-style-fine";
    } else if (themePreset === "cyber-cyan") {
      themeBgClass = "bg-preset-cyber";
      neonIntensityClass = "neon-intensity-high";
      animationSpeedClass = "animation-speed-fast";
      gridStyleClass = "grid-style-fine";
    } else if (themePreset === "matrix-green") {
      themeBgClass = "bg-preset-matrix";
      neonIntensityClass = "neon-intensity-medium";
      animationSpeedClass = "animation-speed-normal";
      gridStyleClass = "grid-style-dots";
    } else if (themePreset === "sunset-horizon") {
      themeBgClass = "bg-preset-sunset";
      neonIntensityClass = "neon-intensity-low";
      animationSpeedClass = "animation-speed-slow";
      gridStyleClass = "grid-style-lines";
    } else if (themePreset === "tokyo-neon") {
      themeBgClass = "bg-preset-tokyo";
      neonIntensityClass = "neon-intensity-medium";
      animationSpeedClass = "animation-speed-normal";
      gridStyleClass = "grid-style-dots";
    } else if (themePreset === "carbon-stealth") {
      themeBgClass = "bg-preset-carbon";
      neonIntensityClass = "neon-intensity-none";
      animationSpeedClass = "animation-speed-disabled";
      gridStyleClass = "grid-style-none";
    } else if (themePreset === "cyber-limon") {
      themeBgClass = "bg-preset-limon";
      neonIntensityClass = "neon-intensity-high";
      animationSpeedClass = "animation-speed-normal";
      gridStyleClass = "grid-style-dots";
    } else if (themePreset === "custom") {
      neonIntensityClass = `neon-intensity-${customTheme?.neonIntensity || "medium"}`;
      animationSpeedClass = `animation-speed-${customTheme?.animationSpeed || "normal"}`;
      gridStyleClass = `grid-style-${customTheme?.gridStyle || "dots"}`;
      
      if (customTheme?.bgImage) {
        customStyle = {
          backgroundImage: `url(${customTheme.bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        };
      } else {
        themeBgClass = customTheme?.bgGradient || "bg-preset-synth";
      }
    }

  }

  return (
    <div 
      style={customStyle}
      className={`theme-${mounted ? accentColor : "violet"} density-${mounted ? density : "normal"} ${themeBgClass} ${neonIntensityClass} ${animationSpeedClass} min-h-screen w-full flex text-foreground overflow-hidden relative`}
    >
      
      {/* Background Cyber Grid Layer */}
      <div className={`absolute inset-0 pointer-events-none z-0 ${gridStyleClass}`} />
      
      {/* 1. SIDEBAR DESKTOP */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 76 : 260 }}
        transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
        className="hidden md:flex flex-col h-screen border-r border-border bg-card/45 backdrop-blur-xl relative shrink-0 z-30"
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-border/80 bg-background/40">
          <Link href="/dashboard" className="flex items-center gap-5 overflow-hidden select-none">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 shrink-0">
              <Terminal className="w-4.5 h-4.5 text-primary " />
            </div>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-display text-xs tracking-wider text-white"
              >
                NEXUS <span className="text-primary font-bold text-xs bg-primary/10 border border-primary/30 px-1 py-2 rounded ml-1">VAULT</span>
              </motion.span>
            )}
          </Link>
        </div>

        {/* Links */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  onClick={playClickSound}
                  onMouseEnter={playHoverSound}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-display tracking-wider transition-all group relative cursor-pointer border ${
                    isActive
                      ? "bg-primary/5 text-primary border-primary/25 border-l-[3px] border-l-primary"
                      : "text-muted-foreground hover:text-white hover:bg-muted/15 border-transparent hover:border-border/30"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform ${isActive ? "scale-105" : "group-hover:scale-105"}`} />
                  
                  {!isSidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="whitespace-nowrap font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}
                  
                  {isSidebarCollapsed && (
                    <div className="absolute left-16 scale-0 group-hover:scale-100 px-3 py-1.5 rounded-sm bg-popover border border-border text-sm text-white shadow-lg pointer-events-none transition-transform origin-left whitespace-nowrap z-50 font-display tracking-wider">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-5 border-t border-border flex flex-col gap-2 bg-muted/10  text-sm">
          {isUpdateAvailable && (
            <button
              onClick={handleUpdateApp}
              disabled={isUpdating}
              className="w-full flex items-center justify-center gap-4 py-1.5 rounded bg-primary text-black font-bold border border-primary text-xs cursor-pointer  disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? "Instalando..." : "Nova Versão - Atualizar"}</span>
            </button>
          )}

          <Link href="/dashboard/profile" className="flex items-center gap-5 px-4 py-1 overflow-hidden hover:bg-muted/10 border border-transparent hover:border-border/30 transition-all rounded cursor-pointer w-full">
            <div className={`w-7 h-7 rounded-sm overflow-hidden flex items-center justify-center border shrink-0 ${
              username === "caio"
                ? "border-border/50 "
                : "border-border/50 "
            }`}>
              <img 
                src={username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} 
                className="w-full h-full object-cover" 
                alt={username} 
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm text-white font-bold truncate leading-tight capitalize">{username}</span>
                <span className="text-xs text-muted-foreground truncate leading-none uppercase tracking-wide">Cofre Compartilhado</span>
              </div>
            )}
          </Link>
          
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleLogout}
              className={`flex items-center justify-center text-muted-foreground hover:text-destructive p-5 rounded hover:bg-muted/20 transition-colors w-full cursor-pointer text-sm font-display tracking-wider gap-4 ${
                isSidebarCollapsed ? "" : "justify-start px-2"
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              {!isSidebarCollapsed && <span className="font-semibold">Bloquear</span>}
            </button>

            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-5 rounded hover:bg-muted/20 text-muted-foreground hover:text-white cursor-pointer ml-auto"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-4 flex items-center justify-center rounded hover:bg-muted/20 text-muted-foreground hover:text-white cursor-pointer w-full mt-0.5 border border-border/50"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.aside>

      {/* 2. MAIN VIEW PANEL */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-14 border-b border-border/80 bg-background/25 backdrop-blur-xl flex items-center justify-between px-4 md:px-5 shrink-0 z-20">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-4 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-white cursor-pointer"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <div className="hidden md:flex items-center gap-5 text-xs font-semibold uppercase tracking-wider">
              <span className="text-muted-foreground">Cofre</span>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-primary font-display">{currentItem.name}</span>
            </div>
            <span className="md:hidden text-primary font-display text-xs">
              {currentItem.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isUpdateAvailable && (
              <button
                onClick={handleUpdateApp}
                disabled={isUpdating}
                className="flex items-center gap-4 px-2.5 py-1 rounded bg-primary text-black font-bold text-xs  border border-primary/20  cursor-pointer disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">{isUpdating ? "Atualizando..." : "Atualizar App"}</span>
                <span className="xs:hidden">{isUpdating ? "..." : "Atualizar"}</span>
              </button>
            )}

            {/* Search Trigger - Icon only */}
            <button
              id="search-trigger-btn"
              onClick={() => { playClickSound(); setIsCommandPaletteOpen(true); }}
              onMouseEnter={playHoverSound}
              title="Buscar (Ctrl+K)"
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/20 hover:bg-muted/40 border border-border/80 text-muted-foreground hover:text-primary transition-all cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Calculator Trigger */}
            <button
              onClick={() => { playClickSound(); setIsCalculatorOpen(prev => !prev); }}
              onMouseEnter={playHoverSound}
              title="Calculadora HUD"
              className={`hidden md:flex items-center justify-center w-8 h-8 rounded-lg border transition-all cursor-pointer shrink-0 ${
                isCalculatorOpen 
                  ? "bg-[#8fe319]/20 border-[#8fe319]/45 text-[#8fe319] " 
                  : "bg-muted/20 hover:bg-muted/40 border border-border/80 text-muted-foreground hover:text-[#8fe319]"
              }`}
            >
              <Calculator className="w-4 h-4" />
            </button>

            {/* Sticky Notes Trigger */}
            <button
              onClick={() => { playClickSound(); setIsStickyNotesOpen(prev => !prev); }}
              onMouseEnter={playHoverSound}
              title="Notas HUD"
              className={`hidden md:flex items-center justify-center w-8 h-8 rounded-lg border transition-all cursor-pointer shrink-0 ${
                isStickyNotesOpen 
                  ? "bg-[#8fe319]/20 border-[#8fe319]/45 text-[#8fe319] " 
                  : "bg-muted/20 hover:bg-muted/40 border border-border/80 text-muted-foreground hover:text-[#8fe319]"
              }`}
            >
              <Pin className="w-4 h-4" />
            </button>

            {/* Synth Radio Trigger */}
            <button
              onClick={() => { playClickSound(); setIsRadioOpen(prev => !prev); }}
              onMouseEnter={playHoverSound}
              title="Rádio Synthwave"
              className={`hidden md:flex items-center justify-center w-8 h-8 rounded-lg border transition-all cursor-pointer shrink-0 ${
                isRadioOpen 
                  ? "bg-[#8fe319]/20 border-[#8fe319]/45 text-[#8fe319] " 
                  : "bg-muted/20 hover:bg-muted/40 border border-border/80 text-muted-foreground hover:text-[#8fe319]"
              }`}
            >
              <Music className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => { playClickSound(); setIsNotificationsOpen(true); }}
              title="Notificações"
              className="relative flex items-center justify-center w-8 h-8 rounded-full bg-muted/20 hover:bg-muted/40 border border-border/80 text-muted-foreground hover:text-[#8fe319] transition-all cursor-pointer shrink-0"
            >
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-[#8fe319] text-[8px] font-bold text-black">
                2
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </button>

            {/* Storage indicator */}
            <div className="hidden lg:flex items-center gap-5 px-2.5 py-1 rounded-sm border border-border/80 bg-card/20 text-sm ">
              <Database className="w-3 h-3 text-primary " />
              <div className="flex flex-col min-w-14">
                <div className="flex justify-between text-xs leading-tight font-medium">
                  <span className="text-muted-foreground uppercase">Disk</span>
                  <span className="text-white font-bold">42%</span>
                </div>
                <div className="w-16 h-0.5 bg-muted rounded-none mt-1 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "42%" }} />
                </div>
              </div>
            </div>
            
            {/* User Avatar */}
            <Link href="/dashboard/profile" className={`w-7.5 h-7.5 rounded-sm overflow-hidden flex items-center justify-center border select-none hover:opacity-85 transition-opacity cursor-pointer ${
              username === "caio" ? "border-border" : "border-border"
            }`}>
              <img 
                src={username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} 
                className="w-full h-full object-cover" 
                alt={username} 
              />
            </Link>
          </div>
        </header>
 
        <main className="flex-1 overflow-y-auto bg-background/35 relative p-4 md:p-8 lg:p-10 pb-[66px] md:pb-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>

        {/* 3. BOTTOM NAV BAR MOBILE — Fixed black bar */}
        <BottomBar
          username={username}
          isCentralOptionsOpen={isCentralOptionsOpen}
          setIsCentralOptionsOpen={setIsCentralOptionsOpen}
        />
      </div>

      {/* 4. SLIDEOUT MENU MOBILE */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border p-5 flex flex-col z-50 md:hidden"
            >
              <div className="flex items-center justify-between pb-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-bold text-white text-base">NEXUS VAULT</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link key={item.name} href={item.href} onClick={() => { playClickSound(); setIsMobileMenuOpen(false); }}>
                      <motion.div
                        onMouseEnter={playHoverSound}
                        whileTap={{ scale: 0.96 }}
                        className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:text-white hover:bg-muted/40"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-border flex flex-col gap-3">
                {isUpdateAvailable && (
                  <button
                    onClick={handleUpdateApp}
                    disabled={isUpdating}
                    className="flex items-center justify-center gap-5 p-3 w-full bg-primary text-black font-bold rounded-xl text-sm transition-colors cursor-pointer  disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                    <span>{isUpdating ? "Instalando..." : "Atualizar Nexus Vault"}</span>
                  </button>
                )}

                <div className="flex items-center gap-3 px-1 font-sans">
                  <div className={`w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border ${
                    username === "caio"
                      ? "border-border "
                      : "border-border "
                  }`}>
                    <img 
                      src={username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} 
                      className="w-full h-full object-cover" 
                      alt={username} 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight capitalize">{username}</p>
                    <p className="text-xs text-muted-foreground">Sessão Compartilhada</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-5 p-3 w-full bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl text-sm font-semibold transition-colors cursor-pointer border border-border"
                >
                  <LogOut className="w-4 h-4" />
                  Bloquear Cofre
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />

      {/* 5. CENTRAL DE OPÇÕES BOTTOM SHEET - Magic Drawer */}
      <AnimatePresence>
        {isCentralOptionsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCentralOptionsOpen(false)}
              className="fixed inset-0 bg-black/75 z-40 md:hidden backdrop-blur-md"
            />

            {/* Bottom Drawer — Silky smooth spring, no bounce */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 40, mass: 0.6 }}
              className="fixed bottom-0 left-0 right-0 max-h-[80vh] z-50 md:hidden flex flex-col overflow-y-auto rounded-t-3xl"
              style={{ background: "linear-gradient(180deg, #111214 0%, #09090b 100%)", borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Handle */}
              <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-0.5 rounded-full bg-white/10" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-2 pb-4 shrink-0">
                <div>
                  <span className="text-sm font-bold text-white/90 uppercase tracking-[0.15em]">Navegação</span>
                </div>
                <button
                  onClick={() => setIsCentralOptionsOpen(false)}
                  className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sections */}
              <div className="flex-1 px-4 pb-8 space-y-4">
                {[
                  {
                    label: "Finanças",
                    items: [
                      { href: "/dashboard/bills", icon: CreditCard, name: "Contas" },
                      { href: "/dashboard/receipts", icon: FileCheck, name: "Comprovantes" },
                    ],
                  },
                  {
                    label: "Arquivos & Mídia",
                    items: [
                      { href: "/dashboard/files", icon: FolderOpen, name: "Arquivos" },
                      { href: "/dashboard/videos", icon: Video, name: "Cine Vault" },
                      { href: "/dashboard/wallpapers", icon: ImageIcon, name: "Imagens" },
                      { href: "/dashboard/torrents", icon: DownloadCloud, name: "Torrents" },
                    ],
                  },
                  {
                    label: "Segurança & Produtividade",
                    items: [
                      { href: "/dashboard/passwords", icon: Key, name: "Senhas" },
                      { href: "/dashboard/notes", icon: FileText, name: "Notas" },
                      { href: "/dashboard/software", icon: Cpu, name: "Softwares" },
                      { href: "/dashboard/dev", icon: Code, name: "DEV Central" },
                    ],
                  },
                  {
                    label: "Utilitários HUD",
                    items: [
                      { onClick: () => setIsCalculatorOpen(v => !v), icon: Calculator, name: "Calculadora" },
                      { onClick: () => setIsStickyNotesOpen(v => !v), icon: Pin, name: "Rascunho HUD" },
                      { onClick: () => setIsRadioOpen(v => !v), icon: Music, name: "Rádio Synth" },
                    ] as any[],
                  },
                ].map((section, sIdx) => (
                  <div key={section.label}>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30 mb-2 px-1">{section.label}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {section.items.map((item, iIdx) => {
                        const Icon = item.icon;
                        const isActive = item.href ? pathname === item.href : false;
                        
                        const elementContent = (
                          <div className={`flex items-center gap-5.5 px-3 py-2.5 rounded-xl border transition-all cursor-pointer select-none active:scale-95 ${
                            isActive
                              ? "bg-white/8 border-white/15 text-white"
                              : "bg-white/3 border-white/5 text-white/60 hover:text-white hover:bg-white/6 hover:border-white/10"
                          }`}>
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-white/40"}`} />
                            <span className="text-sm font-semibold truncate">{item.name}</span>
                          </div>
                        );

                        return (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (sIdx * 4 + iIdx) * 0.03 + 0.05, type: "spring", stiffness: 300, damping: 24 }}
                          >
                            {item.href ? (
                              <Link href={item.href} onClick={() => setIsCentralOptionsOpen(false)}>
                                {elementContent}
                              </Link>
                            ) : (
                              <div onClick={() => { setIsCentralOptionsOpen(false); item.onClick(); }}>
                                {elementContent}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Quick actions row */}
                <div className="pt-2 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { setIsCentralOptionsOpen(false); setIsCommandPaletteOpen(true); }}
                      className="flex items-center gap-5.5 px-3 py-2.5 rounded-xl border border-white/5 bg-white/3 text-white/50 hover:text-white hover:bg-white/6 transition-all cursor-pointer"
                    >
                      <Search className="w-4 h-4 shrink-0 text-white/30" />
                      <span className="text-sm font-semibold">Buscar</span>
                    </button>
                    <button
                      onClick={() => { setIsCentralOptionsOpen(false); handleLogout(); }}
                      className="flex items-center gap-5.5 px-3 py-2.5 rounded-xl border border-white/5 bg-white/3 text-white/50 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0 text-white/30" />
                      <span className="text-sm font-semibold">Sair</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* 6. NOTIFICATION MODAL */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-16 right-4 left-4 md:left-auto md:w-96 bg-card border border-border/80 rounded-2xl shadow-2xl z-[61] overflow-hidden flex flex-col"
              style={{ maxHeight: '80vh' }}
            >
              <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50">
                <h3 className="font-bold text-white">Notificações</h3>
                <button onClick={() => setIsNotificationsOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                
                {/* Red Badge Alert Link for Bills */}
                <Link href="/dashboard/bills" onClick={() => setIsNotificationsOpen(false)} className="block p-3 mb-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-400">Contas a Vencer</p>
                        <p className="text-[11px] text-red-400/70">Revisão necessária</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  </div>
                </Link>

                <div className="px-3 py-2">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-3">Histórico do Sistema</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-white leading-tight">Giselle atualizou uma senha</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Há 2 horas</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <FolderOpen className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white leading-tight">Novo backup da Vercel concluído</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Ontem</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SynthwaveRadio isOpen={isRadioOpen} onClose={() => setIsRadioOpen(false)} />
      <CyberCalculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
      <FloatingHUDNotes isOpen={isStickyNotesOpen} onClose={() => setIsStickyNotesOpen(false)} />
    </div>
  );
}

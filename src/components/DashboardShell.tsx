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
  Star,
  Home
} from "lucide-react";
import CommandPalette from "./CommandPalette";
import NeonParticles from "./NeonParticles";

import { useSettingsStore } from "@/stores/settingsStore";
import { APP_VERSION } from "@/lib/version";
import { useStatsStore } from "@/stores/statsStore";
import { useDataStore } from "@/stores/dataStore";
import { playClickSound, playHoverSound } from "./CyberAudio";
import SynthwaveRadio from "./SynthwaveRadio";
import CyberCalculator from "./CyberCalculator";

// BottomBar sub-component
function BottomBar({
  username,
  isCentralOptionsOpen,
  setIsCentralOptionsOpen,
  onSearchOpen,
  onNotificationsOpen,
}: {
  username: string;
  isCentralOptionsOpen: boolean;
  setIsCentralOptionsOpen: (v: (prev: boolean) => boolean) => void;
  onSearchOpen: () => void;
  onNotificationsOpen: () => void;
}) {
  const stats = useStatsStore((s) => s.data);
  const xpInLevel = stats ? stats.profile.xp % 1000 : 0;
  const xpPct = (xpInLevel / 1000) * 100;
  const level = stats ? stats.profile.level : 1;
  const displayName = username === "caio" ? "Caio" : username === "giselle" ? "Giselle" : username;

  return (
    <div className="min-[1200px]:hidden fixed bottom-0 left-0 right-0 z-30 h-[50px] flex items-center justify-between px-3 border-t border-white/[0.06] bg-[#1a1b26] backdrop-blur-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Left: Home */}
      <div className="flex items-center justify-start w-1/3">
        <Link
          href="/dashboard"
          onClick={() => { playClickSound(); }}
          className="flex items-center justify-center w-10 h-10 rounded-xl text-white/50 hover:text-white transition-colors cursor-pointer"
          title="Início"
        >
          <Home className="w-5 h-5" />
        </Link>
      </div>

      {/* Center: Apps / Menu */}
      <div className="flex items-center justify-center w-1/3">
        <motion.button
          onClick={() => setIsCentralOptionsOpen((v) => !v)}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={
            isCentralOptionsOpen 
              ? "flex items-center justify-center w-[48px] h-[48px] rounded-full shadow-[0_4px_15px_rgba(var(--primary-rgb),0.3)] bg-primary text-black border border-primary font-bold cursor-pointer transition-all" 
              : "frutiger-button w-[48px] h-[48px] rounded-full flex items-center justify-center"
          }
        >
          {isCentralOptionsOpen ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.18 }}
                className="flex items-center justify-center w-full h-full"
              >
                <X className="w-6 h-6" />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="frutiger-inner">
              <div className="frutiger-top-white"></div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.18 }}
                  className="frutiger-text flex items-center justify-center w-full h-full drop-shadow-md"
                >
                  <LayoutGrid className="w-5 h-5 text-white" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }} />
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </motion.button>
      </div>

      {/* Right: Notification + Profile (Search removed) */}
      <div className="flex items-center justify-end w-1/3 gap-1">
        <button
          onClick={onNotificationsOpen}
          className="relative flex items-center justify-center w-10 h-10 rounded-xl text-white/50 hover:text-white transition-colors cursor-pointer mr-1"
          title="Notificações"
        >
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>

        <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer w-7 h-7 rounded-full overflow-hidden border border-primary/30 shrink-0">
          <img
            src={username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCentralOptionsOpen, setIsCentralOptionsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    useStatsStore.getState().fetchStats();
    if (username) {
      document.body.setAttribute('data-user', username.toLowerCase());
    }
  }, [username]);

  // Auto-collapse sidebar based on window width
  useEffect(() => {
    if (!mounted) return;
    
    const handleResize = () => {
      // Force collapse on window resize if window is small, otherwise keep whatever state the user set.
      if (window.innerWidth < 1450) {
        setIsSidebarCollapsed(true);
      }
    };
    
    // We already initialize to true, so no need to call handleResize() on mount unless we want to force it.
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mounted]);

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
    { name: "Netfrix", href: "/dashboard/netfrix", icon: Video },
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
  const isGiselle = username?.toLowerCase() === "giselle";

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

  // Toggle options (Desktop Central)
  const toggleCentralOptions = () => setIsCentralOptionsOpen(!isCentralOptionsOpen);

  // Close options when clicking outside
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCentralOptionsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Handle module access and track recent activity
  const handleAccessModule = (type: string, path: string) => {
    // Pushing recent item (mock implementation for visuals)
    setIsCentralOptionsOpen(false);
    router.push(path);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1200;

  return (
    <div 
      style={customStyle}
      className={`${isGiselle ? 'user-giselle bg-[#db2777]' : `theme-${mounted ? accentColor : "violet"} bg-[#050505]`} density-${mounted ? density : "normal"} ${neonIntensityClass} ${animationSpeedClass} min-h-screen w-full flex text-foreground overflow-hidden relative`}
    >
      
      {/* Background Cyber Grid Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Dynamic Cyberpunk Particle Canvas */}
      {mounted && <NeonParticles isGiselle={isGiselle} />}
      
      {/* 1. SIDEBAR DESKTOP */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 76 : 260 }}
        transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
        className="hidden min-[1200px]:flex flex-col h-screen border-r border-border bg-card/45 backdrop-blur-xl absolute left-0 top-0 bottom-0 shrink-0 z-40"
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
                  title={item.name}
                  onClick={playClickSound}
                  onMouseEnter={playHoverSound}
                  className={`flex items-center gap-3 px-3 py-3 text-sm font-display tracking-wider transition-all group relative cursor-pointer border rounded-md ${
                    isActive
                      ? "bg-primary/10 text-primary border-primary/25"
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
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className={`p-3 flex flex-col gap-2 border-t border-border bg-muted/10 text-sm ${!isSidebarCollapsed ? "px-4" : ""}`}>
          {isUpdateAvailable && !isSidebarCollapsed && (
            <button
              onClick={handleUpdateApp}
              disabled={isUpdating}
              className="w-full flex items-center justify-center gap-3 py-2 rounded bg-primary text-black font-bold border border-primary text-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>Atualizar App</span>
            </button>
          )}

          <Link href="/dashboard/profile" title="Perfil" className={`flex items-center justify-center overflow-hidden hover:bg-muted/10 border border-transparent hover:border-border/30 transition-all rounded cursor-pointer w-full ${isSidebarCollapsed ? 'py-3' : 'gap-3 px-3 py-2'}`}>
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-white/20 shrink-0">
              <img 
                src={username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} 
                className="w-full h-full object-cover" 
                alt={username} 
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm text-white font-bold truncate leading-tight capitalize">{username}</span>
                <span className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">Cofre</span>
              </div>
            )}
          </Link>
          
          <div className={`flex items-center ${isSidebarCollapsed ? 'flex-col gap-2' : 'gap-1'}`}>
            <button
              onClick={handleLogout}
              title="Sair / Bloquear"
              className={`flex items-center justify-center text-muted-foreground hover:text-white hover:bg-destructive/60 transition-colors rounded cursor-pointer border border-transparent hover:border-destructive/50 ${isSidebarCollapsed ? 'p-3 w-full' : 'px-3 py-2.5 w-full justify-start gap-3'}`}
            >
              <LogOut className="w-4 h-4" />
              {!isSidebarCollapsed && <span className="font-semibold text-xs uppercase tracking-wider">Sair</span>}
            </button>

            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                title="Colapsar Menu"
                className="p-2.5 rounded hover:bg-muted/20 text-muted-foreground hover:text-white cursor-pointer ml-auto"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              title="Expandir Menu"
              className="p-3 flex items-center justify-center rounded hover:bg-muted/20 text-muted-foreground hover:text-white cursor-pointer w-full mt-1 border border-border/50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.aside>

      {/* 2. MAIN VIEW PANEL */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-[1200px]:ml-[76px]">
        
        {/* Top Header */}
        <header className="h-14 border-b border-border/80 bg-background/25 backdrop-blur-xl hidden min-[1200px]:flex items-center justify-between px-5 shrink-0 z-20">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="min-[1200px]:hidden p-4 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-white cursor-pointer"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <div className="hidden min-[1200px]:flex items-center gap-5 text-xs font-semibold uppercase tracking-wider">
              <span className="text-muted-foreground">Cofre</span>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-primary font-display">{currentItem.name}</span>
            </div>
            <span className="min-[1200px]:hidden text-primary font-display text-xs">
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

            {/* Search Trigger - Icon only */}

            {/* Notification Bell */}
            <button
              onClick={() => { playClickSound(); setIsNotificationsOpen(true); }}
              title="Notificações"
              className="relative flex items-center justify-center w-8 h-8 rounded-full bg-muted/20 hover:bg-muted/40 border border-border/80 text-muted-foreground hover:text-primary transition-all cursor-pointer shrink-0"
            >
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-black">
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
 
        <main className="flex-1 overflow-y-auto bg-background/35 relative pt-4 px-3 sm:pt-6 sm:px-4 md:p-8 lg:p-10 pb-[calc(70px+env(safe-area-inset-bottom))] md:pb-8">
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
          onSearchOpen={() => { playClickSound(); setIsCommandPaletteOpen(true); }}
          onNotificationsOpen={() => { playClickSound(); setIsNotificationsOpen(true); }}
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
              className="fixed inset-0 bg-black/80 backdrop-blur z-40 min-[1200px]:hidden"
            />
            
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#1a1b26] border-r border-border p-5 flex flex-col z-50 min-[1200px]:hidden"
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

            {/* Bottom Drawer — Sleek Glassmorphism and Scale Animation */}
            <motion.div
              initial={{ y: "100%", opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex flex-col overflow-y-auto rounded-t-[32px] bg-black/60 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
              style={{ maxHeight: "85vh" }}
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-primary/40 blur-md rounded-full pointer-events-none" />

              {/* Handle */}
              <div className="w-full flex justify-center pt-4 pb-2 shrink-0">
                <div className="w-12 h-1.5 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-2 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-lg font-bold text-white tracking-tight">Navegação</span>
                </div>
                <button
                  onClick={() => setIsCentralOptionsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/50 hover:text-white cursor-pointer transition-colors flex items-center justify-center border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sections — Premium Unified Icons */}
              <div className="flex-1 px-5 pb-8 space-y-6">
                {[
                  {
                    label: "Finanças",
                    items: [
                      { href: "/dashboard/bills", icon: CreditCard, name: "Contas", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                      { href: "/dashboard/receipts", icon: FileCheck, name: "Comprovantes", color: "text-cyan-400", bg: "bg-cyan-400/10" },
                    ],
                  },
                  {
                    label: "Arquivos & Mídia",
                    items: [
                      { href: "/dashboard/files", icon: FolderOpen, name: "Arquivos", color: "text-amber-400", bg: "bg-amber-400/10" },
                      { href: "/dashboard/netfrix", icon: Video, name: "Netfrix", color: "text-red-500", bg: "bg-red-500/10" },
                      { href: "/dashboard/wallpapers", icon: ImageIcon, name: "Imagens", color: "text-fuchsia-400", bg: "bg-fuchsia-400/10" },
                      { href: "/dashboard/torrents", icon: DownloadCloud, name: "Torrents", color: "text-purple-400", bg: "bg-purple-400/10" },
                    ],
                  },
                  {
                    label: "Segurança & Produtividade",
                    items: [
                      { href: "/dashboard/passwords", icon: Key, name: "Senhas", color: "text-rose-500", bg: "bg-rose-500/10" },
                      { href: "/dashboard/notes", icon: FileText, name: "Notas", color: "text-yellow-400", bg: "bg-yellow-400/10" },
                      { href: "/dashboard/software", icon: Cpu, name: "Softwares", color: "text-blue-400", bg: "bg-blue-400/10" },
                      { href: "/dashboard/dev", icon: Code, name: "DEV Central", color: "text-green-400", bg: "bg-green-400/10" },
                    ],
                  },
                ].map((section, sIdx) => (
                  <div key={section.label}>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-3 px-1 text-white/30 flex items-center gap-2">
                      {section.label}
                      <span className="flex-1 h-px bg-white/5" />
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {section.items.map((item: any, iIdx: number) => {
                        const Icon = item.icon;
                        const isActive = item.href ? pathname === item.href : false;
                        
                        const elementContent = (
                          <motion.div
                            whileTap={{ scale: 0.92 }}
                            className={`flex flex-col items-start justify-center gap-2.5 p-4 rounded-2xl border transition-all cursor-pointer select-none group relative overflow-hidden ${
                              isActive
                                ? "bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.2)]"
                                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                            }`}
                          >
                            {isActive && (
                              <div className="absolute inset-0 bg-primary/5 blur-xl pointer-events-none" />
                            )}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-sm ${
                              isActive ? "bg-primary text-black scale-110" : `${item.bg} ${item.color} group-hover:scale-110`
                            }`}>
                              <Icon className="w-4.5 h-4.5" />
                            </div>
                            <span className={`text-[13px] font-semibold tracking-wide ${isActive ? "text-primary" : "text-white/80 group-hover:text-white"}`}>{item.name}</span>
                          </motion.div>
                        );

                        return (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (sIdx * 4 + iIdx) * 0.03 + 0.1, type: "spring", stiffness: 300, damping: 25 }}
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
              </div>

              {/* Quick actions row */}
              <div className="mt-auto px-5 pb-6 pt-4 border-t border-white/10 bg-white/[0.02] grid grid-cols-2 gap-3 backdrop-blur-md">
                  <button
                    onClick={() => { setIsCentralOptionsOpen(false); setIsCommandPaletteOpen(true); }}
                    className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/5 transition-all cursor-pointer font-semibold text-[13px]"
                  >
                    <Search className="w-4 h-4" />
                    Buscar
                  </button>
                  <button
                    onClick={() => { setIsCentralOptionsOpen(false); handleLogout(); }}
                    className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-all cursor-pointer font-semibold text-[13px]"
                  >
                    <LogOut className="w-4 h-4" />
                    Bloquear
                  </button>
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
    </div>
  );
}

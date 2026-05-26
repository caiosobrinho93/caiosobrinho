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
  LayoutGrid,
  RefreshCw
} from "lucide-react";
import CommandPalette from "./CommandPalette";
import { useSettingsStore } from "@/stores/settingsStore";
import { APP_VERSION } from "@/lib/version";
import { useStatsStore } from "@/stores/statsStore";
import { useDataStore } from "@/stores/dataStore";

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
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden select-none">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 shrink-0">
              <Terminal className="w-4.5 h-4.5 text-primary animate-pulse" />
            </div>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-display text-xs tracking-wider text-white"
              >
                NEXUS <span className="text-primary font-bold text-[9px] bg-primary/10 border border-primary/30 px-1 py-0.5 rounded ml-1">VAULT</span>
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
                  className={`flex items-center gap-3 px-3 py-2 text-[10px] font-display tracking-wider transition-all group relative cursor-pointer border ${
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
                    <div className="absolute left-16 scale-0 group-hover:scale-100 px-3 py-1.5 rounded-sm bg-popover border border-border text-[10px] text-white shadow-lg pointer-events-none transition-transform origin-left whitespace-nowrap z-50 font-display tracking-wider">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-2 border-t border-border flex flex-col gap-1 bg-muted/10  text-[10px]">
          {isUpdateAvailable && (
            <button
              onClick={handleUpdateApp}
              disabled={isUpdating}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-primary text-black font-bold border border-primary text-[9px] cursor-pointer animate-pulse disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? "Instalando..." : "Nova Versão - Atualizar"}</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-1.5 py-1 overflow-hidden">
            <div className={`w-7 h-7 rounded-sm overflow-hidden flex items-center justify-center border shrink-0 ${
              username === "caio"
                ? "border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                : "border-fuchsia-500/50 shadow-[0_0_8px_rgba(217,70,239,0.3)]"
            }`}>
              <img 
                src={username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} 
                className="w-full h-full object-cover" 
                alt={username} 
              />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-white font-bold truncate leading-tight">
                  {username === "caio" ? "Caio" : username === "giselle" ? "Giselle" : username}
                </span>
                <span className="text-[8px] text-muted-foreground truncate leading-none uppercase tracking-wide">Cofre Compartilhado</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleLogout}
              className={`flex items-center justify-center text-muted-foreground hover:text-destructive p-2 rounded hover:bg-muted/20 transition-colors w-full cursor-pointer text-[10px] font-display tracking-wider gap-1.5 ${
                isSidebarCollapsed ? "" : "justify-start px-2"
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              {!isSidebarCollapsed && <span className="font-semibold">Bloquear</span>}
            </button>

            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-2 rounded hover:bg-muted/20 text-muted-foreground hover:text-white cursor-pointer ml-auto"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-1.5 flex items-center justify-center rounded hover:bg-muted/20 text-muted-foreground hover:text-white cursor-pointer w-full mt-0.5 border border-border/50"
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
              className="md:hidden p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-white cursor-pointer"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
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
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary text-black font-bold text-[9px] animate-pulse border border-primary/20 shadow-[0_0_10px_rgba(215,254,0,0.4)] cursor-pointer disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">{isUpdating ? "Atualizando..." : "Atualizar App"}</span>
                <span className="xs:hidden">{isUpdating ? "..." : "Atualizar"}</span>
              </button>
            )}

            {/* Search Trigger - Icon only */}
            <button
              id="search-trigger-btn"
              onClick={() => setIsCommandPaletteOpen(true)}
              title="Buscar (Ctrl+K)"
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/20 hover:bg-muted/40 border border-border/80 text-muted-foreground hover:text-primary transition-all cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Storage indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-sm border border-border/80 bg-card/20 text-[10px] ">
              <Database className="w-3 h-3 text-primary animate-pulse" />
              <div className="flex flex-col min-w-14">
                <div className="flex justify-between text-[9px] leading-tight font-medium">
                  <span className="text-muted-foreground uppercase">Disk</span>
                  <span className="text-white font-bold">42%</span>
                </div>
                <div className="w-16 h-0.5 bg-muted rounded-none mt-1 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "42%" }} />
                </div>
              </div>
            </div>
            
            {/* User Avatar */}
            <div className={`w-7.5 h-7.5 rounded-sm overflow-hidden flex items-center justify-center border select-none ${
              username === "caio" ? "border-cyan-400" : "border-fuchsia-400"
            }`}>
              <img 
                src={username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} 
                className="w-full h-full object-cover" 
                alt={username} 
              />
            </div>
          </div>
        </header>
 
        <main className="flex-1 overflow-y-auto bg-background/35 relative p-3 md:p-4 pb-20 md:pb-4">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
 
        {/* 3. BOTTOM NAV BAR MOBILE (Magic Floating Button) */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 select-none pointer-events-none">
          <div className="pointer-events-auto relative">
            <motion.button
              id="magic-menu-btn"
              onClick={() => setIsCentralOptionsOpen((v) => !v)}
              animate={isCentralOptionsOpen ? { rotate: 45, scale: 1.1 } : { rotate: 0, scale: 1 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`flex items-center justify-center w-13 h-13 rounded-full border-2 shadow-2xl cursor-pointer relative transition-colors duration-300 ${
                isCentralOptionsOpen
                  ? "bg-white text-black border-white shadow-white/20"
                  : "bg-primary text-black border-primary shadow-primary/30"
              }`}
            >
              {isCentralOptionsOpen ? <X className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
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
                    <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <motion.div
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
                    className="flex items-center justify-center gap-2 p-3 w-full bg-primary text-black font-bold rounded-xl text-sm transition-colors cursor-pointer animate-pulse disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                    <span>{isUpdating ? "Instalando..." : "Atualizar Nexus Vault"}</span>
                  </button>
                )}

                <div className="flex items-center gap-3 px-1 font-sans">
                  <div className={`w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border ${
                    username === "caio"
                      ? "border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                      : "border-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.2)]"
                  }`}>
                    <img 
                      src={username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} 
                      className="w-full h-full object-cover" 
                      alt={username} 
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">
                      {username === "caio" ? "Caio" : username === "giselle" ? "Giselle" : username}
                    </p>
                    <p className="text-xs text-muted-foreground">Sessão Compartilhada</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 p-3 w-full bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl text-sm font-semibold transition-colors cursor-pointer border border-border"
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

            {/* Bottom Drawer */}
            <motion.div
              initial={{ y: "100%", borderRadius: "32px 32px 0 0" }}
              animate={{ y: 0, borderRadius: "24px 24px 0 0" }}
              exit={{ y: "110%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260, mass: 0.8 }}
              className="fixed bottom-0 left-0 right-0 max-h-[80vh] z-50 md:hidden flex flex-col overflow-y-auto"
              style={{ background: "linear-gradient(180deg, #0d0f11 0%, #09090b 100%)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Handle */}
              <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-0.5 rounded-full bg-white/10" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-2 pb-4 shrink-0">
                <div>
                  <span className="text-[11px] font-bold text-white/90 uppercase tracking-[0.15em]">Navegação</span>
                </div>
                <button
                  onClick={() => setIsCentralOptionsOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white cursor-pointer transition-colors"
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
                ].map((section, sIdx) => (
                  <div key={section.label}>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30 mb-2 px-1">{section.label}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {section.items.map((item, iIdx) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (sIdx * section.items.length + iIdx) * 0.03 + 0.05, type: "spring", stiffness: 300, damping: 24 }}
                          >
                            <Link href={item.href} onClick={() => setIsCentralOptionsOpen(false)}>
                              <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all cursor-pointer select-none active:scale-95 ${
                                isActive
                                  ? "bg-white/8 border-white/15 text-white"
                                  : "bg-white/3 border-white/5 text-white/60 hover:text-white hover:bg-white/6 hover:border-white/10"
                              }`}>
                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-white/40"}`} />
                                <span className="text-[11px] font-semibold truncate">{item.name}</span>
                              </div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Quick actions row */}
                <div className="pt-2 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => { setIsCentralOptionsOpen(false); setIsCommandPaletteOpen(true); }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/5 bg-white/3 text-white/50 hover:text-white hover:bg-white/6 transition-all cursor-pointer"
                    >
                      <Search className="w-4 h-4 shrink-0 text-white/30" />
                      <span className="text-[11px] font-semibold">Buscar</span>
                    </button>
                    <button
                      onClick={() => { setIsCentralOptionsOpen(false); handleLogout(); }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/5 bg-white/3 text-white/50 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0 text-white/30" />
                      <span className="text-[11px] font-semibold">Sair</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  Search,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Database,
  Terminal,
  User
} from "lucide-react";
import CommandPalette from "./CommandPalette";
import { useSettingsStore } from "@/stores/settingsStore";

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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sincroniza dinamicamente a cor das barras do celular Android/iOS (PWA) com a cor do tema ativo
  useEffect(() => {
    if (!mounted) return;

    let metaColor = "#110b1c"; // Fallback padrão
    if (themePreset === "synth-violet") metaColor = "#0b0713";
    else if (themePreset === "cyber-cyan") metaColor = "#03070b";
    else if (themePreset === "matrix-green") metaColor = "#020503";
    else if (themePreset === "sunset-horizon") metaColor = "#0a0604";
    else if (themePreset === "tokyo-neon") metaColor = "#080308";
    else if (themePreset === "carbon-stealth") metaColor = "#070708";
    else if (themePreset === "cyber-limon") metaColor = "#050805"; // Cor escura do novo tema Limon
    else if (themePreset === "custom") {
      if (customTheme.bgGradient === "bg-preset-synth") metaColor = "#0b0713";
      else if (customTheme.bgGradient === "bg-preset-cyber") metaColor = "#03070b";
      else if (customTheme.bgGradient === "bg-preset-matrix") metaColor = "#020503";
      else if (customTheme.bgGradient === "bg-preset-sunset") metaColor = "#0a0604";
      else if (customTheme.bgGradient === "bg-preset-tokyo") metaColor = "#080308";
      else if (customTheme.bgGradient === "bg-preset-carbon") metaColor = "#070708";
      else if (customTheme.bgGradient === "bg-preset-limon") metaColor = "#050805";
    }

    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", metaColor);
  }, [themePreset, customTheme, mounted]);

  
  useEffect(() => {
    setIsMobileMenuOpen(false);
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
    { name: "Chaveiro AES", href: "/dashboard/passwords", icon: Key },
    { name: "Galeria UHD", href: "/dashboard/wallpapers", icon: ImageIcon },
    { name: "Torrents", href: "/dashboard/torrents", icon: DownloadCloud },
    { name: "Arquivos", href: "/dashboard/files", icon: FolderOpen },
    { name: "Softwares", href: "/dashboard/software", icon: Cpu },
    { name: "Notas", href: "/dashboard/notes", icon: FileText },
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
      neonIntensityClass = `neon-intensity-${customTheme.neonIntensity}`;
      animationSpeedClass = `animation-speed-${customTheme.animationSpeed}`;
      gridStyleClass = `grid-style-${customTheme.gridStyle}`;
      
      if (customTheme.bgImage) {
        customStyle = {
          backgroundImage: `url(${customTheme.bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        };
      } else {
        themeBgClass = customTheme.bgGradient || "bg-preset-synth";
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
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden select-none">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted border border-border shrink-0">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-base font-bold tracking-wider text-white"
              >
                NEXUS <span className="text-primary font-medium text-xs border border-primary/20 px-1.5 py-0.5 rounded-md ml-1">VAULT</span>
              </motion.span>
            )}
          </Link>
        </div>

        {/* Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                      : "text-muted-foreground hover:text-white hover:bg-muted/40 border border-transparent"
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-105" : "group-hover:scale-105"}`} />
                  
                  {!isSidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                  
                  {isSidebarCollapsed && (
                    <div className="absolute left-16 scale-0 group-hover:scale-100 px-3 py-1.5 rounded-lg bg-popover border border-border text-xs text-white shadow-lg pointer-events-none transition-transform origin-left whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-3 border-t border-border flex flex-col gap-2 bg-muted/20">
          <div className="flex items-center gap-3 px-2 py-1.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-white font-semibold truncate leading-tight">Caio Sobrinho</span>
                <span className="text-[10px] text-muted-foreground truncate leading-none">Cofre Pessoal</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleLogout}
              className={`flex items-center justify-center text-muted-foreground hover:text-destructive p-2.5 rounded-xl hover:bg-muted/40 transition-colors w-full cursor-pointer text-sm gap-2 ${
                isSidebarCollapsed ? "" : "justify-start px-3"
              }`}
            >
              <LogOut className="w-4.5 h-4.5" />
              {!isSidebarCollapsed && <span>Bloquear Cofre</span>}
            </button>

            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-2.5 rounded-xl hover:bg-muted/40 text-muted-foreground hover:text-white cursor-pointer ml-auto"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-2 flex items-center justify-center rounded-xl hover:bg-muted/40 text-muted-foreground hover:text-white cursor-pointer w-full mt-1 border border-border/50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.aside>

      {/* 2. MAIN VIEW PANEL */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card/30 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-white cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground font-medium">Cofre</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-white font-semibold">{currentItem.name}</span>
            </div>
            <span className="md:hidden text-white font-bold text-base">
              {currentItem.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center justify-between w-40 md:w-64 px-3.5 py-2 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/85 text-xs text-muted-foreground transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                Buscar no cofre...
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border/70 bg-card text-[9px] font-mono leading-none">
                <span>Ctrl</span>K
              </kbd>
            </button>

            {/* Storage indicator */}
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-border/70 bg-card/40 text-xs">
              <Database className="w-3.5 h-3.5 text-primary" />
              <div className="flex flex-col min-w-16">
                <div className="flex justify-between text-[10px] leading-tight font-medium">
                  <span className="text-muted-foreground">Espaço Usado</span>
                  <span className="text-white">42%</span>
                </div>
                <div className="w-20 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "42%" }} />
                </div>
              </div>
            </div>
            
            {/* User Avatar */}
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 select-none">
              <span className="text-sm font-bold text-primary uppercase">{username.charAt(0)}</span>
            </div>
          </div>
        </header>

        {/* Contents */}
        <main className="flex-1 overflow-y-auto bg-background/55 relative p-4 md:p-6 pb-20 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* 3. BOTTOM NAV BAR MOBILE */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-card/65 backdrop-blur-2xl flex items-center justify-around px-2 z-30">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-14 h-full select-none">
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="flex flex-col items-center justify-center w-full h-full"
                >
                  <Icon className={`w-5.5 h-5.5 ${isActive ? "text-primary scale-110" : "text-muted-foreground"}`} />
                  <span className={`text-[10px] mt-1 font-medium ${isActive ? "text-white" : "text-muted-foreground"}`}>
                    {item.name.split(" ")[0]}
                  </span>
                </motion.div>
              </Link>
            );
          })}
          <motion.button
            onClick={() => setIsMobileMenuOpen(true)}
            whileTap={{ scale: 0.88 }}
            className="flex flex-col items-center justify-center w-14 h-full cursor-pointer select-none"
          >
            <Menu className="w-5.5 h-5.5 text-muted-foreground" />
            <span className="text-[10px] mt-1 font-medium text-muted-foreground">Menu</span>
          </motion.button>
        </nav>
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
                <div className="flex items-center gap-3 px-1">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">Caio Sobrinho</p>
                    <p className="text-xs text-muted-foreground">Sessão Ativa</p>
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
    </div>
  );
}

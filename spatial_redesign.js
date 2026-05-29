const fs = require('fs');
const path = require('path');

const shellPath = path.join(__dirname, 'src', 'components', 'DashboardShell.tsx');
let shell = fs.readFileSync(shellPath, 'utf8');

// 1. Substituir a inicialização das classes para não interferir com o Spatial Web
shell = shell.replace(
  /let themeBgClass = "bg-preset-[^"]+";[\s\S]*?if \(mounted\) \{[\s\S]*?\}/,
  `let themeBgClass = "bg-transparent";
  let neonIntensityClass = "";
  let animationSpeedClass = "";
  let gridStyleClass = "";
  let customStyle: React.CSSProperties = {};
  
  if (mounted && customTheme?.bgImage) {
    customStyle = {
      backgroundImage: \`url(\${customTheme.bgImage})\`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    };
  }`
);

// 2. Extrair o retorno do DashboardShell inteiro e substituir pelo novo Layout Espacial
const newReturn = `
  return (
    <div 
      style={customStyle}
      className={\`\${themeBgClass} min-h-screen w-full flex text-foreground overflow-hidden relative\`}
    >
      {/* 🌌 Aurora Background - Spatial Web Style */}
      <div className="aurora-bg">
        <div className="aurora-blob blob-1"></div>
        <div className="aurora-blob blob-2"></div>
        <div className="aurora-blob blob-3"></div>
        <div className="aurora-blob blob-4"></div>
      </div>
      
      {/* 1. SIDEBAR DESKTOP - Retrátil e Flutuante (Glassmorphism) */}
      <motion.aside
        onMouseEnter={() => setIsSidebarCollapsed(false)}
        onMouseLeave={() => setIsSidebarCollapsed(true)}
        initial={{ width: 80 }}
        animate={{ width: isSidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
        className="hidden md:flex flex-col h-[calc(100vh-32px)] my-4 ml-4 glass-panel z-40 relative"
      >
        {/* Header */}
        <div className="h-20 flex items-center px-4 mb-4 mt-2">
          <Link href="/dashboard" className="flex items-center gap-4 overflow-hidden select-none w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 shrink-0 shadow-[0_0_15px_rgba(94,92,230,0.3)]">
              <Terminal className="w-6 h-6 text-primary" />
            </div>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col"
              >
                <span className="font-bold text-white text-lg tracking-wide leading-tight">NEXUS</span>
                <span className="text-primary font-medium text-xs tracking-widest">VAULT</span>
              </motion.div>
            )}
          </Link>
        </div>

        {/* Links */}
        <nav className="flex-1 px-3 py-2 space-y-2 overflow-y-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  onClick={playClickSound}
                  onMouseEnter={playHoverSound}
                  className={\`flex items-center gap-4 px-3 py-3 rounded-xl transition-all group relative cursor-pointer \${
                    isActive
                      ? "bg-primary/20 text-white border border-primary/30 shadow-[0_0_15px_rgba(94,92,230,0.2)]"
                      : "text-muted-foreground hover:text-white hover:bg-white/10 border border-transparent"
                  }\`}
                >
                  <div className={\`flex items-center justify-center shrink-0 w-6 h-6 \${isActive ? "text-primary" : "group-hover:text-white"}\`}>
                    <Icon className={\`w-5 h-5 transition-transform \${isActive ? "scale-110" : "group-hover:scale-110"}\`} />
                  </div>
                  
                  {!isSidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="whitespace-nowrap font-medium text-sm tracking-wide"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer (Logout) */}
        <div className="p-4 mt-auto border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-3 py-3 rounded-xl w-full text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all group cursor-pointer border border-transparent hover:border-red-500/20"
          >
            <div className="flex items-center justify-center shrink-0 w-6 h-6">
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="whitespace-nowrap font-medium text-sm"
              >
                Sair
              </motion.span>
            )}
          </button>
        </div>
      </motion.aside>
      
      {/* 2. MAIN VIEW PANEL */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* TopHeader Glass */}
        <header className="h-20 hidden md:flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-wide">{currentItem.name}</h2>
          </div>

          <div className="flex items-center gap-4">
            {isUpdateAvailable && (
              <button onClick={handleUpdateApp} disabled={isUpdating} className="text-xs bg-primary text-white px-4 py-2 rounded-full font-bold animate-pulse cursor-pointer shadow-[0_0_15px_rgba(94,92,230,0.4)]">
                {isUpdating ? "Instalando..." : "Atualização Disponível"}
              </button>
            )}
            
            <button onClick={() => setIsCalculatorOpen(v => !v)} className="w-10 h-10 flex items-center justify-center rounded-full glass-panel hover:bg-white/10 text-muted-foreground hover:text-white transition-all cursor-pointer">
              <Calculator className="w-4 h-4" />
            </button>
            
            <button onClick={() => setIsRadioOpen(v => !v)} className="w-10 h-10 flex items-center justify-center rounded-full glass-panel hover:bg-white/10 text-muted-foreground hover:text-white transition-all cursor-pointer">
              <Music className="w-4 h-4" />
            </button>
            
            <button onClick={() => setIsCommandPaletteOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-full glass-panel hover:bg-white/10 text-muted-foreground hover:text-white transition-all cursor-pointer">
              <Search className="w-4 h-4" />
            </button>
            
            <button onClick={() => setIsNotificationsOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-full glass-panel hover:bg-white/10 text-muted-foreground hover:text-primary transition-all cursor-pointer relative">
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(94,92,230,0.8)]"></span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </button>
            
            <Link href="/dashboard/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 cursor-pointer hover:border-primary transition-all hover:scale-105 ml-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <img src={username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} className="w-full h-full object-cover" alt={username} />
            </Link>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-10 pb-24 scrollbar-none relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full relative z-10 pt-4"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <BottomBar 
        username={username}
        isCentralOptionsOpen={isCentralOptionsOpen}
        setIsCentralOptionsOpen={setIsCentralOptionsOpen}
        onSearchOpen={() => setIsCommandPaletteOpen(true)}
        onNotificationsOpen={() => setIsNotificationsOpen(true)}
      />

      <CommandPalette isOpen={isCommandPaletteOpen} setIsOpen={setIsCommandPaletteOpen} />
      
      {/* Central Menu Sheet (Mobile) */}
      <AnimatePresence>
        {isCentralOptionsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsCentralOptionsOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-[50px] left-0 right-0 z-40 bg-black/90 backdrop-blur-2xl rounded-t-3xl border-t border-white/10 pt-6 pb-6 px-4 md:hidden shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              
              <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                {navItems.filter(i => i.href !== "/dashboard").map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setIsCentralOptionsOpen(false)} className="flex flex-col items-center gap-2">
                      <div className={\`w-14 h-14 rounded-2xl flex items-center justify-center transition-all \${isActive ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-white/70 border border-white/10'}\`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-center font-medium text-white/80 leading-tight w-full truncate px-1">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="flex justify-around mt-8 pt-6 border-t border-white/10">
                <button onClick={() => { setIsCalculatorOpen(v => !v); setIsCentralOptionsOpen(false); }} className="flex flex-col items-center gap-2 text-white/70">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <span className="text-[10px]">Calc</span>
                </button>
                <button onClick={() => { setIsRadioOpen(v => !v); setIsCentralOptionsOpen(false); }} className="flex flex-col items-center gap-2 text-white/70">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Music className="w-5 h-5" />
                  </div>
                  <span className="text-[10px]">Rádio</span>
                </button>
                <button onClick={handleLogout} className="flex flex-col items-center gap-2 text-red-400">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="text-[10px]">Sair</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SynthwaveRadio isOpen={isRadioOpen} onClose={() => setIsRadioOpen(false)} />
      <CyberCalculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
    </div>
  );
}`;

shell = shell.replace(/return \(\s*<div\s*style=\{customStyle\}[\s\S]*?\);\s*\}/, newReturn + '\n}');

fs.writeFileSync(shellPath, shell, 'utf8');
console.log('DashboardShell.tsx overwritten successfully with Spatial Web Layout.');

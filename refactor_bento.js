const fs = require('fs');
const path = require('path');

const shellPath = path.join(__dirname, 'src', 'components', 'DashboardShell.tsx');
const pagePath = path.join(__dirname, 'src', 'app', '(dashboard)', 'dashboard', 'page.tsx');

let shell = fs.readFileSync(shellPath, 'utf8');
let page = fs.readFileSync(pagePath, 'utf8');

// === 1. REFACTOR DASHBOARDSHELL ===

// Remove Sidebar
shell = shell.replace(/\{\/\*\s*1\.\s*SIDEBAR DESKTOP\s*\*\/\}.*?\{\/\*\s*2\.\s*MAIN VIEW PANEL\s*\*\/\}/s, '{/* 2. MAIN VIEW PANEL */}');

// Rewrite Top Header to Dynamic Island
const islandHeader = `
        {/* Dynamic Island TopBar */}
        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-full px-5 py-2 flex items-center gap-6 shadow-2xl border border-white/10 hidden md:flex transition-all hover:bg-background/80 hover:border-white/20">
          <div className="flex items-center gap-3 pr-4 border-r border-border/50">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-white tracking-widest text-sm">NEXUS</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-primary font-display text-xs font-bold uppercase tracking-widest px-2">{currentItem.name}</span>
            {isUpdateAvailable && (
              <button onClick={handleUpdateApp} disabled={isUpdating} className="text-xs bg-primary text-black px-3 py-1 rounded-full font-bold animate-pulse cursor-pointer">
                {isUpdating ? "Instalando..." : "Atualizar App"}
              </button>
            )}
            <button onClick={() => { playClickSound(); setIsCommandPaletteOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer">
              <Search className="w-4 h-4" />
            </button>
            <button onClick={() => { playClickSound(); setIsNotificationsOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors cursor-pointer relative">
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary shadow-[0_0_5px_rgba(212,175,55,1)]"></span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </button>
            <Link href="/dashboard/profile" className="w-8 h-8 rounded-full overflow-hidden border border-border cursor-pointer hover:scale-105 transition-transform ml-1">
              <img src={username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} className="w-full h-full object-cover" alt={username} />
            </Link>
          </div>
        </header>
`;
shell = shell.replace(/\{\/\*\s*Top Header\s*\*\/\}.*?<main /s, islandHeader + '\n        <main ');

// Modify main layout
shell = shell.replace(/<main className="flex-1 overflow-y-auto bg-background\/35 relative pt-6 px-4 md:p-8 lg:p-10 pb-\[70px\] md:pb-8">/g, '<main className="flex-1 w-full h-full overflow-y-auto relative pt-24 pb-32 px-4 md:px-10 lg:px-16 scrollbar-none">');

// Add Floating Dock after main
const floatingDock = `
      {/* 3. BOTTOM NAV BAR MOBILE — Fixed black bar */}
      {/* Floating Dock Desktop */}
      <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-2xl p-2 items-center gap-2 shadow-[0_15px_35px_rgba(0,0,0,0.5)] border border-white/10 bg-background/60 backdrop-blur-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} className="group relative">
              <div onClick={playClickSound} onMouseEnter={playHoverSound} className={\`w-12 h-12 flex items-center justify-center rounded-xl transition-all cursor-pointer \${isActive ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]" : "text-muted-foreground hover:text-white hover:bg-white/5"}\`}>
                <Icon className={\`w-5 h-5 transition-transform \${isActive ? "scale-110" : "group-hover:scale-110 group-hover:-translate-y-1"}\`} />
              </div>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-white text-[10px] font-bold px-2 py-1 rounded pointer-events-none whitespace-nowrap shadow-xl border border-border/50">
                {item.name}
              </div>
            </Link>
          );
        })}
        <div className="w-[1px] h-8 bg-border/50 mx-2"></div>
        <button onClick={() => { playClickSound(); setIsCalculatorOpen(v => !v); }} className="group relative w-12 h-12 flex items-center justify-center rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all cursor-pointer">
          <Calculator className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
        </button>
        <button onClick={() => { playClickSound(); setIsRadioOpen(v => !v); }} className="group relative w-12 h-12 flex items-center justify-center rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all cursor-pointer">
          <Music className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
        </button>
        <button onClick={handleLogout} className="group relative w-12 h-12 flex items-center justify-center rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer ml-2 border border-red-500/10">
          <LogOut className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>
`;
shell = shell.replace(/\{\/\*\s*3\.\s*BOTTOM NAV BAR MOBILE.*?<BottomBar/s, floatingDock + '\n        <BottomBar');


// === 2. REFACTOR DASHBOARD PAGE ===

// The page return block
const newPageReturn = `
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 auto-rows-[minmax(120px,auto)] pb-24"
    >
      {/* Bento Hero Widget */}
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-4 lg:col-span-12 xl:col-span-8 row-span-2 glass-panel p-6 sm:p-10 flex flex-col justify-center relative overflow-hidden group border border-primary/20 hover:border-primary/40 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 blur-[80px] group-hover:bg-primary/30 transition-colors pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-primary/30 overflow-hidden shrink-0 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            <img src={session?.user?.username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} className="w-full h-full object-cover" alt="User" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight uppercase">Bem-vindo, <span className="text-primary">{session?.user?.username || 'Usuário'}</span></h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">Sessão Segura • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-3">
              <button onClick={() => router.push('/dashboard/files')} className="bg-primary text-black font-bold px-6 py-2.5 rounded-sm hover:scale-105 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.4)] cursor-pointer">Meus Arquivos</button>
              <button onClick={() => router.push('/dashboard/passwords')} className="bg-white/5 border border-white/10 text-white font-bold px-6 py-2.5 rounded-sm hover:bg-white/10 transition-colors cursor-pointer">Cofre de Senhas</button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bento Storage Widget */}
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-6 xl:col-span-4 row-span-2 flex flex-col h-full">
        {renderStorage(1)}
      </motion.div>

      {/* Bento Shortcuts Widget */}
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-6 xl:col-span-4 row-span-2 flex flex-col h-full">
        {renderShortcuts(2)}
      </motion.div>

      {/* Bento Recent Activities Widget */}
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-4 lg:col-span-6 xl:col-span-8 row-span-3 flex flex-col h-full">
        {renderRecentActivities(3)}
      </motion.div>

      {/* Dev Components & Operations */}
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-4 lg:col-span-6 xl:col-span-4 row-span-3 space-y-6 flex flex-col h-full">
        {renderDevComponents(4)}
        <RssTechWidget key="rss_tech" idx={5} renderHeader={renderWidgetHeader} itemVariants={itemVariants} />
      </motion.div>

      {/* Compact Metrics Grid spanning full width at bottom */}
      <motion.div variants={itemVariants} className="col-span-1 md:col-span-4 lg:col-span-12 xl:col-span-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {moduleStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.name} whileTap={{ scale: 0.97 }} onClick={() => router.push(stat.href)} className="group cursor-pointer p-4 h-[80px] glass-panel border border-primary/10 hover:border-primary/45 transition-colors flex items-center justify-between shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
                <div className="flex items-center gap-4">
                  <div className={\`p-3 rounded border \${stat.color}\`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white/95 group-hover:text-primary transition-colors">{stat.name}</h3>
                    <p className="text-xs text-muted-foreground">{stat.details}</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-white group-hover:text-primary">{stat.count}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
`;

page = page.replace(/return \(\s*<motion\.div\s*variants=\{containerVariants\}\s*initial="hidden"\s*animate="show"\s*className="space-y-6"\s*>.*?<\/motion\.div>\s*\);\s*\}/s, newPageReturn);

// Also need to modify the widgets themselves to stretch h-full
page = page.replace(/className="glass-panel neon-glow-card flex flex-col h-\[420px\]"/g, 'className="glass-panel neon-glow-card flex flex-col h-full min-h-[300px]"');
page = page.replace(/className="glass-panel neon-glow-card h-\[420px\] flex flex-col"/g, 'className="glass-panel neon-glow-card flex flex-col h-full min-h-[300px]"');
page = page.replace(/className="glass-panel neon-glow-card p-5 h-full relative overflow-hidden flex flex-col"/g, 'className="glass-panel neon-glow-card p-5 h-full relative overflow-hidden flex flex-col min-h-[300px]"');
page = page.replace(/className="glass-panel neon-glow-card p-5 overflow-hidden flex flex-col justify-between"/g, 'className="glass-panel neon-glow-card p-5 h-full min-h-[300px] overflow-hidden flex flex-col justify-between"');
page = page.replace(/className="glass-panel neon-glow-card p-5 flex flex-col h-\[200px\]"/g, 'className="glass-panel neon-glow-card p-5 flex flex-col h-full min-h-[300px]"');

fs.writeFileSync(shellPath, shell, 'utf8');
fs.writeFileSync(pagePath, page, 'utf8');
console.log("Refactoring complete");

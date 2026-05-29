const fs = require('fs');
const path = require('path');

const shellPath = path.join(__dirname, 'src', 'components', 'DashboardShell.tsx');
let content = fs.readFileSync(shellPath, 'utf8');

const startIndex = content.indexOf('{/* 1. SIDEBAR DESKTOP');
const endIndex = content.indexOf('</motion.aside>') + '</motion.aside>'.length;

const newAside = `{/* 1. SIDEBAR DESKTOP - Retrátil e Flutuante (Glassmorphism) */}
      <motion.aside
        initial={{ width: 80 }}
        animate={{ width: isSidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1], delay: isSidebarCollapsed ? 0.2 : 0 }}
        className="hidden md:flex flex-col h-[calc(100vh-32px)] my-4 ml-4 glass-panel z-40 absolute left-0"
      >
        {/* Botão de Toggle Manual */}
        <button 
          onClick={() => setIsSidebarCollapsed(v => !v)}
          className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-[0_0_15px_rgba(94,92,230,0.5)] z-50 cursor-pointer hover:scale-110 transition-transform"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Header */}
        <div className="h-20 flex items-center px-4 mb-4 mt-2">
          <Link href="/dashboard" className="flex items-center gap-4 overflow-hidden select-none w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 shrink-0 shadow-[0_0_15px_rgba(94,92,230,0.3)]">
              <Terminal className="w-6 h-6 text-primary" />
            </div>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: isSidebarCollapsed ? 0 : 0.3 }}
                  className="flex flex-col whitespace-nowrap"
                >
                  <span className="font-bold text-white text-lg tracking-wide leading-tight">NEXUS</span>
                  <span className="text-primary font-medium text-xs tracking-widest">VAULT</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Links */}
        <nav className="flex-1 px-3 py-2 space-y-2 overflow-y-auto scrollbar-none overflow-x-hidden">
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
                  
                  <AnimatePresence>
                    {!isSidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: isSidebarCollapsed ? 0 : 0.3 }}
                        className="whitespace-nowrap font-medium text-sm tracking-wide"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer (Logout) */}
        <div className="p-4 mt-auto border-t border-white/10 overflow-hidden">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-3 py-3 rounded-xl w-full text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all group cursor-pointer border border-transparent hover:border-red-500/20"
          >
            <div className="flex items-center justify-center shrink-0 w-6 h-6">
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: isSidebarCollapsed ? 0 : 0.3 }}
                  className="whitespace-nowrap font-medium text-sm"
                >
                  Sair
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>`;

content = content.substring(0, startIndex) + newAside + content.substring(endIndex);
fs.writeFileSync(shellPath, content, 'utf8');
console.log('Sidebar animation updated successfully');

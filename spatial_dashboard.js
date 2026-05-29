const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', '(dashboard)', 'dashboard', 'page.tsx');
let page = fs.readFileSync(pagePath, 'utf8');

// Substitui o return completo
const newPageReturn = `
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* 🔮 Spatial Hero Header */}
      <motion.div variants={itemVariants} className="glass-panel p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-white/20 overflow-hidden shrink-0 shadow-[0_0_40px_rgba(255,255,255,0.1)] relative group-hover:scale-105 transition-transform duration-500">
          <img src={session?.user?.username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} className="w-full h-full object-cover" alt="User" />
        </div>
        
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Bem-vindo, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{session?.user?.username || 'Usuário'}</span></h1>
          <p className="text-white/60 mt-2 text-lg">Central Vault • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
            <button onClick={() => router.push('/dashboard/files')} className="glass-button-primary flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Meus Arquivos
            </button>
            <button onClick={() => router.push('/dashboard/passwords')} className="glass-button flex items-center gap-2">
              <Key className="w-5 h-5" />
              Cofre de Senhas
            </button>
          </div>
        </div>
      </motion.div>

      {/* Grid Central */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Storage Widget */}
        <motion.div variants={itemVariants} className="glass-panel p-6 flex flex-col min-h-[320px]">
          {renderStorage(1)}
        </motion.div>

        {/* Shortcuts Widget */}
        <motion.div variants={itemVariants} className="glass-panel p-6 flex flex-col min-h-[320px]">
          {renderShortcuts(2)}
        </motion.div>

        {/* RSS Tech Widget (Now smaller and cleaner) */}
        <motion.div variants={itemVariants} className="glass-panel p-6 flex flex-col min-h-[320px]">
          <RssTechWidget key="rss_tech" idx={5} renderHeader={renderWidgetHeader} itemVariants={itemVariants} />
        </motion.div>
        
        {/* Recent Activities - Takes 2 columns */}
        <motion.div variants={itemVariants} className="glass-panel p-6 md:col-span-2 flex flex-col min-h-[360px]">
          {renderRecentActivities(3)}
        </motion.div>

        {/* Dev Options */}
        <motion.div variants={itemVariants} className="glass-panel p-6 flex flex-col min-h-[360px]">
          {renderDevComponents(4)}
        </motion.div>
      </div>

      {/* Metrics Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {moduleStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} onClick={() => router.push(stat.href)} className="glass-panel p-4 flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={\`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 \${stat.color}\`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="hidden sm:block">
                  <h3 className="font-semibold text-white/90 group-hover:text-primary transition-colors">{stat.name}</h3>
                  <p className="text-xs text-white/50">{stat.details}</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{stat.count}</span>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
`;

page = page.replace(/return \(\s*<motion\.div[\s\S]*?\);\s*\}/s, newPageReturn + '\n}');

// Agora vamos limpar os widgets internos que estão no mesmo arquivo, substituindo bg ruins por bg transparente
// Porque o glass-panel em volta já fará o trabalho!
page = page.replace(/className="[^"]*neon-glow-card[^"]*"/g, 'className="flex flex-col h-full"');
page = page.replace(/bg-card\/40/g, 'bg-transparent');
page = page.replace(/bg-black\/40/g, 'bg-white/5');
page = page.replace(/border-border/g, 'border-white/10');
page = page.replace(/border-primary\/30/g, 'border-white/20');
page = page.replace(/bg-muted\/20/g, 'bg-white/5');
page = page.replace(/text-muted-foreground/g, 'text-white/60');
page = page.replace(/text-foreground/g, 'text-white/90');

fs.writeFileSync(pagePath, page, 'utf8');
console.log('dashboard/page.tsx rewritten successfully with Spatial Web Layout.');

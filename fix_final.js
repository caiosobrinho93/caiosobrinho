const fs = require('fs');
const path = require('path');

// 1. Fix DashboardShell.tsx Theme overwrite
const shellPath = path.join(__dirname, 'src', 'components', 'DashboardShell.tsx');
let shellContent = fs.readFileSync(shellPath, 'utf8');

shellContent = shellContent.replace(
  'customStyle = {\n      backgroundImage: `url(${customTheme.bgImage})`,',
  'customStyle = {\n      ...customStyle,\n      backgroundImage: `url(${customTheme.bgImage})`,'
);

// Fallback if formatting is slightly different
shellContent = shellContent.replace(
  'customStyle = {\n        backgroundImage: `url(${customTheme.bgImage})`,',
  'customStyle = {\n        ...customStyle,\n        backgroundImage: `url(${customTheme.bgImage})`,'
);

fs.writeFileSync(shellPath, shellContent, 'utf8');


// 2. Insert Modal in page.tsx
const pagePath = path.join(__dirname, 'src', 'app', '(dashboard)', 'dashboard', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

if (!pageContent.includes('Notifications Modal')) {
  const modalCode = `
      {/* Notifications Modal */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              onClick={() => setIsNotificationsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-panel p-6 flex flex-col z-10 shadow-[0_0_50px_rgba(255,45,85,0.2)]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Bell className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Notificações</h2>
                </div>
                <button onClick={() => setIsNotificationsOpen(false)} className="text-white/50 hover:text-white transition-colors cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-none">
                {[
                  { id: 1, title: 'Nova Meta Adicionada', desc: 'Sua meta foi criada.', time: 'Agora mesmo', read: false },
                  { id: 2, title: 'Atualização do Sistema', desc: 'Nexus Vault v2.0 disponível.', time: 'Há 2 horas', read: false },
                  { id: 3, title: 'Backup Concluído', desc: 'Seu cofre foi salvo com sucesso.', time: 'Ontem', read: false }
                ].map((notif) => (
                  <div key={notif.id} className={\`p-4 rounded-xl border \${notif.read ? 'bg-white/5 border-white/10' : 'bg-primary/10 border-primary/30'} flex flex-col gap-1\`}>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white text-sm">{notif.title}</span>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-primary mt-1"></span>}
                    </div>
                    <span className="text-white/60 text-xs">{notif.desc}</span>
                    <span className="text-white/40 text-[10px] mt-1 font-mono">{notif.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;
  
  // Insert exactly before `  );\n}`
  const lastIndex = pageContent.lastIndexOf('  );\n}');
  if (lastIndex !== -1) {
    pageContent = pageContent.substring(0, lastIndex) + modalCode + pageContent.substring(lastIndex);
  }
  
  fs.writeFileSync(pagePath, pageContent, 'utf8');
}
console.log('Final fixes applied.');

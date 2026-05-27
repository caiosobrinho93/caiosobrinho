const fs = require('fs');
const path = require('path');

// 1. Delete Kanban folder
const kanbanDir = 'src/app/(dashboard)/dashboard/kanban';
if (fs.existsSync(kanbanDir)) {
  fs.rmSync(kanbanDir, { recursive: true, force: true });
  console.log('Kanban deleted');
}

// 2. Fix DashboardShell.tsx
let shellFile = 'src/components/DashboardShell.tsx';
let shellContent = fs.readFileSync(shellFile, 'utf8');

// Remove kanban from navItems
shellContent = shellContent.replace(/\s*\{ name: "Metas & Kanban", href: "\/dashboard\/kanban", icon: LayoutGrid \},/g, '');
// Remove kanban from central menu
shellContent = shellContent.replace(/\s*\{ href: "\/dashboard\/kanban", icon: LayoutGrid, name: "Metas" \},/g, '');

// Fix user card repetition in Sidebar ("CAIO CAIO")
// Currently looks like: {username === "caio" ? "Caio" : username === "giselle" ? "Giselle" : username}
shellContent = shellContent.replace(
  /<p className="text-sm font-bold text-white leading-tight">\s*\{username === "caio" \? "Caio" : username === "giselle" \? "Giselle" : username\}\s*<\/p>/g,
  '<p className="text-sm font-bold text-white leading-tight capitalize">{username}</p>'
);
shellContent = shellContent.replace(
  /<span className="text-sm text-white font-bold truncate leading-tight">\s*\{username === "caio" \? "Caio" : username === "giselle" \? "Giselle" : username\}\s*<\/span>/g,
  '<span className="text-sm text-white font-bold truncate leading-tight capitalize">{username}</span>'
);

// Add isNotificationsOpen state and Notification Modal to DashboardShell
if (!shellContent.includes('const [isNotificationsOpen, setIsNotificationsOpen]')) {
  shellContent = shellContent.replace(
    /const \[isRadioOpen, setIsRadioOpen\] = useState\(false\);/,
    `const [isRadioOpen, setIsRadioOpen] = useState(false);\n  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);`
  );
}

// Make the bell button toggle isNotificationsOpen
shellContent = shellContent.replace(
  /<button\s+title="Notifica\u00e7\u00f5es"/,
  `<button\n              onClick={() => { playClickSound(); setIsNotificationsOpen(true); }}\n              title="Notifica\u00e7\u00f5es"`
);

// Add the Notification Modal JSX just before </AnimatePresence> for the CentralOptions drawer
const notificationModalJSX = `
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
`;

if (!shellContent.includes('NOTIFICATIONS MODAL')) {
  shellContent = shellContent.replace(/<SynthwaveRadio/g, notificationModalJSX + '\n      <SynthwaveRadio');
}

fs.writeFileSync(shellFile, shellContent, 'utf8');
console.log('DashboardShell fixed');

// 3. Fix dashboard/page.tsx
let dashboardFile = 'src/app/(dashboard)/dashboard/page.tsx';
let dashboardContent = fs.readFileSync(dashboardFile, 'utf8');

// Remove Pix Premio completely
dashboardContent = dashboardContent.replace(/\{\/\* Baú de Prêmios Pix \*\/\}([\s\S]*?)renderWidgetHeader\("Baú de Prêmios Pix"([\s\S]*?)<\/motion\.div>/g, '');

// Fix div padding to enforce 60px height
// Old: className="group cursor-pointer relative overflow-hidden p-5.5 glass-panel flex items-center justify-between border border-primary/10 rounded-sm hover:border-primary/45 transition-colors"
dashboardContent = dashboardContent.replace(/p-5\.5 glass-panel flex items-center justify-between border/g, 'p-3 h-[60px] glass-panel flex items-center justify-between border');

fs.writeFileSync(dashboardFile, dashboardContent, 'utf8');
console.log('Dashboard page fixed');

// 4. Fix Notes AutoSave Icon
let notesFile = 'src/app/(dashboard)/dashboard/notes/page.tsx';
if (fs.existsSync(notesFile)) {
  let notesContent = fs.readFileSync(notesFile, 'utf8');
  // Moving the cloud-off / loader absolute positioning
  // Originally it was likely absolute bottom-4 right-4.
  notesContent = notesContent.replace(/className="absolute bottom-4 right-4/g, 'className="absolute top-4 right-4');
  notesContent = notesContent.replace(/className="absolute bottom-5 right-5/g, 'className="absolute top-4 right-4');
  fs.writeFileSync(notesFile, notesContent, 'utf8');
  console.log('Notes autosave icon fixed');
}

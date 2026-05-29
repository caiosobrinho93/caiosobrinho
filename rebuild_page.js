const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', '(dashboard)', 'dashboard', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Ensure Bell is in lucide imports
if (!content.includes('Bell\n} from "lucide-react";') && !content.includes('Bell,')) {
    content = content.replace(/Code\r?\n\} from "lucide-react";/, 'Code,\n  Bell\n} from "lucide-react";');
}

// 2. Add isNotificationsOpen state
const stateInsertIdx = content.indexOf('const [isAddingGoal, setIsAddingGoal] = useState(false);');
if (stateInsertIdx !== -1 && !content.includes('isNotificationsOpen')) {
  content = content.substring(0, stateInsertIdx) + 
    'const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);\n  ' + 
    content.substring(stateInsertIdx);
}

// 3. Remove Dev Components
const devCompDefStart = content.indexOf('const renderDevComponents');
if (devCompDefStart !== -1) {
    const devCompDefEnd = content.indexOf('const renderOperations');
    content = content.substring(0, devCompDefStart) + content.substring(devCompDefEnd);
}
content = content.replace(/\{renderDevComponents\(6\)\}/g, '');

// 4. Inject Hero Header
const gradeStart = content.indexOf('{/* Grade de Métricas Compacta (Horizontal) */}');
if (gradeStart !== -1 && !content.includes('Spatial Hero Header')) {
  const newHero = `{/* 🔮 Spatial Hero Header */}
      <motion.div variants={itemVariants} className="glass-panel p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 z-10 w-full md:w-auto">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-white/20 overflow-hidden shrink-0 shadow-[0_0_40px_rgba(255,255,255,0.1)] relative group-hover:scale-105 transition-transform duration-500">
            <img src={data?.profile?.username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"} className="w-full h-full object-cover" alt="User" />
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Bem-vindo, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{data?.profile?.username || 'Usuário'}</span></h1>
            
            <div className="mt-6 max-w-md w-full mx-auto md:mx-0">
               {/* XP Bar */}
               <div className="flex justify-between text-xs font-mono text-white/60 mb-2">
                  <span>Nível {data?.profile?.level || 1}</span>
                  <span className="text-primary font-bold">{currentLevelXp}/1000 XP</span>
               </div>
               <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000" style={{ width: \`\${xpPercentage}%\` }} />
               </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Notification */}
        <div className="z-10 mt-6 md:mt-0 flex items-center justify-center shrink-0">
           <button 
             onClick={() => setIsNotificationsOpen(true)}
             className="relative w-16 h-16 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-all group cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(94,92,230,0.3)] hover:border-primary/50"
           >
             <Bell className="w-7 h-7 text-white/80 group-hover:text-primary transition-colors" />
             <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center text-[11px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.6)]">
               3
             </span>
           </button>
        </div>
      </motion.div>

      `;
  
  content = content.substring(0, gradeStart) + newHero + content.substring(gradeStart);
}

// 5. Inject Notifications Modal
const finalReturnEnd = content.lastIndexOf('</motion.div>\n    </motion.div>\n  );\n\n}');
if (finalReturnEnd !== -1 && !content.includes('Notifications Modal')) {
  const modalCode = `

      {/* Notifications Modal */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative w-full max-w-md glass-panel p-6 flex flex-col z-10 border-primary/20 shadow-[0_0_50px_rgba(94,92,230,0.2)]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Bell className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Notificações</h2>
                </div>
                <button onClick={() => setIsNotificationsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-none">
                {[
                  { id: 1, title: 'Nova Meta Adicionada', desc: 'Sua meta "Aprender Rust" foi criada.', time: 'Agora mesmo', read: false },
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
  content = content.substring(0, finalReturnEnd) + modalCode + content.substring(finalReturnEnd);
}

// 6. Fix classes for height and padding
content = content.replace(/neon-glow-card/g, 'h-full flex flex-col');
content = content.replace(/className="p-3 bg-muted\/10/g, 'className="p-3 bg-muted/10'); // Restore small padding if it was there
content = content.replace(/className="h-[50px] !p-2.5/g, 'className="h-12 !p-2.5'); // smaller buttons

fs.writeFileSync(pagePath, content, 'utf8');
console.log('page.tsx ALL updates applied correctly from scratch.');

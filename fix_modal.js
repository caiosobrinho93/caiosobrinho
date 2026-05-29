const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', '(dashboard)', 'dashboard', 'page.tsx');
let page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('Notifications Modal')) {
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
              className="relative w-full max-w-md glass-panel p-6 flex flex-col z-10 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]"
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
  
  page = page.replace('    </motion.div>\r\n  );\r\n}', modalCode + '    </motion.div>\r\n  );\r\n}');
  page = page.replace('    </motion.div>\n  );\n}', modalCode + '    </motion.div>\n  );\n}'); // fallback
  
  fs.writeFileSync(pagePath, page, 'utf8');
  console.log('Modal injected!');
} else {
  console.log('Modal already exists.');
}

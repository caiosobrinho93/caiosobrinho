const fs = require('fs');

// ────────────────────────────────────────────────────────────────
// 1. DashboardShell.tsx — Big overhaul
// ────────────────────────────────────────────────────────────────
const shellPath = 'src/components/DashboardShell.tsx';
let shell = fs.readFileSync(shellPath, 'utf8');

// A. Update BottomBar to add username, search and notification bell
const oldBottomBar = `// BottomBar sub-component
function BottomBar({
  username,
  isCentralOptionsOpen,
  setIsCentralOptionsOpen,
}: {
  username: string;
  isCentralOptionsOpen: boolean;
  setIsCentralOptionsOpen: (v: (prev: boolean) => boolean) => void;
}) {
  const stats = useStatsStore((s) => s.data);
  const xpInLevel = stats ? stats.profile.xp % 1000 : 0;
  const xpPct = (xpInLevel / 1000) * 100;
  const level = stats ? stats.profile.level : 1;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-[50px] flex items-center justify-between px-4 border-t border-white/[0.06] bg-black/95 backdrop-blur-xl safe-area-bottom">
      {/* Left: Menu button */}
      <motion.button
        onClick={() => setIsCentralOptionsOpen((v) => !v)}
        whileTap={{ scale: 0.88 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={\`flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer \${
          isCentralOptionsOpen
            ? "bg-white/10 border-white/20 text-white"
            : "bg-transparent border-transparent text-white/60 hover:text-white"
        }\`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isCentralOptionsOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <X className="w-5 h-5" />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <LayoutGrid className="w-5 h-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Center: App name */}
      <span className="text-xs font-bold text-white/30 tracking-widest uppercase select-none">NEXUS</span>

      {/* Right: Avatar + Level + XP bar */}
      <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Lv {level}</span>
          </div>
          <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: \`\${xpPct}%\` }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/50 shrink-0">
          <img
            src={username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"}
            alt={username}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
    </div>
  );
}`;

const newBottomBar = `// BottomBar sub-component
function BottomBar({
  username,
  isCentralOptionsOpen,
  setIsCentralOptionsOpen,
  onSearchOpen,
  onNotificationsOpen,
}: {
  username: string;
  isCentralOptionsOpen: boolean;
  setIsCentralOptionsOpen: (v: (prev: boolean) => boolean) => void;
  onSearchOpen: () => void;
  onNotificationsOpen: () => void;
}) {
  const stats = useStatsStore((s) => s.data);
  const xpInLevel = stats ? stats.profile.xp % 1000 : 0;
  const xpPct = (xpInLevel / 1000) * 100;
  const level = stats ? stats.profile.level : 1;
  const displayName = username === "caio" ? "Caio" : username === "giselle" ? "Giselle" : username;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-[54px] flex items-center justify-between px-3 border-t border-white/[0.06] bg-black/95 backdrop-blur-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Left: Menu button */}
      <motion.button
        onClick={() => setIsCentralOptionsOpen((v) => !v)}
        whileTap={{ scale: 0.88 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={\`flex items-center justify-center w-10 h-10 rounded-xl transition-all cursor-pointer \${
          isCentralOptionsOpen ? "text-white" : "text-white/60"
        }\`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isCentralOptionsOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <X className="w-5 h-5" />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <LayoutGrid className="w-5 h-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Center: Search + Notification */}
      <div className="flex items-center gap-1">
        <button
          onClick={onSearchOpen}
          className="flex items-center justify-center w-10 h-10 rounded-xl text-white/50 hover:text-white transition-colors cursor-pointer"
          title="Buscar"
        >
          <Search className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={onNotificationsOpen}
          className="relative flex items-center justify-center w-10 h-10 rounded-xl text-white/50 hover:text-white transition-colors cursor-pointer"
          title="Notificações"
        >
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#8fe319]" />
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>
      </div>

      {/* Right: Avatar + Name + Level + XP bar */}
      <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] font-bold text-white/80 leading-none capitalize">{displayName}</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[9px] font-bold text-primary">Lv {level}</span>
            <div className="w-14 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: \`\${xpPct}%\` }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/40 shrink-0">
          <img
            src={username === "caio" ? "/avatar-caio.png" : "/avatar-giselle.png"}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
    </div>
  );
}`;

if (shell.includes('// BottomBar sub-component')) {
  shell = shell.replace(oldBottomBar, newBottomBar);
  console.log('✅ BottomBar updated');
} else {
  console.log('⚠️  BottomBar pattern not found');
}

// B. Hide the top header on mobile (add hidden md:flex instead of flex)
shell = shell.replace(
  '<header className="h-14 border-b border-border/80 bg-background/25 backdrop-blur-xl flex items-center justify-between px-4 md:px-5 shrink-0 z-20">',
  '<header className="h-14 border-b border-border/80 bg-background/25 backdrop-blur-xl hidden md:flex items-center justify-between px-5 shrink-0 z-20">'
);
console.log('✅ Header hidden on mobile');

// C. Remove mobile menu button and mobile page name from header (they're inside the now-hidden header, but let's keep header clean)
// The header is now md:hidden so mobile items inside are irrelevant. Still keep for desktop.

// D. Update BottomBar usage to pass the new props
shell = shell.replace(
  `        <BottomBar
          username={username}
          isCentralOptionsOpen={isCentralOptionsOpen}
          setIsCentralOptionsOpen={setIsCentralOptionsOpen}
        />`,
  `        <BottomBar
          username={username}
          isCentralOptionsOpen={isCentralOptionsOpen}
          setIsCentralOptionsOpen={setIsCentralOptionsOpen}
          onSearchOpen={() => { playClickSound(); setIsCommandPaletteOpen(true); }}
          onNotificationsOpen={() => { playClickSound(); setIsNotificationsOpen(true); }}
        />`
);
console.log('✅ BottomBar props updated');

// E. Update main padding — no header on mobile so pb only for bottom bar
shell = shell.replace(
  '<main className="flex-1 overflow-y-auto bg-background/35 relative p-4 md:p-8 lg:p-10 pb-[66px] md:pb-8">',
  '<main className="flex-1 overflow-y-auto bg-background/35 relative pt-4 px-4 md:p-8 lg:p-10 pb-[66px] md:pb-8">'
);
console.log('✅ Main padding updated (no top padding offset needed since no mobile header)');

// F. Upgrade the drawer sections — colorful icons per section
const oldDrawerSections = `              {/* Sections */}
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
                  {
                    label: "Utilitários HUD",
                    items: [
                      { onClick: () => setIsCalculatorOpen(v => !v), icon: Calculator, name: "Calculadora" },
                      { onClick: () => setIsStickyNotesOpen(v => !v), icon: Pin, name: "Rascunho HUD" },
                      { onClick: () => setIsRadioOpen(v => !v), icon: Music, name: "Rádio Synth" },
                    ] as any[],
                  },
                ].map((section, sIdx) => (
                  <div key={section.label}>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30 mb-2 px-1">{section.label}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {section.items.map((item, iIdx) => {
                        const Icon = item.icon;
                        const isActive = item.href ? pathname === item.href : false;
                        
                        const elementContent = (
                          <div className={\`flex items-center gap-5.5 px-3 py-2.5 rounded-xl border transition-all cursor-pointer select-none active:scale-95 \${
                            isActive
                              ? "bg-white/8 border-white/15 text-white"
                              : "bg-white/3 border-white/5 text-white/60 hover:text-white hover:bg-white/6 hover:border-white/10"
                          }\`}>
                            <Icon className={\`w-4 h-4 shrink-0 \${isActive ? "text-primary" : "text-white/40"}\`} />
                            <span className="text-sm font-semibold truncate">{item.name}</span>
                          </div>
                        );

                        return (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (sIdx * 4 + iIdx) * 0.03 + 0.05, type: "spring", stiffness: 300, damping: 24 }}
                          >
                            {item.href ? (
                              <Link href={item.href} onClick={() => setIsCentralOptionsOpen(false)}>
                                {elementContent}
                              </Link>
                            ) : (
                              <div onClick={() => { setIsCentralOptionsOpen(false); item.onClick(); }}>
                                {elementContent}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Quick actions row */}
                <div className="pt-2 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { setIsCentralOptionsOpen(false); setIsCommandPaletteOpen(true); }}
                      className="flex items-center gap-5.5 px-3 py-2.5 rounded-xl border border-white/5 bg-white/3 text-white/50 hover:text-white hover:bg-white/6 transition-all cursor-pointer"
                    >
                      <Search className="w-4 h-4 shrink-0 text-white/30" />
                      <span className="text-sm font-semibold">Buscar</span>
                    </button>
                    <button
                      onClick={() => { setIsCentralOptionsOpen(false); handleLogout(); }}
                      className="flex items-center gap-5.5 px-3 py-2.5 rounded-xl border border-white/5 bg-white/3 text-white/50 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0 text-white/30" />
                      <span className="text-sm font-semibold">Sair</span>
                    </button>
                  </div>
                </div>
              </div>`;

const newDrawerSections = `              {/* Sections — Colorful icon grid */}
              <div className="flex-1 px-4 pb-8 space-y-5">
                {[
                  {
                    label: "Finanças",
                    color: "text-emerald-400",
                    items: [
                      { href: "/dashboard/bills", icon: CreditCard, name: "Contas", color: "bg-emerald-500/15 border-emerald-500/20 text-emerald-400" },
                      { href: "/dashboard/receipts", icon: FileCheck, name: "Comprovantes", color: "bg-teal-500/15 border-teal-500/20 text-teal-400" },
                    ],
                  },
                  {
                    label: "Arquivos & Mídia",
                    color: "text-blue-400",
                    items: [
                      { href: "/dashboard/files", icon: FolderOpen, name: "Arquivos", color: "bg-blue-500/15 border-blue-500/20 text-blue-400" },
                      { href: "/dashboard/videos", icon: Video, name: "Cine Vault", color: "bg-violet-500/15 border-violet-500/20 text-violet-400" },
                      { href: "/dashboard/wallpapers", icon: ImageIcon, name: "Imagens", color: "bg-pink-500/15 border-pink-500/20 text-pink-400" },
                      { href: "/dashboard/torrents", icon: DownloadCloud, name: "Torrents", color: "bg-amber-500/15 border-amber-500/20 text-amber-400" },
                    ],
                  },
                  {
                    label: "Segurança & Produtividade",
                    color: "text-primary",
                    items: [
                      { href: "/dashboard/passwords", icon: Key, name: "Senhas", color: "bg-primary/15 border-primary/20 text-primary" },
                      { href: "/dashboard/notes", icon: FileText, name: "Notas", color: "bg-yellow-500/15 border-yellow-500/20 text-yellow-400" },
                      { href: "/dashboard/software", icon: Cpu, name: "Softwares", color: "bg-indigo-500/15 border-indigo-500/20 text-indigo-400" },
                      { href: "/dashboard/dev", icon: Code, name: "DEV Central", color: "bg-orange-500/15 border-orange-500/20 text-orange-400" },
                    ],
                  },
                  {
                    label: "Utilitários",
                    color: "text-white/50",
                    items: [
                      { onClick: () => setIsCalculatorOpen(v => !v), icon: Calculator, name: "Calculadora", color: "bg-white/8 border-white/10 text-white/60" },
                      { onClick: () => setIsStickyNotesOpen(v => !v), icon: Pin, name: "Rascunho", color: "bg-white/8 border-white/10 text-white/60" },
                      { onClick: () => setIsRadioOpen(v => !v), icon: Music, name: "Rádio Synth", color: "bg-white/8 border-white/10 text-white/60" },
                    ] as any[],
                  },
                ].map((section, sIdx) => (
                  <div key={section.label}>
                    <p className={\`text-[10px] font-bold uppercase tracking-[0.2em] mb-2.5 px-1 \${section.color}\`}>{section.label}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {section.items.map((item: any, iIdx: number) => {
                        const Icon = item.icon;
                        const isActive = item.href ? pathname === item.href : false;
                        
                        const elementContent = (
                          <motion.div
                            whileTap={{ scale: 0.95 }}
                            className={\`flex items-center gap-3 px-3.5 py-3 rounded-2xl border transition-all cursor-pointer select-none \${
                              isActive
                                ? \`\${item.color} ring-1 ring-current/20 brightness-110\`
                                : \`\${item.color} opacity-70 hover:opacity-100\`
                            }\`}
                          >
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-black/20">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[13px] font-semibold truncate text-white">{item.name}</span>
                          </motion.div>
                        );

                        return (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (sIdx * 4 + iIdx) * 0.025 + 0.04, type: "spring", stiffness: 340, damping: 26 }}
                          >
                            {item.href ? (
                              <Link href={item.href} onClick={() => setIsCentralOptionsOpen(false)}>
                                {elementContent}
                              </Link>
                            ) : (
                              <div onClick={() => { setIsCentralOptionsOpen(false); item.onClick(); }}>
                                {elementContent}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Quick actions row */}
                <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setIsCentralOptionsOpen(false); setIsCommandPaletteOpen(true); }}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-white/8 bg-white/4 text-white/60 hover:text-white hover:bg-white/8 transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                      <Search className="w-4 h-4 text-white/50" />
                    </div>
                    <span className="text-[13px] font-semibold text-white">Buscar</span>
                  </button>
                  <button
                    onClick={() => { setIsCentralOptionsOpen(false); handleLogout(); }}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-red-500/10 bg-red-500/5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-[13px] font-semibold">Sair</span>
                  </button>
                </div>
              </div>`;

if (shell.includes('{/* Sections */}')) {
  shell = shell.replace('{/* Sections */}', '{/* Sections — Colorful icon grid */}');
}
// Try the replacement directly by finding the sections block
const sectionStart = shell.indexOf('              {/* Sections */}\n');
const sectionStartAlt = shell.indexOf('              {/* Sections — Colorful icon grid */}\n');
if (sectionStart !== -1 || sectionStartAlt !== -1) {
  const anchor = sectionStart !== -1 ? '              {/* Sections */}\n' : '              {/* Sections — Colorful icon grid */}\n';
  const drawerSectionMatch = shell.indexOf(anchor);
  // find the closing of this sections div
  const endMarker = '              </div>\n            </motion.div>';
  const endIdx = shell.indexOf(endMarker, drawerSectionMatch);
  if (endIdx !== -1) {
    const before = shell.substring(0, drawerSectionMatch);
    const after = shell.substring(endIdx + endMarker.length);
    shell = before + newDrawerSections + '\n' + '              </div>\n            </motion.div>' + after;
    console.log('✅ Drawer sections redesigned with colors');
  } else {
    console.log('⚠️  Could not find end marker for sections');
  }
} else {
  console.log('⚠️  Sections anchor not found');
}

// G. Update drawer header to be more premium  
shell = shell.replace(
  `              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-2 pb-4 shrink-0">
                <div>
                  <span className="text-sm font-bold text-white/90 uppercase tracking-[0.15em]">Navegação</span>
                </div>
                <button
                  onClick={() => setIsCentralOptionsOpen(false)}
                  className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>`,
  `              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-3 pb-3 shrink-0">
                <span className="text-base font-bold text-white tracking-tight">Menu</span>
                <button
                  onClick={() => setIsCentralOptionsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 text-white/60 hover:text-white cursor-pointer transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>`
);
console.log('✅ Drawer header updated');

fs.writeFileSync(shellPath, shell, 'utf8');
console.log('✅ DashboardShell.tsx saved');

// ────────────────────────────────────────────────────────────────
// 2. dashboard/page.tsx — Remove Gamer HUD user card
// ────────────────────────────────────────────────────────────────
const dashPath = 'src/app/(dashboard)/dashboard/page.tsx';
let dash = fs.readFileSync(dashPath, 'utf8');

// Check where the user card is now
const hudStart = dash.indexOf('{/* Gamer HUD Header */}');
if (hudStart === -1) {
  console.log('ℹ️  Gamer HUD not found in dashboard (may already be removed)');
} else {
  // Find end of the outer div block
  // The card ends with </div>\n\n      <div className="md:hidden
  // We need to remove from the Gamer HUD comment to the closing </div> before the mobile tabs
  const mobileTabsAnchor = '\n      <div className="md:hidden flex bg-card/30';
  const mobileTabsIdx = dash.indexOf(mobileTabsAnchor, hudStart);
  if (mobileTabsIdx !== -1) {
    const before = dash.substring(0, hudStart);
    const after = dash.substring(mobileTabsIdx);
    dash = before + after;
    fs.writeFileSync(dashPath, dash, 'utf8');
    console.log('✅ Gamer HUD user card removed from dashboard');
  } else {
    console.log('⚠️  Could not find mobile tabs anchor after Gamer HUD');
  }
}

console.log('\n✅ All phase changes applied!');

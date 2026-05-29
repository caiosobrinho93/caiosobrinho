const fs = require('fs');
const path = require('path');

const filePath = path.join('c:/Users/Caio/Documents/caiosobrinho-website/src/components/DashboardShell.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace BottomBar
const bottomBarRegex = /function BottomBar\(\{[\s\S]*?\}\) \{[\s\S]*?return \([\s\S]*?\n    <\/div>\n  \);\n\}/;
const newBottomBar = `function BottomBar({
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
  const pathname = usePathname();
  
  const bottomNavItems = [
    { name: "Início", href: "/dashboard", icon: Home },
    { name: "Arquivos", href: "/dashboard/files", icon: FolderOpen },
    { name: "Notas", href: "/dashboard/notes", icon: FileText },
    { name: "Senhas", href: "/dashboard/passwords", icon: Key },
    { name: "DEV", href: "/dashboard/dev", icon: Code },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-[60px] flex items-center border-t border-border bg-card/90 backdrop-blur-xl px-2 overflow-x-auto scrollbar-none gap-1" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {bottomNavItems.map(item => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link key={item.name} href={item.href} onClick={() => { /* playClickSound() handled globally or skip */ }} className={\`flex flex-col items-center justify-center min-w-[60px] h-full gap-1 transition-colors \${isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-white"}\`}>
            <Icon className="w-5 h-5" />
            <span className="text-[10px] whitespace-nowrap">{item.name}</span>
          </Link>
        );
      })}
      
      <div className="w-[1px] h-8 bg-border mx-1 shrink-0"></div>
      
      <button onClick={() => { setIsCentralOptionsOpen(v => !v); }} className={\`flex flex-col items-center justify-center min-w-[60px] h-full gap-1 transition-colors cursor-pointer \${isCentralOptionsOpen ? "text-primary font-bold" : "text-muted-foreground hover:text-white"}\`}>
        <Menu className="w-5 h-5" />
        <span className="text-[10px] whitespace-nowrap">Mais</span>
      </button>
    </div>
  );
}`;

content = content.replace(bottomBarRegex, newBottomBar);

// Set default theme to gold
content = content.replace(/const { accentColor, density, themePreset, customTheme } = useSettingsStore\(\);/, 'const { accentColor, density, themePreset, customTheme } = useSettingsStore();\n  // Force gold theme as default if needed, or we rely on globals.css');
content = content.replace(/let themeBgClass = "bg-preset-synth";/g, 'let themeBgClass = "bg-preset-gold";');
content = content.replace(/themeBgClass = "bg-preset-synth";/g, 'themeBgClass = "bg-preset-gold";');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated DashboardShell.tsx');

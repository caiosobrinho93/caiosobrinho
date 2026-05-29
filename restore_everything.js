const fs = require('fs');
const path = require('path');

const shellPath = path.join(__dirname, 'src', 'components', 'DashboardShell.tsx');
let shell = fs.readFileSync(shellPath, 'utf8');

// 1. Restore Pink Theme
if (!shell.includes('const dashboardStats = useStatsStore')) {
  shell = shell.replace(
    'export default function DashboardShell({ children, username }: DashboardShellProps) {\r\n  const pathname = usePathname();',
    'export default function DashboardShell({ children, username }: DashboardShellProps) {\r\n  const dashboardStats = useStatsStore((s) => s.data);\r\n  const pathname = usePathname();'
  );
  shell = shell.replace(
    'export default function DashboardShell({ children, username }: DashboardShellProps) {\n  const pathname = usePathname();',
    'export default function DashboardShell({ children, username }: DashboardShellProps) {\n  const dashboardStats = useStatsStore((s) => s.data);\n  const pathname = usePathname();'
  );
}

const customStyleStart = shell.indexOf('let customStyle: React.CSSProperties = {};');
if (customStyleStart !== -1 && !shell.includes('isGiselle')) {
  const replacement = `let customStyle: React.CSSProperties = {};
  const currentUsername = dashboardStats?.profile?.username || username;
  const isGiselle = currentUsername?.toLowerCase() === "giselle";
  if (isGiselle) {
    customStyle = {
      '--primary': '#FF2D55',
      '--primary-rgb': '255, 45, 85',
      '--accent': '#FF375F',
      '--ring': 'rgba(255, 45, 85, 0.5)'
    } as React.CSSProperties;
  }`;
  shell = shell.replace('let customStyle: React.CSSProperties = {};', replacement);
}

shell = shell.replace(
  'customStyle = {\r\n      backgroundImage: `url(${customTheme.bgImage})`,',
  'customStyle = {\r\n      ...customStyle,\r\n      backgroundImage: `url(${customTheme.bgImage})`,'
);
shell = shell.replace(
  'customStyle = {\n      backgroundImage: `url(${customTheme.bgImage})`,',
  'customStyle = {\n      ...customStyle,\n      backgroundImage: `url(${customTheme.bgImage})`,'
);
shell = shell.replace(/rgba\(94,\s*92,\s*230/g, 'rgba(var(--primary-rgb)');


// 2. Restore Aurora BG
const oldAurora = `{/* Floating Aurora Gradient Blobs (Looping Animations) */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-[100px] animate-blob-1" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent/10 blur-[100px] animate-blob-2" />
          <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-secondary/15 blur-[120px] animate-blob-3" />
        </div>
      )}`;

const newAurora = `{/* 🌌 Aurora Background - Spatial Web Style */}
      <div className="aurora-bg">
        <div className="aurora-blob blob-1"></div>
        <div className="aurora-blob blob-2"></div>
        <div className="aurora-blob blob-3"></div>
        <div className="aurora-blob blob-4"></div>
      </div>`;

if (shell.includes('Floating Aurora Gradient Blobs')) {
  shell = shell.replace(oldAurora, newAurora);
}


// 3. Restore Sidebar Toggle
const sidebarHeader = `<div className="h-14 flex items-center justify-between px-3 border-b border-border/80 bg-background/40">
          <Link href="/dashboard" className="flex items-center gap-5 overflow-hidden select-none">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 shrink-0">
              <Terminal className="w-4.5 h-4.5 text-primary " />
            </div>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-display text-xs tracking-wider text-white"
              >
                NEXUS <span className="text-primary font-bold text-xs bg-primary/10 border border-primary/30 px-1 py-2 rounded ml-1">VAULT</span>
              </motion.span>
            )}
          </Link>
        </div>`;

const newSidebarHeader = `<div className="h-14 flex items-center justify-between px-3 border-b border-border/80 bg-background/40">
          <Link href="/dashboard" className="flex items-center gap-5 overflow-hidden select-none">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 shrink-0">
              <Terminal className="w-4.5 h-4.5 text-primary " />
            </div>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-display text-xs tracking-wider text-white"
              >
                NEXUS <span className="text-primary font-bold text-xs bg-primary/10 border border-primary/30 px-1 py-2 rounded ml-1">VAULT</span>
              </motion.span>
            )}
          </Link>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
          >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               {isSidebarCollapsed ? (
                 <polyline points="9 18 15 12 9 6"></polyline>
               ) : (
                 <polyline points="15 18 9 12 15 6"></polyline>
               )}
             </svg>
          </button>
        </div>`;

if (shell.includes(sidebarHeader)) {
  shell = shell.replace(sidebarHeader, newSidebarHeader);
}

fs.writeFileSync(shellPath, shell, 'utf8');

// 4. Also fix page.tsx
const pagePath = path.join(__dirname, 'src', 'app', '(dashboard)', 'dashboard', 'page.tsx');
let page = fs.readFileSync(pagePath, 'utf8');

page = page.replace(/rgba\(94,\s*92,\s*230/g, 'rgba(var(--primary-rgb)');
// Undo my previous text color change so it uses from-primary
page = page.replace(
  /<span className=\{\`bg-clip-text text-transparent bg-gradient-to-r \$\{data\?\.profile\?\.username\?\.toLowerCase\(\) === 'giselle' \? 'from-\[\#FF2D55\] to-\[\#FF375F\]' : 'from-primary to-accent'\}\`\}>/,
  '<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">'
);
fs.writeFileSync(pagePath, page, 'utf8');

console.log('Restored all today features!');

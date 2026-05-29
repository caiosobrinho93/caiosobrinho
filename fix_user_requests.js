const fs = require('fs');
const path = require('path');

// --- 1. Fix page.tsx ---
const pagePath = path.join(__dirname, 'src', 'app', '(dashboard)', 'dashboard', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Fix Bell icon cutoff by making it overflow-visible
pageContent = pageContent.replace(
  /className="relative w-16 h-16 rounded-full glass-panel flex items-center justify-center/g,
  'className="relative w-16 h-16 rounded-full glass-panel !overflow-visible flex items-center justify-center'
);

// Fix Notification Modal Trap (Portal or move outside)
// It is inside the DashboardPage div, which has NO transform in containerVariants!
// Wait! `itemVariants` is NOT applied to the Notifications Modal, BUT maybe it's still being blocked by something?
// Actually, `fixed inset-0 z-[9999]` ensures it's above EVERYTHING.
pageContent = pageContent.replace(/className="fixed inset-0 z-50 flex items-center justify-center p-4"/g, 'className="fixed inset-0 z-[9999] flex items-center justify-center p-4"');

// Wait, why did the modal not open?
// Ah! In `fix_page_hero.js`, I added the `isNotificationsOpen` state inside `DashboardPage`, but the button is:
// `onClick={() => setIsNotificationsOpen(true)}`. This SHOULD work.
// Is it trapped behind a pointer-events-none?
// No, the `z-10` div has no pointer-events-none. Let's make sure button is `z-50`.
pageContent = pageContent.replace(/<button \s*onClick=\{\(\) => setIsNotificationsOpen\(true\)\}/, '<button type="button" onClick={() => setIsNotificationsOpen(true)}');

// Fix "Bem-vindo" text 
const oldBemVindo = '<h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Bem-vindo, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{data?.profile?.username || \'Usuário\'}</span></h1>';
const newBemVindo = `<h1 className="text-4xl md:text-6xl font-black tracking-tight flex flex-col">
              <span className="text-lg md:text-xl text-white/50 font-medium mb-1">Bem-vindo(a) de volta,</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{data?.profile?.username || 'Usuário'}</span>
            </h1>`;
pageContent = pageContent.replace(oldBemVindo, newBemVindo);

fs.writeFileSync(pagePath, pageContent, 'utf8');


// --- 2. Fix DashboardShell.tsx Theme ---
const shellPath = path.join(__dirname, 'src', 'components', 'DashboardShell.tsx');
let shellContent = fs.readFileSync(shellPath, 'utf8');

const styleBlockStart = shellContent.indexOf('let customStyle: React.CSSProperties = {};');
if (styleBlockStart !== -1) {
  const replacement = `let customStyle: React.CSSProperties = {};
  const isGiselle = stats?.profile?.username?.toLowerCase() === "giselle";
  if (isGiselle) {
    customStyle = {
      '--primary': '#FF2D55',
      '--accent': '#FF375F',
      '--ring': 'rgba(255, 45, 85, 0.5)'
    } as React.CSSProperties;
  }`;
  shellContent = shellContent.replace('let customStyle: React.CSSProperties = {};', replacement);
}

fs.writeFileSync(shellPath, shellContent, 'utf8');
console.log('Fixes applied.');

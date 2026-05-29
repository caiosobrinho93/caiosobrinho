const fs = require('fs');
const path = require('path');

// 1. Undo in DashboardShell.tsx
const shellPath = path.join(__dirname, 'src', 'components', 'DashboardShell.tsx');
let shellContent = fs.readFileSync(shellPath, 'utf8');

// Remove isGiselle logic and restore basic customStyle
const styleBlockStart = shellContent.indexOf('let customStyle: React.CSSProperties = {};');
const styleBlockEnd = shellContent.indexOf('if (mounted && customTheme?.bgImage) {');

if (styleBlockStart !== -1 && styleBlockEnd !== -1) {
  shellContent = shellContent.substring(0, styleBlockStart) + 
    'let customStyle: React.CSSProperties = {};\n  \n  ' + 
    shellContent.substring(styleBlockEnd);
}

// Restore purple RGBs in DashboardShell
shellContent = shellContent.replace(/rgba\(var\(--primary-rgb\)/g, 'rgba(94, 92, 230');

fs.writeFileSync(shellPath, shellContent, 'utf8');

// 2. Undo in page.tsx and apply pink ONLY to the username text
const pagePath = path.join(__dirname, 'src', 'app', '(dashboard)', 'dashboard', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Restore purple RGBs
pageContent = pageContent.replace(/rgba\(var\(--primary-rgb\)/g, 'rgba(94, 92, 230');

// Apply pink text for giselle only
const oldUsernameSpan = '<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{data?.profile?.username || \'Usuário\'}</span>';
const newUsernameSpan = '<span className={`bg-clip-text text-transparent bg-gradient-to-r ${data?.profile?.username?.toLowerCase() === \'giselle\' ? \'from-[#FF2D55] to-[#FF375F]\' : \'from-primary to-accent\'}`}>{data?.profile?.username || \'Usuário\'}</span>';

if (pageContent.includes(oldUsernameSpan)) {
  pageContent = pageContent.replace(oldUsernameSpan, newUsernameSpan);
}

fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Undo complete!');

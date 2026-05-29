const fs = require('fs');
const path = require('path');

const dashDir = 'src/app/(dashboard)/dashboard';
function findFiles(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) findFiles(full, results);
    else if (e.name === 'page.tsx') results.push(full);
  }
  return results;
}

const pages = findFiles(dashDir);
let count = 0;

// All the variations found in the scan:
const headerReplacements = [
  // bills, receipts (border-border/40 pb-4)
  {
    find: 'gap-4 border-b border-border/40 pb-4"',
    replace: 'gap-4 border-b border-border/40 pb-4 mb-8"'
  },
  // files, wallpapers (border-border/40 pb-3)
  {
    find: 'gap-3 border-b border-border/40 pb-3"',
    replace: 'gap-3 border-b border-border/40 pb-3 mb-8"'
  },
  // settings (pb-3, border-border/60)
  {
    find: 'border-b border-border/60 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0"',
    replace: 'border-b border-border/60 pb-3 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0"'
  }
];

for (const file of pages) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  const pageName = path.basename(path.dirname(file));

  for (const r of headerReplacements) {
    if (content.includes(r.find)) {
      content = content.split(r.find).join(r.replace);
      changed = true;
      console.log(`✅ ${pageName}/page.tsx — added mb-8`);
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
  }
}

// ── Now also do a comprehensive padding/alignment review ─────────────────
// Main shell passes:
//   Mobile: pt-4 px-4 pb-[66px]
//   Desktop: p-8 / p-10

// The top header on mobile is now hidden, so pages start right at the top.
// For a clean visual, let's ensure the main shell adds a pt-6 on mobile (more breathing room)
const shellPath = 'src/components/DashboardShell.tsx';
let shell = fs.readFileSync(shellPath, 'utf8');

// Update mobile top padding from pt-4 to pt-6 so content has breathing room from the status bar
const oldMain = '<main className="flex-1 overflow-y-auto bg-background/35 relative pt-4 px-4 md:p-8 lg:p-10 pb-[66px] md:pb-8">';
const newMain = '<main className="flex-1 overflow-y-auto bg-background/35 relative pt-6 px-4 md:p-8 lg:p-10 pb-[70px] md:pb-8">';
if (shell.includes(oldMain)) {
  shell = shell.replace(oldMain, newMain);
  fs.writeFileSync(shellPath, shell, 'utf8');
  console.log('✅ Shell main padding updated to pt-6');
}

console.log(`\nTotal pages updated: ${count}`);
console.log('Done!');

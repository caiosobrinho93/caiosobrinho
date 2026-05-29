const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // For torrents/page.tsx desktop cards:
  // "group cursor-pointer bg-card/20 backdrop-blur-md border border-border/50 rounded-2xl p-4.5 flex flex-col justify-between min-h-[120px] h-auto relative overflow-hidden transition-all duration-300 hover:border-primary/30 hover:bg-card/30 hover:shadow-[0_0_20px_rgba(143,227,25,0.04)]"
  if (content.includes('bg-card/20 backdrop-blur-md border border-border/50 rounded-2xl p-4.5')) {
    content = content.replace(/bg-card\/20 backdrop-blur-md border border-border\/50 rounded-2xl p-4.5/g, 'nexus-card cursor-pointer group flex flex-col justify-between min-h-[120px]');
    changed = true;
  }

  // For torrents/page.tsx mobile cards:
  // "flex items-center gap-3 px-3 py-3 rounded-xl border border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50 cursor-pointer transition-all"
  if (content.includes('border border-border/50 bg-card/30')) {
    content = content.replace(/border border-border\/50 bg-card\/30/g, 'nexus-card !p-3 !rounded-xl');
    changed = true;
  }

  // For bills/page.tsx:
  // "backdrop-blur-md rounded-2xl p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-primary/5"
  if (content.includes('backdrop-blur-md rounded-2xl p-5 border')) {
    content = content.replace(/backdrop-blur-md rounded-2xl p-5 border/g, 'nexus-card flex flex-col md:flex-row md:items-center justify-between gap-4');
    changed = true;
  }

  // For passwords/page.tsx (desktop cards):
  // "group cursor-pointer bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:border-primary/30 hover:bg-card/50 hover:shadow-[0_0_20px_rgba(94,92,230,0.1)]"
  if (content.includes('bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl p-5 flex flex-col gap-4')) {
    content = content.replace(/bg-card\/30 backdrop-blur-md border border-border\/50 rounded-2xl p-5 flex flex-col gap-4/g, 'nexus-card cursor-pointer group flex flex-col gap-4');
    changed = true;
  }

  // For passwords mobile:
  // "flex items-center gap-4 px-4 py-4 rounded-xl border border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50 cursor-pointer transition-all"
  if (content.includes('px-4 py-4 rounded-xl border border-border/50 bg-card/30')) {
    content = content.replace(/px-4 py-4 rounded-xl border border-border\/50 bg-card\/30/g, 'nexus-card !p-4 !rounded-xl');
    changed = true;
  }

  // For netfrix/page.tsx:
  // "group cursor-pointer bg-card/20 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 hover:bg-card/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(229,9,20,0.1)] flex flex-col"
  if (content.includes('bg-card/20 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 hover:bg-card/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(229,9,20,0.1)]')) {
    content = content.replace(/bg-card\/20 backdrop-blur-md border border-border\/50 rounded-xl overflow-hidden hover:border-primary\/30 hover:bg-card\/40 transition-all duration-300 hover:shadow-\[0_0_20px_rgba\(229,9,20,0\.1\)\]/g, 'nexus-card !p-0 !rounded-xl');
    changed = true;
  }

  // For receipts/page.tsx:
  // "backdrop-blur-md rounded-2xl p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-primary/5 border-border/30 bg-card/20 hover:border-border/60"
  if (content.includes('backdrop-blur-md rounded-2xl p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-primary/5')) {
    content = content.replace(/backdrop-blur-md rounded-2xl p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-primary\/5/g, 'nexus-card flex flex-col md:flex-row md:items-center justify-between gap-4');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Applied nexus-card to', filePath);
  }
}

const files = [
  'src/app/(dashboard)/dashboard/torrents/page.tsx',
  'src/app/(dashboard)/dashboard/bills/page.tsx',
  'src/app/(dashboard)/dashboard/passwords/page.tsx',
  'src/app/(dashboard)/dashboard/netfrix/page.tsx',
  'src/app/(dashboard)/dashboard/receipts/page.tsx',
];

files.forEach(processFile);

// Also fix the notes buttons here
let notes = fs.readFileSync('src/app/(dashboard)/dashboard/notes/page.tsx', 'utf8');
let notesChanged = false;

if (notes.includes('glass-button-primary')) {
  notes = notes.replace(/className=\"glass-button-primary\"/g, 'className=\"frutiger-button\"');
  notes = notes.replace(/<span className=\"frutiger-button\"><\/span>/g, '');
  notes = notes.replace(/<span className=\"frutiger-button\">\s*<Plus className=\"w-4 h-4\" \/>\s*<\/span>/g, '<div className=\"frutiger-inner\"><span className=\"frutiger-top-white\"></span><span className=\"frutiger-text flex items-center justify-center\"><Plus className=\"w-4 h-4\" /></span></div>');
  notesChanged = true;
}

if (notes.includes('Criar Primeira Nota')) {
  // Try to find the exact button for "Criar Primeira Nota"
  const oldBtn = 'className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-colors cursor-pointer border border-primary/50 shadow-[0_0_15px_rgba(94,92,230,0.4)] hover:scale-[1.02] active:scale-[0.98]">';
  if (notes.includes(oldBtn)) {
    notes = notes.replace(oldBtn, 'className="frutiger-button w-48 mx-auto mt-4">');
    notes = notes.replace(/Criar Primeira Nota\n\s*<\/button>/g, '<div className="frutiger-inner"><span className="frutiger-top-white"></span><span className="frutiger-text font-bold">Criar Primeira Nota</span></div>\n</button>');
    notesChanged = true;
  }
}

if (notesChanged) {
  fs.writeFileSync('src/app/(dashboard)/dashboard/notes/page.tsx', notes, 'utf8');
  console.log('Fixed notes buttons');
}

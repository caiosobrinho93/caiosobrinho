const fs = require('fs');

let file = 'src/app/(dashboard)/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix User Profile Card
content = content.replace(
  /<div className="flex items-center gap-4">([\s\S]*?)<span className="text-sm font-bold truncate([^"]*)">([^<]*)<\/span>([\s\S]*?)<span className="text-xs text-muted-foreground([^"]*)">([^<]*?)<\/span>/,
  (match, p1, p2, p3, p4, p5, p6) => {
    return `<div className="flex items-center gap-4">${p1}<span className="text-sm font-bold truncate${p2}">${p3}</span>${p4}<span className="text-[10px] text-muted-foreground uppercase tracking-wider${p5}">Perfil Verificado</span>`;
  }
);

// 2. Reduce Quick Links height and remove icon borders
content = content.replace(
  /<div className="flex flex-col items-center justify-center gap-3 p-4 bg-card\/45 border border-border\/50 hover:bg-muted\/15 transition-all rounded-xl cursor-pointer">([\s\S]*?)<div className="w-10 h-10 rounded-full border border-border flex items-center justify-center/g,
  `<div className="flex items-center gap-3 p-3 h-[60px] bg-card/45 border border-border/50 hover:bg-muted/15 transition-all rounded-xl cursor-pointer">$1<div className="flex items-center justify-center`
);

// 3. RSS Widget Alignment
content = content.replace(/<div className="flex items-start gap-4">/g, '<div className="flex items-center gap-4 pl-4">');

fs.writeFileSync(file, content, 'utf8');
console.log('Dashboard specific UI tweaks applied');

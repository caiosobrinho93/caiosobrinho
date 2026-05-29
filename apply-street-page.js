const fs = require('fs');

let page = fs.readFileSync('src/app/(dashboard)/dashboard/page.tsx', 'utf8');

// 1. Recent Activities
page = page.replace(
  /className="flex items-center justify-between p-4 rounded-sm hover:bg-muted\/5 hover:bg-white\/5 transition-all shadow-sm hover:shadow-\[0_0_15px_rgba\(212,175,55,0\.08\)\] cursor-pointer group border border-transparent hover:border-border\/30"/g,
  'className="street-row flex items-center justify-between cursor-pointer group"'
);

// 2. Goals List
page = page.replace(
  /className=\{`flex items-center justify-between p-4 rounded-sm border transition-all \$\{\n\s*goal\.isCompleted\n\s*\? "bg-emerald-500\/5 border-emerald-500\/10 text-emerald-100\/50"\n\s*: "bg-muted\/10 border-border\/40 text-white\/90"\n\s*\}`\}/g,
  'className={`street-row flex items-center justify-between ${goal.isCompleted ? "opacity-50" : ""}`}'
);

// 3. Rewards
page = page.replace(
  /className=\{`p-6 border rounded-sm flex items-center justify-between gap-3 transition-colors \$\{\n\s*isClaimed\n\s*\? "bg-muted\/5 border-border\/20"\n\s*: "bg-muted\/10 border-border\/40 hover:border-primary\/30 hover:bg-primary\/5"\n\s*\}`\}/g,
  'className={`street-row flex items-center justify-between gap-3 ${isClaimed ? "opacity-50" : ""}`}'
);

// 4. Hero section titles to brutally large
page = page.replace(
  /Bem-vindo, <span className="text-primary">\{data\?\.profile\?\.username \|\| 'Usuário'\}<\/span>/,
  '<span className="text-primary uppercase tracking-tighter text-6xl block mb-2">{data?.profile?.username || \'AGENT\'}</span> BEM-VINDO'
);
page = page.replace(
  /className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight mb-2"/,
  'className="text-4xl sm:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]"'
);

// 5. Hero Avatar brutalist
page = page.replace(
  /<div className="w-full h-full rounded-full overflow-hidden border-2 border-primary\/50 bg-black\/50 shadow-\[0_0_20px_rgba\(61,106,255,0\.3\)\]">/,
  '<div className="w-full h-full overflow-hidden border-4 border-white bg-black/50 shadow-[6px_6px_0px_var(--primary)]">'
);

// 6. Favorites
page = page.replace(
  /className="flex items-center gap-4 p-4 bg-muted\/10 hover:bg-muted\/20 rounded-sm cursor-pointer transition-colors border border-border\/40 min-w-0"/g,
  'className="street-row flex items-center gap-4 cursor-pointer min-w-0"'
);


fs.writeFileSync('src/app/(dashboard)/dashboard/page.tsx', page, 'utf8');
console.log('Done rewriting page.tsx for Street style');

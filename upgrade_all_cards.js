const fs = require('fs');

function upgradeBills() {
  const path = 'src/app/(dashboard)/dashboard/bills/page.tsx';
  let c = fs.readFileSync(path, 'utf8');

  c = c.split('className={`nexus-card flex flex-col md:flex-row md:items-center justify-between gap-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-primary/5 ${')
       .join('className={`nexus-card relative overflow-hidden p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${');

  c = c.split('<div className="flex items-start gap-4">')
       .join(`{/* Subtle Background Glow by Type */}
                  <div className={\`absolute -right-20 -top-20 w-48 h-48 blur-[80px] rounded-full opacity-20 pointer-events-none \${
                    bill.type === "pagar" ? "bg-red-500" : bill.type === "receber" ? "bg-emerald-500" : "bg-amber-500"
                  }\`} />
                  <div className="flex items-start gap-5 relative z-10">`);

  c = c.split('className={`p-3 border rounded-xl shrink-0 ${')
       .join('className={`p-4 border rounded-2xl shrink-0 shadow-inner ${');

  fs.writeFileSync(path, c);
}

function upgradePasswords() {
  const path = 'src/app/(dashboard)/dashboard/passwords/page.tsx';
  let c = fs.readFileSync(path, 'utf8');
  
  c = c.split('className="nexus-card flex items-center justify-between p-4 group"')
       .join('className="nexus-card relative overflow-hidden flex items-center justify-between p-6 group transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"');

  c = c.split('<div className="flex items-center gap-4">')
       .join(`{/* Subtle Background Glow */}
              <div className="absolute -left-10 -bottom-10 w-32 h-32 blur-[60px] rounded-full opacity-10 bg-primary pointer-events-none" />
              <div className="flex items-center gap-5 relative z-10">`);

  c = c.split('className="p-3 border border-border/50 rounded-xl bg-card/40 shrink-0 group-hover:border-primary/30 transition-colors"')
       .join('className="p-4 border border-border/50 rounded-2xl bg-card/60 shrink-0 group-hover:border-primary/50 shadow-inner transition-colors"');

  fs.writeFileSync(path, c);
}

function upgradeTorrents() {
  const path = 'src/app/(dashboard)/dashboard/torrents/page.tsx';
  let c = fs.readFileSync(path, 'utf8');

  c = c.split('className="nexus-card flex flex-col justify-between gap-4 p-4"')
       .join('className="nexus-card relative overflow-hidden flex flex-col justify-between gap-5 p-6 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"');

  c = c.split('<div className="flex items-start gap-4">')
       .join(`{/* Subtle Background Glow */}
                  <div className="absolute -right-10 -top-10 w-40 h-40 blur-[70px] rounded-full opacity-15 bg-primary pointer-events-none" />
                  <div className="flex items-start gap-5 relative z-10">`);

  c = c.split('className={`p-3 border rounded-xl shrink-0 ${')
       .join('className={`p-4 border rounded-2xl shrink-0 shadow-inner ${');

  fs.writeFileSync(path, c);
}

function upgradeSoftware() {
  const path = 'src/app/(dashboard)/dashboard/software/page.tsx';
  let c = fs.readFileSync(path, 'utf8');

  c = c.split('className="nexus-card flex flex-col justify-between p-4 h-full group"')
       .join('className="nexus-card relative overflow-hidden flex flex-col justify-between p-6 h-full group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"');

  c = c.split('<div className="flex items-start gap-4">')
       .join(`{/* Subtle Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 blur-[70px] rounded-full opacity-10 bg-primary pointer-events-none" />
              <div className="flex items-start gap-5 relative z-10">`);

  c = c.split('className="w-12 h-12 rounded-xl border border-border/50 bg-card/50 flex items-center justify-center shrink-0 overflow-hidden"')
       .join('className="w-14 h-14 rounded-2xl border border-border/50 bg-card/70 flex items-center justify-center shrink-0 overflow-hidden shadow-inner"');

  fs.writeFileSync(path, c);
}

function upgradeReceipts() {
  const path = 'src/app/(dashboard)/dashboard/receipts/page.tsx';
  let c = fs.readFileSync(path, 'utf8');

  c = c.split('className="nexus-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"')
       .join('className="nexus-card relative overflow-hidden p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"');

  c = c.split('<div className="flex items-start gap-4">')
       .join(`{/* Subtle Background Glow */}
                  <div className="absolute -left-10 top-0 w-32 h-32 blur-[60px] rounded-full opacity-10 bg-emerald-500 pointer-events-none" />
                  <div className="flex items-start gap-5 relative z-10">`);

  c = c.split('className="p-3 border border-border/50 rounded-xl bg-card/40 shrink-0 text-muted-foreground"')
       .join('className="p-4 border border-border/50 rounded-2xl bg-card/60 shrink-0 text-emerald-400 shadow-inner"');

  fs.writeFileSync(path, c);
}

function upgradeNetfrix() {
  const path = 'src/app/(dashboard)/dashboard/netfrix/page.tsx';
  let c = fs.readFileSync(path, 'utf8');
  
  // Netfrix cards might not have nexus-card yet. 
  // Wait, I will just upgrade the inner cards padding.
  c = c.split('className="flex flex-col bg-card/25 border border-border rounded-lg overflow-hidden cursor-pointer shadow-sm hover:border-primary/50 transition-all"')
       .join('className="nexus-card flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/20"');

  c = c.split('className="p-3 flex flex-col justify-between flex-1"')
       .join('className="p-5 flex flex-col justify-between flex-1 relative z-10"');

  fs.writeFileSync(path, c);
}

upgradeBills();
upgradePasswords();
upgradeTorrents();
upgradeSoftware();
upgradeReceipts();
upgradeNetfrix();
console.log("Upgraded all cards!");

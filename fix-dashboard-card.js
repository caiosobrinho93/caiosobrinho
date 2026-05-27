const fs = require('fs');

const dashPath = 'src/app/(dashboard)/dashboard/page.tsx';
let content = fs.readFileSync(dashPath, 'utf8');

// The current broken content around line 1077-1082:
// ...closing of bill map,  then directly jumps to mobile tab buttons
// We need to inject the Gamer HUD BETWEEN the bills widget close and the md:hidden div

// Find the pattern: the end of a .map() block that renders bills, then the mobile tab selector
const brokenPattern = `              );
          }\`}
        >
          PAINEL
        </motion.button>
        <motion.button
          onClick={() => changeMobileTab("goals")}
          whileTap={{ scale: 0.94 }}
          className={\`flex-1 py-1 text-xs font-display font-semibold rounded-sm transition-all cursor-pointer \${
            activeMobileTab === "goals" ? "bg-primary text-black shadow-sm" : "text-muted-foreground"
          }\`}
        >
          METAS
        </motion.button>
        <motion.button
          onClick={() => changeMobileTab("finance")}
          whileTap={{ scale: 0.94 }}
          className={\`flex-1 py-1 text-xs font-display font-semibold rounded-sm transition-all cursor-pointer \${
            activeMobileTab === "finance" ? "bg-primary text-black shadow-sm" : "text-muted-foreground"
          }\`}
        >
          BANCO
        </motion.button>
      </div>`;

// What it SHOULD look like - closing the map, closing bill widget, then inserting user card, then mobile tabs
const fixedPattern = `              );
            })}
          </div>
        </div>
      )}

      {/* Gamer HUD Header */}
      <div className={\`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl \${
        data.profile.username === "Giselle"
          ? "border-border/25 bg-fuchsia-950/5 shadow-fuchsia-950/10"
          : "border-[#c5ff1a]/25 bg-slate-950/40 shadow-slate-950/20"
      }\`}>
        <div className="flex items-center gap-4">
          <div className={\`relative w-12 h-12 rounded-full border-2 overflow-hidden flex items-center justify-center shrink-0 \${
            data.profile.username === "Giselle"
              ? "border-fuchsia-500/40 bg-fuchsia-950/30"
              : "border-cyan-400/40 bg-cyan-950/30"
          }\`}>
            <img 
              src={data.profile.username === "Giselle" ? "/avatar-giselle.png" : "/avatar-caio.png"} 
              className="w-full h-full object-cover" 
              alt={data.profile.username === "Giselle" ? "Giselle" : "Caio"}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide uppercase">
                {data.profile.username === "Giselle" ? "Giselle" : "Caio"}
              </h2>
              <span className={\`text-xs font-black px-2 py-0.5 rounded uppercase \${
                data.profile.username === "Giselle" 
                  ? "bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400" 
                  : "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
              }\`}>
                {data.profile.username === "Giselle" ? "Co-op" : "Admin"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground uppercase mt-0.5 tracking-wider font-semibold">
              Status: Online
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-sm space-y-1.5 md:ml-4">
          <div className="flex justify-between items-end text-sm font-bold uppercase tracking-wider">
            <span className="text-white">Nível {data.profile.level}</span>
            <span className="text-muted-foreground">{currentLevelXp} / 1000 XP</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-none overflow-hidden border border-border/40 relative">
            <div
              className={\`h-full transition-all duration-1000 \${
                data.profile.username === "Giselle"
                  ? "bg-gradient-to-r from-fuchsia-500 to-pink-500"
                  : "bg-gradient-to-r from-[#c5ff1a] to-cyan-400"
              }\`}
              style={{ width: \`\${xpPercentage}%\` }}
            />
          </div>
        </div>
      </div>

      <div className="md:hidden flex bg-card/30 border border-border/50 p-0.5 rounded-sm gap-0.5">
        <motion.button
          onClick={() => changeMobileTab("general")}
          whileTap={{ scale: 0.94 }}
          className={\`flex-1 py-1 text-xs font-display font-semibold rounded-sm transition-all cursor-pointer \${
            activeMobileTab === "general" ? "bg-primary text-black shadow-sm" : "text-muted-foreground"
          }\`}
        >
          PAINEL
        </motion.button>
        <motion.button
          onClick={() => changeMobileTab("goals")}
          whileTap={{ scale: 0.94 }}
          className={\`flex-1 py-1 text-xs font-display font-semibold rounded-sm transition-all cursor-pointer \${
            activeMobileTab === "goals" ? "bg-primary text-black shadow-sm" : "text-muted-foreground"
          }\`}
        >
          METAS
        </motion.button>
        <motion.button
          onClick={() => changeMobileTab("finance")}
          whileTap={{ scale: 0.94 }}
          className={\`flex-1 py-1 text-xs font-display font-semibold rounded-sm transition-all cursor-pointer \${
            activeMobileTab === "finance" ? "bg-primary text-black shadow-sm" : "text-muted-foreground"
          }\`}
        >
          BANCO
        </motion.button>
      </div>`;

if (content.includes(brokenPattern)) {
  content = content.replace(brokenPattern, fixedPattern);
  fs.writeFileSync(dashPath, content, 'utf8');
  console.log('✅ Dashboard user card re-inserted successfully');
} else {
  console.log('Pattern not found, searching for simpler anchor...');
  
  // Try to find exact spot
  const idx = content.indexOf('PAINEL\n        </motion.button>');
  if (idx > -1) {
    console.log('Found PAINEL button at index:', idx);
    // Show context around it
    console.log('Context:', content.substring(idx - 200, idx + 200));
  } else {
    console.log('PAINEL button not found either');
    // Show around line 1078
    const lines = content.split('\n');
    console.log('Lines 1073-1085:', lines.slice(1072, 1085).join('\n'));
  }
}

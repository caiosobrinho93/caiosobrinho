const fs = require('fs');
let content = fs.readFileSync('src/app/(dashboard)/dashboard/page.tsx', 'utf8');

// 1. Fix isLoading
const loadingRegex = /if \(isLoading\) \{\s*return \([\s\S]*?<\/div>\s*\);\s*\}/;
content = content.replace(loadingRegex, 'if (isLoading) return null;');

// 2. Add the Water Hero Section
const heroSection = `
      {/* WATER HERO SECTION */}
      <div className="relative w-full h-[450px] !mt-[-40px] md:!mt-[-112px] flex flex-col items-center justify-center overflow-hidden rounded-b-3xl border-b border-primary/20 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] z-10">
        {/* Animated Water Background */}
        <div className="absolute inset-0 bg-[#020b1a] z-0" />
        
        {/* Soft flowing waves */}
        <motion.div
          animate={{ x: ['0%', '-5%', '0%'], y: ['0%', '3%', '0%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[20%] -left-[10%] w-[120%] h-[120%] bg-[#0044cc]/20 rounded-[40%_60%_70%_30%] mix-blend-screen blur-[80px] z-0"
        />
        <motion.div
          animate={{ x: ['0%', '5%', '0%'], y: ['0%', '-2%', '0%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-[20%] -right-[10%] w-[120%] h-[120%] bg-[#00aa88]/15 rounded-[60%_40%_30%_70%] mix-blend-screen blur-[100px] z-0"
        />
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[#0066cc]/10 rounded-[45%] mix-blend-screen blur-[90px] z-0"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-widest mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            OLÁ, {data?.profile?.username ? data.profile.username.toUpperCase() : "USUÁRIO"}
          </h1>

          {/* XP Bar */}
          <div className="w-[300px] flex flex-col items-center">
             <div className="flex justify-between w-full text-[10px] font-bold text-white mb-2 uppercase tracking-widest">
               <span>Lvl {Math.floor((data?.profile?.xp || 0) / 1000)}</span>
               <span>{currentLevelXp} / 1000 XP</span>
             </div>
             <div className="h-3 w-full bg-black/50 backdrop-blur-md rounded-full overflow-hidden border border-white/20 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: \`\${xpPercentage}%\` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full shadow-[0_0_10px_rgba(212,175,55,0.8)]"
                />
             </div>
          </div>
        </div>
      </div>
`;

const containerStart = /<motion\.div\s+variants=\{containerVariants\}\s+initial="hidden"\s+animate="show"\s+className="space-y-6"\s*>/;
content = content.replace(containerStart, '<motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">' + heroSection);

fs.writeFileSync('src/app/(dashboard)/dashboard/page.tsx', content);
console.log('Hero added and grid removed!');

const fs = require('fs');

const file = 'c:/Users/Caio/Documents/caiosobrinho-website/src/app/(dashboard)/dashboard/passwords/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `        <button
          onClick={() => {
            handleGenerate();
            setIsGeneratorOpen(true);
          }}
          className="flex items-center justify-center gap-4 px-3 py-1.5 rounded-sm text-sm font-bold bg-primary text-black hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-black animate-pulse" />
          Gerador
        </button>`;

content = content.replace(target, '');
fs.writeFileSync(file, content, 'utf8');
console.log('Removed Gerador');

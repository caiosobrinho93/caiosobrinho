const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Regex to match the dev-btn-3d structure
  // <button ... className="dev-btn-3d ...">
  //   <span className="dev-btn-3d-top ..."> ... </span>
  //   <span className="dev-btn-3d-bottom"></span>
  //   <span className="dev-btn-3d-base"></span>
  // </button>
  const regex = /className="dev-btn-3d([^"]*)"([\s\S]*?)>\s*<span className="dev-btn-3d-top([^"]*)">([\s\S]*?)<\/span>\s*<span className="dev-btn-3d-bottom"><\/span>\s*<span className="dev-btn-3d-base"><\/span>\s*<\/button>/g;

  content = content.replace(regex, (match, p1, p2, p3, p4) => {
    // p1 = extra classes for dev-btn-3d
    // p2 = any other button attributes like onClick
    // p3 = extra classes for dev-btn-3d-top
    // p4 = content inside the top span
    
    // remove the specific class names from p3 if any
    let extraClasses = (p1 + " " + p3).replace(/dev-btn-3d-top/g, '').trim();
    if(extraClasses) {
      extraClasses = " " + extraClasses;
    }
    
    return `className="glass-btn-primary${extraClasses}"${p2}>\n${p4}\n</button>`;
  });
  
  // also handle <div className="dev-btn-3d-top">
  const divRegex = /className="dev-btn-3d([^"]*)"([\s\S]*?)>\s*<div className="dev-btn-3d-top([^"]*)">([\s\S]*?)<\/div>\s*<div className="dev-btn-3d-bottom"><\/div>\s*<div className="dev-btn-3d-base"><\/div>\s*<\/button>/g;
  content = content.replace(divRegex, (match, p1, p2, p3, p4) => {
    let extraClasses = (p1 + " " + p3).replace(/dev-btn-3d-top/g, '').trim();
    if(extraClasses) {
      extraClasses = " " + extraClasses;
    }
    return `className="glass-btn-primary${extraClasses}"${p2}>\n${p4}\n</button>`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
}

const files = [
  'src/app/(dashboard)/dashboard/page.tsx',
  'src/app/(dashboard)/dashboard/files/page.tsx',
  'src/app/(dashboard)/dashboard/notes/page.tsx',
  'src/app/(dashboard)/dashboard/passwords/page.tsx',
  'src/app/(dashboard)/dashboard/software/page.tsx'
];

files.forEach(f => {
  const p = path.join('c:/Users/Caio/Documents/caiosobrinho-website', f);
  if(fs.existsSync(p)) {
    replaceInFile(p);
  }
});

// Atualizar globals.css
const cssPath = path.join('c:/Users/Caio/Documents/caiosobrinho-website', 'src/app/globals.css');
if(fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');
  const cssOriginal = css;

  // Substituir :root
  const rootRegex = /:root\s*\{[\s\S]*?\/\* Isolated, cohesive palettes/g;
  const newRoot = `:root {
  /* Premium Obsidian & Gold default theme */
  --background: #050505;                 /* Deep obsidian black */
  --foreground: #f4f4f5;                 /* Cool white */
  
  --card: #121212;                       /* Charcoal card */
  --card-foreground: #f4f4f5;
  
  --popover: #121212;
  --popover-foreground: #f4f4f5;
  
  --primary: #d4af37;                    /* Metallic Gold */
  --primary-foreground: #050505;
  
  --secondary: #1a1a1a;                  /* Deep slate gray accent */
  --secondary-foreground: #d4af37;
  
  --muted: #111116;          
  --muted-foreground: #9ca3af;           /* Neutral slate gray */
  
  --accent: #e5c158;                     /* Lighter Gold */
  --accent-foreground: #050505;
  
  --destructive: hsl(0, 84%, 60%);
  --destructive-foreground: hsl(0, 0%, 100%);
  
  --border: #222222;                     /* Sleek, thin border */
  --input: #222222;
  --ring: #d4af37;
  
  --radius: 12px;
}

/* Isolated, cohesive palettes`;
  css = css.replace(rootRegex, newRoot);

  // Adicionar tema .theme-gold e background class
  if (!css.includes('.theme-gold')) {
    css = css.replace('.theme-carbon {', '.theme-gold {\\n' +
  '  --background: #050505;\\n' +
  '  --foreground: #f4f4f5;\\n' +
  '  --card: #121212;\\n' +
  '  --card-foreground: #f4f4f5;\\n' +
  '  --popover: #121212;\\n' +
  '  --popover-foreground: #f4f4f5;\\n' +
  '  --primary: #d4af37;\\n' +
  '  --primary-foreground: #050505;\\n' +
  '  --secondary: #1a1a1a;\\n' +
  '  --secondary-foreground: #d4af37;\\n' +
  '  --muted: #111116;\\n' +
  '  --muted-foreground: #9ca3af;\\n' +
  '  --accent: #e5c158;\\n' +
  '  --accent-foreground: #050505;\\n' +
  '  --border: #222222;\\n' +
  '  --input: #222222;\\n' +
  '  --ring: #d4af37;\\n' +
  '}\\n\\n.theme-carbon {');
  }

  css = css.replace('.bg-preset-limon {', '.bg-preset-limon, .bg-preset-gold {');

  // Remover dev-btn-3d
  const btnRegex = new RegExp('\\\\/\\\\* 2\\\\. Button: botao 3d click \\\\*\\\\/[\\\\s\\\\S]*?\\\\.dev-btn-3d-base[\\\\s\\\\S]*?\\\\}', 'g');
  css = css.replace(btnRegex, '/* Removed dev-btn-3d */');

  if(css !== cssOriginal) {
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('Updated globals.css');
  }
}

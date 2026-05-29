const fs = require('fs');

// 1. Update globals.css
let css = fs.readFileSync('src/app/globals.css', 'utf8');

const premiumStyles = `
/* ==========================================================================
   PREMIUM DARK GOLDEN FUTURISTIC
   ========================================================================== */

:root {
  --background: #121214; /* Deep sophisticated dark */
  --card: #1C1C1E; /* Subtly lighter for elevation */
  --primary: #D4AF37; /* Elegant Gold */
  --primary-foreground: #121214;
  --secondary: #1F1F22;
  --muted: #2C2C2E;
  --border: rgba(212, 175, 55, 0.15); /* Golden tint on borders */
}

/* CARDS */
.card-premium, .glass-panel, .glass-panel-solid {
  background: var(--card) !important;
  border: 1px solid var(--border) !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
  backdrop-filter: blur(10px) !important;
  transition: all 0.3s ease;
  clip-path: none !important;
}

.card-premium:hover, .glass-panel:hover {
  border-color: rgba(212, 175, 55, 0.4) !important;
  box-shadow: 0 12px 40px rgba(212, 175, 55, 0.08) !important;
  transform: translateY(-2px);
}

/* INPUTS */
.input-premium, input, select, textarea {
  background: var(--secondary) !important;
  border: 1px solid var(--border) !important;
  border-radius: 8px !important;
  color: #F5F5F5 !important;
  padding: 0.8rem 1.2rem;
  font-size: 0.875rem;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
  box-shadow: none !important;
}
.input-premium:focus, input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2) !important;
}

/* BUTTONS */
.btn-neu, .glass-btn, .dev-btn-download, .dev-btn-3d, .btn-primary, .btn-neu-primary, .glass-btn-primary, .btn-secondary {
  position: relative;
  padding: 10px 20px;
  border-radius: 8px !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  font-size: 13px;
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
  background: linear-gradient(145deg, #1A1A1D, #121214) !important;
  color: #D4AF37 !important;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
  transition: all 0.3s ease !important;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Inter', sans-serif;
}

.btn-neu:hover, .glass-btn:hover, .dev-btn-download:hover, .dev-btn-3d:hover, .btn-primary:hover, .btn-neu-primary:hover, .glass-btn-primary:hover, .btn-secondary:hover {
  background: var(--primary) !important;
  color: #121214 !important;
  border-color: var(--primary) !important;
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.25) !important;
  transform: translateY(-1px);
}

.btn-neu:active, .glass-btn:active, .dev-btn-download:active, .dev-btn-3d:active, .btn-primary:active, .btn-neu-primary:active, .glass-btn-primary:active, .btn-secondary:active {
  transform: translateY(1px) !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5) !important;
}

/* REPEATING ROWS (The exact requirement) */
.street-row, .row-premium {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding-left: 1rem !important;
  padding-right: 1rem !important;
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
  background: transparent !important;
  border-radius: 0 !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  transition: background 0.2s ease;
}
.street-row:last-child, .row-premium:last-child {
  border-bottom: none !important;
}
.street-row:hover, .row-premium:hover {
  background: rgba(212, 175, 55, 0.03) !important; /* Extremely subtle gold hover */
}
`;

css = css.replace(/\/\* ==========================================================================\s*\*\/[\s\S]*?\/\* Base text sizing adjustments for standard readable text \*\//, premiumStyles + '\n/* Base text sizing adjustments for standard readable text */');
fs.writeFileSync('src/app/globals.css', css, 'utf8');

// 2. Update page.tsx
let page = fs.readFileSync('src/app/(dashboard)/dashboard/page.tsx', 'utf8');

// Remove Dev Components widget entirely
page = page.replace(/\{renderDevComponents\(4\)\}/, '');

// Clean up Hero
page = page.replace(
  /<span className="text-primary uppercase tracking-tighter text-6xl block mb-2">\{data\?\.profile\?\.username \|\| 'AGENT'\}<\/span> BEM-VINDO/,
  'Bem-vindo, <span className="text-primary font-medium">{data?.profile?.username || \'Usuário\'}</span>'
);
page = page.replace(
  /className="text-4xl sm:text-7xl font-black text-white tracking-tighter uppercase leading-\[0\.9\]"/,
  'className="text-3xl sm:text-5xl font-display font-light text-white tracking-tight mb-2"'
);
page = page.replace(
  /<div className="w-full h-full overflow-hidden border-4 border-white bg-black\/50 shadow-\[6px_6px_0px_var\(--primary\)\]">/,
  '<div className="w-full h-full rounded-full overflow-hidden border border-primary/30 bg-card shadow-[0_0_20px_rgba(212,175,55,0.15)]">'
);

// Fix Shortcuts gap classes
page = page.replace(
  /className="grid grid-cols-2 gap-4 px-\[20px\] pb-\[20px\] pt-\[5px\]"/,
  'className="grid grid-cols-2 gap-3 px-[15px] pb-[15px]"'
);

fs.writeFileSync('src/app/(dashboard)/dashboard/page.tsx', page, 'utf8');
console.log('Done applying Dark Golden');

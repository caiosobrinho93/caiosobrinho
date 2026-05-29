const fs = require('fs');

// 1. Update globals.css
let css = fs.readFileSync('src/app/globals.css', 'utf8');

// Replace Root Colors for Neumorphism
css = css.replace(/--background: #1A1A1A;/g, '--background: #1E1E1E;');
css = css.replace(/--card: #242424;/g, '--card: #1E1E1E;');
css = css.replace(/--popover: #242424;/g, '--popover: #1E1E1E;');
css = css.replace(/--muted: #242424;/g, '--muted: #1E1E1E;');

const neumorphicClasses = `
/* ==========================================================================
   NEUMORPHISM (SOFT UI) - CORE ARCHITECTURE
   ========================================================================== */

/* CARDS: Superfícies Neumórficas (Extrudadas) */
.card-premium, .glass-panel, .glass-panel-solid {
  background: var(--background) !important;
  border: none !important;
  border-radius: var(--radius);
  box-shadow: 
    6px 6px 12px rgba(10, 10, 10, 0.8),
    -6px -6px 12px rgba(45, 45, 45, 0.4) !important;
  backdrop-filter: none !important;
  transition: all 0.3s ease;
}
.card-premium:hover, .glass-panel:hover {
  box-shadow: 
    8px 8px 16px rgba(10, 10, 10, 0.9),
    -8px -8px 16px rgba(45, 45, 45, 0.5) !important;
}

/* INPUTS E SELECTS: Intrusão Neumórfica (Afundados) */
.input-premium, input, select, textarea {
  background-color: var(--background) !important;
  border: none !important;
  color: var(--foreground);
  border-radius: var(--radius);
  padding: 0.8rem 1.2rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  width: 100%;
  box-shadow: 
    inset 4px 4px 8px rgba(10, 10, 10, 0.8),
    inset -4px -4px 8px rgba(45, 45, 45, 0.3) !important;
}
.input-premium:focus, input:focus, select:focus, textarea:focus {
  outline: none;
  box-shadow: 
    inset 6px 6px 12px rgba(10, 10, 10, 0.9),
    inset -6px -6px 12px rgba(45, 45, 45, 0.4),
    0 0 0 1px rgba(212, 175, 55, 0.2) !important;
}
.input-premium::placeholder, input::placeholder, textarea::placeholder {
  color: var(--muted-foreground);
}

/* BOTÕES PADRONIZADOS NEUMÓRFICOS (.btn-neu) */
.btn-neu, .glass-btn, .dev-btn-download, .dev-btn-3d {
  background: var(--background) !important;
  color: var(--foreground) !important;
  border: none !important;
  border-radius: var(--radius);
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 
    5px 5px 10px rgba(10, 10, 10, 0.8),
    -5px -5px 10px rgba(45, 45, 45, 0.4) !important;
}

.btn-neu:hover, .glass-btn:hover, .dev-btn-download:hover, .dev-btn-3d:hover {
  color: var(--primary) !important;
}

.btn-neu:active, .glass-btn:active, .dev-btn-download:active, .dev-btn-3d:active {
  box-shadow: 
    inset 4px 4px 8px rgba(10, 10, 10, 0.8),
    inset -4px -4px 8px rgba(45, 45, 45, 0.4) !important;
  color: var(--primary) !important;
}

/* Botão Neumórfico Primário (Trazendo o Dourado Suavemente) */
.btn-neu-primary, .glass-btn-primary, .btn-primary {
  background: var(--background) !important;
  color: var(--primary) !important;
  border: none !important;
  border-radius: var(--radius);
  padding: 0.8rem 1.5rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 
    5px 5px 10px rgba(10, 10, 10, 0.8),
    -5px -5px 10px rgba(45, 45, 45, 0.4),
    inset 0 0 2px rgba(212,175,55, 0.1) !important;
}

.btn-neu-primary:active, .glass-btn-primary:active, .btn-primary:active {
  box-shadow: 
    inset 4px 4px 8px rgba(10, 10, 10, 0.9),
    inset -4px -4px 8px rgba(45, 45, 45, 0.5),
    inset 0 0 2px rgba(212,175,55, 0.2) !important;
}
`;

// Replace everything from /* CARDS: Superfícies Glossy Premium */ up to /* Base text sizing adjustments for standard readable text */
css = css.replace(/\/\* CARDS: Superfícies Glossy Premium \*\/[\s\S]*?\/\* Base text sizing adjustments for standard readable text \*\//, neumorphicClasses + '\n/* Base text sizing adjustments for standard readable text */');

// Fallback logic if the block wasn't exactly matched (for safety):
if (!css.includes('NEUMORPHISM (SOFT UI)')) {
  // If the glossy block wasn't matched (maybe the exact text differed), we replace the standard blocks.
  css = css.replace(/\/\* CARDS:[\s\S]*?\/\* Base text sizing/m, neumorphicClasses + '\n/* Base text sizing');
}

fs.writeFileSync('src/app/globals.css', css, 'utf8');

// 2. Update DashboardShell.tsx Mobile Gap
let shell = fs.readFileSync('src/components/DashboardShell.tsx', 'utf8');
shell = shell.replace(/className="flex-1 w-full h-full overflow-y-auto relative pt-24 pb-32 px-4 md:px-10 lg:px-16 scrollbar-none"/, 'className="flex-1 w-full h-full overflow-y-auto relative pt-6 md:pt-24 pb-32 px-4 md:px-10 lg:px-16 scrollbar-none"');
fs.writeFileSync('src/components/DashboardShell.tsx', shell, 'utf8');

// 3. Update passwords/page.tsx
let pass = fs.readFileSync('src/app/(dashboard)/dashboard/passwords/page.tsx', 'utf8');
// Standardize the two main buttons at the top
pass = pass.replace(/className="flex items-center justify-center gap-4 px-3 py-1\.5 rounded-sm text-sm font-bold bg-primary text-black hover:bg-primary\/90 transition-colors cursor-pointer"/, 'className="btn-neu"');
pass = pass.replace(/className="glass-btn-primary shrink-0  flex items-center justify-center gap-2"/, 'className="btn-neu-primary shrink-0"');

fs.writeFileSync('src/app/(dashboard)/dashboard/passwords/page.tsx', pass, 'utf8');

console.log('Neumorphism Pivot Completed!');

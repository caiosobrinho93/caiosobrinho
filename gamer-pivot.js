const fs = require('fs');

let css = fs.readFileSync('src/app/globals.css', 'utf8');

// Replace Root Colors with Cyberpunk Variables
css = css.replace(/--background: #[0-9A-Fa-f]+;/g, '--background: #05050D;');
css = css.replace(/--card: #[0-9A-Fa-f]+;/g, '--card: #0A0A14;');
css = css.replace(/--popover: #[0-9A-Fa-f]+;/g, '--popover: #0A0A14;');
css = css.replace(/--primary: #[0-9A-Fa-f]+;/g, '--primary: #00FFCC;');
css = css.replace(/--primary-foreground: #[0-9A-Fa-f]+;/g, '--primary-foreground: #000000;');
css = css.replace(/--secondary: #[0-9A-Fa-f]+;/g, '--secondary: #FF0055;');
css = css.replace(/--muted: #[0-9A-Fa-f]+;/g, '--muted: #1A1A2E;');
css = css.replace(/--border: [^;]+;/g, '--border: rgba(0, 255, 204, 0.2);');

const gamerClasses = `
/* ==========================================================================
   CYBER-GAMER HUD - EXTREME REDESIGN
   ========================================================================== */

/* CARDS: Painéis Sci-Fi com Angulações */
.card-premium, .glass-panel, .glass-panel-solid {
  background: rgba(10, 10, 20, 0.7) !important;
  border: 1px solid var(--border) !important;
  border-radius: 0 !important;
  box-shadow: inset 0 0 20px rgba(0, 255, 204, 0.02) !important;
  backdrop-filter: blur(16px) !important;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%) !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
}

.card-premium:hover, .glass-panel:hover {
  border-color: var(--primary) !important;
  box-shadow: 
    0 0 15px rgba(0, 255, 204, 0.2),
    inset 0 0 20px rgba(0, 255, 204, 0.1) !important;
}

/* Efeito Hover de Grade Scanline e Neon */
.card-premium::after, .glass-panel::after {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 255, 204, 0.05) 51%);
  background-size: 100% 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}
.card-premium:hover::after, .glass-panel:hover::after { opacity: 1; }

/* INPUTS E SELECTS: HUD Inputs */
.input-premium, input, select, textarea {
  background: rgba(0, 0, 0, 0.6) !important;
  border: 1px solid rgba(0, 255, 204, 0.3) !important;
  color: #fff;
  border-radius: 0 !important;
  padding: 0.8rem 1.2rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  width: 100%;
  box-shadow: none !important;
  font-family: monospace;
}
.input-premium:focus, input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary) !important;
  box-shadow: 0 0 10px rgba(0, 255, 204, 0.4), inset 0 0 5px rgba(0, 255, 204, 0.2) !important;
}

/* BOTÕES PADRONIZADOS GAMER (.btn-neu substituída pela lógica HUD) */
.btn-neu, .glass-btn, .dev-btn-download, .dev-btn-3d, .btn-primary, .btn-neu-primary, .glass-btn-primary {
  background: rgba(0, 255, 204, 0.1) !important;
  color: var(--primary) !important;
  border: 1px solid var(--primary) !important;
  border-radius: 0 !important;
  padding: 0.8rem 1.5rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 0 5px rgba(0, 255, 204, 0.2) !important;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%);
}

.btn-neu:hover, .glass-btn:hover, .dev-btn-download:hover, .dev-btn-3d:hover, .btn-primary:hover, .btn-neu-primary:hover, .glass-btn-primary:hover {
  background: var(--primary) !important;
  color: #000 !important;
  box-shadow: 0 0 20px rgba(0, 255, 204, 0.6) !important;
}

.btn-neu:active, .glass-btn:active, .dev-btn-download:active, .dev-btn-3d:active, .btn-primary:active, .btn-neu-primary:active, .glass-btn-primary:active {
  transform: scale(0.96);
  box-shadow: 0 0 10px rgba(0, 255, 204, 0.8) !important;
}

/* Secondary Hover Glitch */
.btn-secondary {
  border: 1px solid var(--secondary) !important;
  color: var(--secondary) !important;
  background: rgba(255, 0, 85, 0.1) !important;
}
.btn-secondary:hover {
  background: var(--secondary) !important;
  color: #fff !important;
  box-shadow: 0 0 20px rgba(255, 0, 85, 0.6) !important;
}
`;

// Replace everything from /* NEUMORPHISM (SOFT UI) - CORE ARCHITECTURE */ up to /* Base text sizing adjustments for standard readable text */
css = css.replace(/\/\* ==========================================================================\s*\*\/[\s\S]*?\/\* Base text sizing adjustments for standard readable text \*\//, gamerClasses + '\n/* Base text sizing adjustments for standard readable text */');

fs.writeFileSync('src/app/globals.css', css, 'utf8');

// Now, update DashboardShell.tsx to include the Cyber Background globally if possible, or just style the body.
let shell = fs.readFileSync('src/components/DashboardShell.tsx', 'utf8');
// To make the background animated, we can inject a grid overlay div right inside the body.
if (!shell.includes('bg-cyber-grid')) {
  shell = shell.replace(/<div className="flex h-screen w-full bg-background overflow-hidden relative">/, 
    '<div className="flex h-screen w-full bg-background overflow-hidden relative"><div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(0,255,204,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,204,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>');
}

fs.writeFileSync('src/components/DashboardShell.tsx', shell, 'utf8');

console.log('Gamer Pivot (CSS & Structural) Completed!');

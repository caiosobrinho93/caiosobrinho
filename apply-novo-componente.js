const fs = require('fs');

let css = fs.readFileSync('src/app/globals.css', 'utf8');

const newStyles = `
/* ==========================================================================
   SLEEK TECH HUD - (NOVO COMPONENTE STYLE)
   ========================================================================== */

:root {
  --background: #0A0F1A;
  --card: rgba(15, 20, 30, 0.6);
  --primary: #3D6AFF;
  --primary-foreground: #FFFFFF;
  --secondary: #00E5FF;
  --muted: rgba(255, 255, 255, 0.05);
  --border: rgba(61, 106, 255, 0.2);
}

/* CARDS */
.card-premium, .glass-panel, .glass-panel-solid {
  background: var(--card) !important;
  border: 1px solid var(--border) !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2), inset 0 0 10px rgba(61, 106, 255, 0.05) !important;
  backdrop-filter: blur(20px) !important;
  transition: all 0.3s ease;
  clip-path: none !important;
}

.card-premium:hover, .glass-panel:hover {
  border-color: rgba(61, 106, 255, 0.5) !important;
  box-shadow: 0 0 20px rgba(61, 106, 255, 0.15), inset 0 0 10px rgba(61, 106, 255, 0.1) !important;
}

.card-premium::after, .glass-panel::after {
  display: none !important;
}

/* INPUTS */
.input-premium, input, select, textarea {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(61, 106, 255, 0.3) !important;
  border-radius: 7px !important;
  color: #fff;
  padding: 0.8rem 1.2rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}
.input-premium:focus, input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary) !important;
  box-shadow: 0 0 15px rgba(61, 106, 255, 0.3) !important;
}

/* NOVO COMPONENTE BUTTONS */
.btn-neu, .glass-btn, .dev-btn-download, .dev-btn-3d, .btn-primary, .btn-neu-primary, .glass-btn-primary, .btn-secondary {
  position: relative;
  padding: 10px 20px;
  border-radius: 7px !important;
  border: 1px solid rgb(61, 106, 255) !important;
  font-size: 14px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 2px;
  background: transparent !important;
  color: #fff !important;
  overflow: hidden;
  box-shadow: 0 0 0 0 transparent !important;
  transition: all 0.2s ease-in !important;
  clip-path: none !important;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-neu:hover, .glass-btn:hover, .dev-btn-download:hover, .dev-btn-3d:hover, .btn-primary:hover, .btn-neu-primary:hover, .glass-btn-primary:hover, .btn-secondary:hover {
  background: rgb(61, 106, 255) !important;
  box-shadow: 0 0 30px 5px rgba(0, 142, 236, 0.815) !important;
  transition: all 0.2s ease-out !important;
}

.btn-neu::before, .glass-btn::before, .dev-btn-download::before, .dev-btn-3d::before, .btn-primary::before, .btn-neu-primary::before, .glass-btn-primary::before, .btn-secondary::before {
  content: '';
  display: block;
  width: 0px;
  height: 86%;
  position: absolute;
  top: 7%;
  left: 0%;
  opacity: 0;
  background: #fff;
  box-shadow: 0 0 50px 30px #fff;
  transform: skewX(-20deg);
}

.btn-neu:hover::before, .glass-btn:hover::before, .dev-btn-download:hover::before, .dev-btn-3d:hover::before, .btn-primary:hover::before, .btn-neu-primary:hover::before, .glass-btn-primary:hover::before, .btn-secondary:hover::before {
  animation: sh02 0.5s 0s linear;
}

.btn-neu:active, .glass-btn:active, .dev-btn-download:active, .dev-btn-3d:active, .btn-primary:active, .btn-neu-primary:active, .glass-btn-primary:active, .btn-secondary:active {
  box-shadow: 0 0 0 0 transparent !important;
  transition: box-shadow 0.2s ease-in !important;
  transform: none !important;
}

@keyframes sh02 {
  from { opacity: 0; left: 0%; }
  50% { opacity: 1; }
  to { opacity: 0; left: 100%; }
}

`;

// Overwrite the previous CYBER-GAMER HUD section
css = css.replace(/\/\* ==========================================================================\s*\*\/[\s\S]*?\/\* Base text sizing adjustments for standard readable text \*\//, newStyles + '\n/* Base text sizing adjustments for standard readable text */');

fs.writeFileSync('src/app/globals.css', css, 'utf8');

console.log('Done CSS pivot');

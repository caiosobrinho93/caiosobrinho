const fs = require('fs');

let css = fs.readFileSync('src/app/globals.css', 'utf8');

const newStyles = `
/* ==========================================================================
   URBAN STREET / BRUTALISM HUD
   ========================================================================== */

:root {
  --background: #111111; /* Asphalt Black */
  --card: #1C1C1C;
  --primary: #FFEA00; /* Hazard Yellow */
  --primary-foreground: #000000;
  --secondary: #FF2A5F; /* Spray Paint Pink/Red */
  --muted: #2A2A2A;
  --border: #333333;
}

/* CARDS (Brutalist blocks, no glass) */
.card-premium, .glass-panel, .glass-panel-solid {
  background: var(--card) !important;
  border: 3px solid #333 !important;
  border-radius: 0 !important;
  box-shadow: 6px 6px 0px rgba(0,0,0,1) !important; /* Hard shadow */
  backdrop-filter: none !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  clip-path: none !important;
}

.card-premium:hover, .glass-panel:hover {
  border-color: var(--primary) !important;
  box-shadow: 6px 6px 0px var(--primary) !important;
  transform: translate(-2px, -2px);
}

.card-premium::after, .glass-panel::after {
  display: none !important;
}

/* INPUTS */
.input-premium, input, select, textarea {
  background: #000 !important;
  border: 2px solid #444 !important;
  border-radius: 0 !important;
  color: #fff;
  padding: 0.8rem 1.2rem;
  font-size: 0.875rem;
  font-weight: bold;
  font-family: monospace;
  transition: all 0.2s ease;
  box-shadow: 4px 4px 0px #222 !important;
}
.input-premium:focus, input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary) !important;
  box-shadow: 4px 4px 0px var(--primary) !important;
}

/* BRUTALIST BUTTON (NOVO ESTILO STREET) */
.btn-neu, .glass-btn, .dev-btn-download, .dev-btn-3d, .btn-primary, .btn-neu-primary, .glass-btn-primary, .btn-secondary {
  position: relative;
  padding: 12px 24px;
  border-radius: 0 !important;
  border: 2px solid #fff !important;
  font-size: 15px;
  text-transform: uppercase;
  font-weight: 900;
  letter-spacing: 1px;
  background: #000 !important;
  color: #fff !important;
  box-shadow: 5px 5px 0px var(--primary) !important;
  transition: all 0.15s ease-in-out !important;
  clip-path: none !important;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Inter', sans-serif; /* Fallback to aggressive sans */
}

.btn-neu:hover, .glass-btn:hover, .dev-btn-download:hover, .dev-btn-3d:hover, .btn-primary:hover, .btn-neu-primary:hover, .glass-btn-primary:hover {
  background: var(--primary) !important;
  color: #000 !important;
  border-color: var(--primary) !important;
  box-shadow: 5px 5px 0px #fff !important;
  transform: translate(-2px, -2px);
}

.btn-secondary {
  box-shadow: 5px 5px 0px var(--secondary) !important;
}

.btn-secondary:hover {
  background: var(--secondary) !important;
  color: #fff !important;
  border-color: var(--secondary) !important;
  box-shadow: 5px 5px 0px #fff !important;
}

/* Button Active State (Pressed down effect) */
.btn-neu:active, .glass-btn:active, .dev-btn-download:active, .dev-btn-3d:active, .btn-primary:active, .btn-neu-primary:active, .glass-btn-primary:active, .btn-secondary:active {
  box-shadow: 0px 0px 0px transparent !important;
  transform: translate(3px, 3px) !important;
}

/* Overriding pseudo-elements from before */
.btn-neu::before, .glass-btn::before, .dev-btn-download::before, .dev-btn-3d::before, .btn-primary::before, .btn-neu-primary::before, .glass-btn-primary::before, .btn-secondary::before {
  display: none !important;
}

/* STREET REPEATING GROUPS BORDERS */
/* Target repeating rows */
.street-row {
  border-bottom: 2px dashed #333;
  padding-bottom: 12px;
  margin-bottom: 12px;
  background: transparent !important;
  border-radius: 0 !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
}
.street-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.street-row:hover {
  background: transparent !important;
}

`;

// Overwrite the previous section
css = css.replace(/\/\* ==========================================================================\s*\*\/[\s\S]*?\/\* Base text sizing adjustments for standard readable text \*\//, newStyles + '\n/* Base text sizing adjustments for standard readable text */');

fs.writeFileSync('src/app/globals.css', css, 'utf8');

console.log('Done CSS pivot to Street');

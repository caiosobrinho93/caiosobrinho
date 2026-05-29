const fs = require('fs');

let content = fs.readFileSync('src/app/globals.css', 'utf8');

// 1. Replace card-premium and glass-panel with Glossy style
const glossyCards = `
/* CARDS: Superfícies Glossy Premium */
.card-premium, .glass-panel {
  background: rgba(20, 20, 20, 0.4) !important;
  backdrop-filter: blur(24px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
  border: 1px solid rgba(255, 255, 255, 0.03) !important;
  border-radius: var(--radius);
  box-shadow: 
    0 10px 40px -10px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.card-premium:hover, .glass-panel:hover {
  box-shadow: 
    0 15px 50px -10px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
  border-color: rgba(212, 175, 55, 0.1) !important;
  transform: translateY(-2px);
}
`;

content = content.replace(/\/\* CARDS: Substituindo o visual "Glow" por uma profundidade elegante \*\/[\s\S]*?\/\* BOTÕES PADRONIZADOS \*\//, glossyCards + '\n/* BOTÕES PADRONIZADOS */');

// 2. Adjust inputs to be very distinct (inset shadows)
const glossyInputs = `
/* INPUTS E SELECTS PADRONIZADOS */
.input-premium, input, select, textarea {
  background-color: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  color: var(--foreground);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  width: 100%;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.6);
}
.input-premium:focus, input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: rgba(212, 175, 55, 0.5) !important;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(212, 175, 55, 0.3) !important;
  background-color: rgba(0, 0, 0, 0.6) !important;
}
.input-premium::placeholder, input::placeholder, textarea::placeholder {
  color: var(--muted-foreground);
}
`;

content = content.replace(/\/\* INPUTS E SELECTS PADRONIZADOS \*\/[\s\S]*?\/\* Removendo brilho/m, glossyInputs + '\n/* Removendo brilho');

// 3. Restore glass-btn and glass-btn-primary to actually be glossy!
const glossyButtons = `
/* Restaurando os botões secundários para páginas antigas com Vibe Glossy */
.glass-btn-primary {
  background: linear-gradient(135deg, rgba(212,175,55, 0.9) 0%, rgba(180,140,40, 0.9) 100%) !important;
  color: #1A1A1A !important;
  border: 1px solid rgba(255,255,255, 0.2) !important;
  box-shadow: 0 4px 15px rgba(212,175,55, 0.2), inset 0 1px 0 rgba(255,255,255, 0.4) !important;
  border-radius: var(--radius);
  padding: 0.6rem 1.25rem;
  font-weight: 600;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}
.glass-btn-primary:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 20px rgba(212,175,55, 0.3), inset 0 1px 0 rgba(255,255,255, 0.5) !important;
}

.glass-btn, .dev-btn-download, .dev-btn-3d {
  background: rgba(40, 40, 40, 0.6) !important;
  color: var(--foreground) !important;
  border: 1px solid rgba(255,255,255, 0.05) !important;
  box-shadow: 0 4px 15px rgba(0,0,0, 0.2), inset 0 1px 0 rgba(255,255,255, 0.05) !important;
  border-radius: var(--radius);
  padding: 0.6rem 1.25rem;
  font-weight: 500;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}
.glass-btn:hover, .dev-btn-download:hover, .dev-btn-3d:hover {
  transform: translateY(-1.5px);
  background: rgba(50, 50, 50, 0.7) !important;
  border-color: rgba(212,175,55, 0.3) !important;
  color: var(--primary) !important;
}

.neon-glow-card, .glass-panel-solid {
  @apply card-premium;
}
`;

content = content.replace(/\/\* Removendo brilho exagerado retroativamente para manter compatibilidade \*\/[\s\S]*?\/\* Base text sizing adjustments/m, glossyButtons + '\n/* Base text sizing adjustments');


fs.writeFileSync('src/app/globals.css', content, 'utf8');
console.log('globals.css updated with glossy pivot');

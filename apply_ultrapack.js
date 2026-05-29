const fs = require('fs');
const path = require('path');

const cssPath = path.join('c:/Users/Caio/Documents/caiosobrinho-website', 'src/app/globals.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');

  // Replace glass-panel with an ultra-premium version
  const oldGlass = /\\.glass-panel \{[\\s\\S]*?\\.glass-panel-solid \{[\\s\\S]*?box-shadow: 0 8px 24px rgba\\(0, 0, 0, 0\\.3\\);\n\}/g;
  const newGlass = '.glass-panel {\\n' +
'  background: rgba(18, 18, 18, 0.45) !important;\\n' +
'  backdrop-filter: blur(24px) saturate(200%) !important;\\n' +
'  -webkit-backdrop-filter: blur(24px) saturate(200%) !important;\\n' +
'  border: 1px solid rgba(255, 255, 255, 0.03) !important;\\n' +
'  border-radius: 16px;\\n' +
'  box-shadow: \\n' +
'    0 12px 40px 0 rgba(0, 0, 0, 0.5),\\n' +
'    inset 0 1px 0 0 rgba(255, 255, 255, 0.05),\\n' +
'    inset 0 0 20px 0 rgba(212, 175, 55, 0.01) !important;\\n' +
'  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;\\n' +
'}\\n' +
'.glass-panel:hover {\\n' +
'  border-color: rgba(212, 175, 55, 0.25) !important;\\n' +
'  box-shadow: \\n' +
'    0 20px 50px 0 rgba(0, 0, 0, 0.6),\\n' +
'    0 0 30px 0 rgba(212, 175, 55, 0.08),\\n' +
'    inset 0 1px 0 0 rgba(255, 255, 255, 0.1) !important;\\n' +
'  transform: translateY(-2px);\\n' +
'}\\n' +
'.glass-panel-solid {\\n' +
'  background-color: var(--card) !important;\\n' +
'  border: 1px solid rgba(255, 255, 255, 0.03) !important;\\n' +
'  border-radius: 16px;\\n' +
'  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);\\n' +
'}';

  css = css.replace(oldGlass, newGlass);

  // Add Selection & Custom Scrollbar & Fonts enhancements
  const oldScrollbar = new RegExp('\\\\/\\\\* Scrollbar \\\\*\\\\/[\\\\s\\\\S]*?rgba\\\\(255, 255, 255, 0\\\\.15\\\\);\\n\\\\}', '');
  const newScrollbar = '/* Ultrapack Selection & Scrollbar */\\n' +
'::selection {\\n' +
'  background: rgba(212, 175, 55, 0.3);\\n' +
'  color: #fff;\\n' +
'  text-shadow: 0 0 8px rgba(212, 175, 55, 0.5);\\n' +
'}\\n\\n' +
'::-webkit-scrollbar {\\n' +
'  width: 8px;\\n' +
'  height: 8px;\\n' +
'}\\n' +
'::-webkit-scrollbar-track {\\n' +
'  background: rgba(0,0,0,0.3);\\n' +
'  border-radius: 4px;\\n' +
'}\\n' +
'::-webkit-scrollbar-thumb {\\n' +
'  background: rgba(255,255,255,0.08);\\n' +
'  border-radius: 4px;\\n' +
'  border: 1px solid rgba(255,255,255,0.02);\\n' +
'}\\n' +
'::-webkit-scrollbar-thumb:hover {\\n' +
'  background: rgba(212, 175, 55, 0.4);\\n' +
'  box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);\\n' +
'}';
  
  if(css.match(oldScrollbar)) {
    css = css.replace(oldScrollbar, newScrollbar);
  } else {
    css += '\\n' + newScrollbar;
  }

  // Update .glass-btn-primary
  const oldBtnPrimary = /\\.glass-btn-primary \{[\\s\\S]*?\\.glass-btn-primary:hover \{[\\s\\S]*?15%, transparent\) !important;\n\}/g;
  const newBtnPrimary = '.glass-btn-primary {\\n' +
'  background: linear-gradient(135deg, rgba(212,175,55,1) 0%, rgba(180,140,30,1) 100%) !important;\\n' +
'  color: #050505 !important;\\n' +
'  border: 1px solid rgba(255,255,255,0.2) !important;\\n' +
'  box-shadow: 0 8px 20px 0 rgba(212,175,55,0.2), inset 0 1px 0 rgba(255,255,255,0.4) !important;\\n' +
'  border-radius: 10px;\\n' +
'  padding: 0.75rem 1.5rem;\\n' +
'  font-weight: 800;\\n' +
'  font-size: 0.9rem;\\n' +
'  letter-spacing: 0.05em;\\n' +
'  text-transform: uppercase;\\n' +
'  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;\\n' +
'  cursor: pointer;\\n' +
'  display: inline-flex;\\n' +
'  align-items: center;\\n' +
'  justify-content: center;\\n' +
'  gap: 0.6rem;\\n' +
'}\\n' +
'.glass-btn-primary:hover {\\n' +
'  transform: translateY(-3px) scale(1.02) !important;\\n' +
'  box-shadow: \\n' +
'    0 12px 30px 0 rgba(212,175,55,0.35),\\n' +
'    0 0 20px 0 rgba(212,175,55,0.2),\\n' +
'    inset 0 1px 0 rgba(255,255,255,0.5) !important;\\n' +
'}';

  css = css.replace(oldBtnPrimary, newBtnPrimary);

  fs.writeFileSync(cssPath, css, 'utf8');
  console.log("globals.css updated");
}

const pagePath = path.join('c:/Users/Caio/Documents/caiosobrinho-website', 'src/app/(dashboard)/dashboard/page.tsx');
if (fs.existsSync(pagePath)) {
  let content = fs.readFileSync(pagePath, 'utf8');
  
  // Increase gap in grids
  content = content.replace(/className="grid grid-cols-1 lg:grid-cols-3 gap-6"/, 'className="grid grid-cols-1 lg:grid-cols-3 gap-8"');
  content = content.replace(/className="space-y-6"/, 'className="space-y-8"');
  
  // Update header paddings and fonts
  content = content.replace(/className="text-sm font-display font-bold text-white uppercase tracking-wider"/g, 'className="text-base font-display font-black text-white uppercase tracking-[0.15em]"');
  content = content.replace(/p-\\[10px\\]/g, 'p-5');
  
  // Add luxury styling to module stats
  content = content.replace(new RegExp('bg-muted/15 transition-all', 'g'), 'bg-muted/5 hover:bg-white/5 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(212,175,55,0.08)]');
  
  fs.writeFileSync(pagePath, content, 'utf8');
  console.log("page.tsx updated");
}

const fs = require('fs');
const path = require('path');

const dirs = ['torrents', 'wallpapers', 'passwords', 'files', 'netfrix', 'notes', 'bills', 'receipts', 'dev', 'software', 'profile', 'settings'];
const basePath = path.join(__dirname, 'src', 'app', '(dashboard)', 'dashboard');

dirs.forEach(dir => {
  const p = path.join(basePath, dir, 'page.tsx');
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace old buttons
    content = content.replace(/className="[^"]*dev-btn-3d[^"]*"/g, 'className="glass-button-primary"');
    content = content.replace(/className="[^"]*glass-btn-primary[^"]*"/g, 'className="glass-button-primary"');
    
    // Replace old inputs
    content = content.replace(/className="[^"]*input-premium[^"]*"/g, 'className="glass-input"');
    content = content.replace(/className="w-full bg-black\/50 border border-white\/10[^"]*"/g, 'className="glass-input"');
    content = content.replace(/className="[^"]*border-white\/10 focus:border-primary[^"]*"/g, 'className="glass-input"');
    
    // Clean up random hardcoded card styles that break the glass-panel
    content = content.replace(/bg-card\/40/g, 'bg-transparent');
    content = content.replace(/bg-black\/40/g, 'bg-white/5');
    content = content.replace(/border-border/g, 'border-white/10');
    content = content.replace(/border-primary\/30/g, 'border-white/20');
    
    fs.writeFileSync(p, content, 'utf8');
  }
});
console.log('Sub-pages standardized to Spatial Web.');

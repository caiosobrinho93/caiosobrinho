const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', '(dashboard)', 'dashboard', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Replace min-h-[xxx] with h-full
content = content.replace(/min-h-\[\d+px\]/g, 'h-full');

// Also in renderStorage, reduce inner padding slightly to avoid squishing
content = content.replace(/className="p-4 bg-muted\/10/g, 'className="p-3 bg-muted/10');

// In renderShortcuts (which uses h-20 for shortcut buttons)
// let's check what's inside renderShortcuts:
content = content.replace(/className="h-20/g, 'className="h-16');

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Grid heights naturalized');

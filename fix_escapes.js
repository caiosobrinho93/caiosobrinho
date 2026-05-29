const fs = require('fs');
let c = fs.readFileSync('src/components/DashboardShell.tsx', 'utf8');
c = c.replace(/\\n/g, '\n');
fs.writeFileSync('src/components/DashboardShell.tsx', c, 'utf8');

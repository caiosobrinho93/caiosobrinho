const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/dashboard/page.tsx', 'utf8');
c = c.replace(/\\n/g, '\n');
fs.writeFileSync('src/app/(dashboard)/dashboard/page.tsx', c, 'utf8');

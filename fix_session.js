const fs = require('fs');
const p = 'src/app/(dashboard)/dashboard/page.tsx';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/session\?\.user\?\.username/g, "data?.profile?.username");
fs.writeFileSync(p, c, 'utf8');
console.log('Fixed session variable');

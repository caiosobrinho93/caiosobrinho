const fs = require('fs');
const pagePath = 'src/app/(dashboard)/dashboard/page.tsx';
let content = fs.readFileSync(pagePath, 'utf8');

// Remove Dev Options block
const devBlockRegex = /\{\/\* Dev Options \*\/\}\s*<motion\.div variants=\{itemVariants\} className="glass-panel p-6 flex flex-col min-h-\[360px\]">\s*\{renderDevComponents\(4\)\}\s*<\/motion\.div>/g;

content = content.replace(devBlockRegex, '');

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Dev Options removed');

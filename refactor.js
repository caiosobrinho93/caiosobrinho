const fs = require('fs');
const path = require('path');

const directories = [
  'src/app/(dashboard)/dashboard',
  'src/components'
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const originalContent = content;
      
      // Fix tiny typography
      content = content.replace(/text-\[8px\]/g, 'text-xs');
      content = content.replace(/text-\[9px\]/g, 'text-xs');
      content = content.replace(/text-\[10px\]/g, 'text-sm');
      content = content.replace(/text-\[11px\]/g, 'text-sm');
      
      // Fix cramped paddings and gaps
      content = content.replace(/p-1\.5/g, 'p-4');
      content = content.replace(/p-2/g, 'p-5');
      content = content.replace(/px-1\.5/g, 'px-4');
      content = content.replace(/py-0\.5/g, 'py-2');
      content = content.replace(/gap-1\.5/g, 'gap-3');
      content = content.replace(/gap-2/g, 'gap-4');
      content = content.replace(/gap-1/g, 'gap-2');
      content = content.replace(/mb-1\.5/g, 'mb-4');
      content = content.replace(/pb-1\.5/g, 'pb-4');
      
      // Fix height limits that cramp elements
      content = content.replace(/style={{ maxHeight: 80 }}/g, '');
      content = content.replace(/max-h-36/g, 'max-h-64');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

for (const dir of directories) {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
}

console.log("Refactoring complete.");

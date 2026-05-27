const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src/app/(dashboard)/dashboard', function(filePath) {
  if (filePath.endsWith('page.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Reduce all <label> text sizes
    content = content.replace(/<label([^>]*)className="([^"]*)text-sm([^"]*)"/g, '<label$1className="$2text-[10px] uppercase tracking-wider text-muted-foreground$3"');
    content = content.replace(/<label([^>]*)className="([^"]*)text-xs([^"]*)"/g, '<label$1className="$2text-[10px] uppercase tracking-wider text-muted-foreground$3"');

    // 2. Page Headers: Increase spacing, reduce subtitle
    // Usually looks like: <h1 className="text-2xl font-display font-bold text-white">...</h1> <p className="text-muted-foreground mt-1 text-sm">...</p>
    content = content.replace(/<h1 className="([^"]*)text-2xl([^"]*)">([^<]+)<\/h1>\s*<p className="([^"]*)mt-1([^"]*)">/g, 
      '<h1 className="$1text-2xl mb-1$2">$3</h1>\n          <p className="$4mt-0 text-[11px] mb-6$5">');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Global UI tweaks applied to ${filePath}`);
    }
  }
});

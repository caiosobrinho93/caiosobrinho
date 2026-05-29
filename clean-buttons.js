const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('c:/Users/Caio/Documents/caiosobrinho-website/src/app/(dashboard)');

const regex = /className="glass-button-primary"\s*>\s*<span className="glass-button-primary">\s*([\s\S]*?)\s*<\/span>\s*<span className="glass-button-primary"><\/span>\s*<span className="glass-button-primary"><\/span>\s*<\/button>/g;

const replaceString = `className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-colors cursor-pointer border border-primary/50 shadow-[0_0_15px_rgba(94,92,230,0.4)] hover:scale-[1.02] active:scale-[0.98]">\n  $1\n</button>`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (regex.test(content)) {
        content = content.replace(regex, replaceString);
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});

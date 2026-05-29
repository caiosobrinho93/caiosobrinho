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

// Look for the 3D dev-btn-3d
const regex3d = /className="dev-btn-3d[^"]*"\s*>\s*<span className="dev-btn-3d-top[^"]*">\s*([\s\S]*?)\s*<\/span>\s*<span className="dev-btn-3d-bottom"><\/span>\s*<span className="dev-btn-3d-base"><\/span>\s*<\/button>/g;

// Look for glass-btn glass-btn-primary
const regexGlass = /<button[\s\S]*?className="glass-btn glass-btn-primary[^"]*"\s*>\s*([\s\S]*?)\s*<\/button>/g;

const replaceString = `className="frutiger-button rounded-xl shadow-[0_4px_15px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-transform">\n  <div className="frutiger-inner px-6 py-2.5 rounded-xl flex items-center justify-center gap-2">\n    <div className="frutiger-top-white"></div>\n    <span className="frutiger-text flex items-center justify-center gap-2 font-bold drop-shadow-md text-sm">\n      $1\n    </span>\n  </div>\n</button>`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (regex3d.test(content)) {
        content = content.replace(regex3d, replaceString);
        changed = true;
    }
    
    if (regexGlass.test(content)) {
        content = content.replace(regexGlass, (match, innerContent) => {
            // Need to reconstruct the button tag but with new classes
            return `<button onClick={() => setIsModalOpen(true)} className="frutiger-button rounded-xl shadow-[0_4px_15px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-transform">\n  <div className="frutiger-inner px-6 py-2.5 rounded-xl flex items-center justify-center gap-2">\n    <div className="frutiger-top-white"></div>\n    <span className="frutiger-text flex items-center justify-center gap-2 font-bold drop-shadow-md text-sm">\n      ${innerContent.trim()}\n    </span>\n  </div>\n</button>`;
        });
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});

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

// Look for ANY button that has an onClick with setIsModalOpen and class name containing bg-primary
const regex = /<button[\s\S]*?onClick=\{\(\) => setIsModalOpen\(true\)\}[\s\S]*?className="[^"]*bg-primary[^"]*"[^>]*>([\s\S]*?)<\/button>/g;
// And for Netfrix we have some different ones:
const regexNetfrix = /<button[\s\S]*?onClick=\{\(\) => setIsModalOpen\(true\)\}[\s\S]*?className="[^"]*bg-red-600[^"]*"[^>]*>([\s\S]*?)<\/button>/g;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    // Replace standard primary buttons
    if (regex.test(content)) {
        content = content.replace(regex, (match, innerContent) => {
            return `<button onClick={() => setIsModalOpen(true)} className="frutiger-button rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform">\n  <div className="frutiger-inner px-6 py-3 rounded-xl flex items-center justify-center gap-2">\n    <div className="frutiger-top-white"></div>\n    <span className="frutiger-text flex items-center justify-center gap-2 font-bold drop-shadow-md text-sm">\n      ${innerContent.trim()}\n    </span>\n  </div>\n</button>`;
        });
        changed = true;
    }

    // Replace netfrix red buttons
    if (regexNetfrix.test(content)) {
        content = content.replace(regexNetfrix, (match, innerContent) => {
            return `<button onClick={() => setIsModalOpen(true)} className="frutiger-button rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform">\n  <div className="frutiger-inner px-6 py-3 rounded-xl flex items-center justify-center gap-2">\n    <div className="frutiger-top-white"></div>\n    <span className="frutiger-text flex items-center justify-center gap-2 font-bold drop-shadow-md text-sm">\n      ${innerContent.trim()}\n    </span>\n  </div>\n</button>`;
        });
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});

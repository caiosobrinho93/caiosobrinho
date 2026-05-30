const fs = require('fs');

function cleanMobile(path, regexSearch, replacement) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(regexSearch, replacement);
  fs.writeFileSync(path, content);
}

// 1. Clean Bills
cleanMobile(
  'src/app/(dashboard)/dashboard/bills/page.tsx',
  /\s*\{\/\*\s*Mobile compact rows\s*\*\/\}[\s\S]*?\{\/\*\s*Desktop full cards\s*\*\/}\s*<div className="hidden sm:grid grid-cols-1 gap-4">/,
  '\n          {/* Full cards */}\n          <div className="grid grid-cols-1 gap-4">'
);

// 2. Clean Receipts
cleanMobile(
  'src/app/(dashboard)/dashboard/receipts/page.tsx',
  /\s*\{\/\*\s*Mobile List\s*\*\/\}[\s\S]*?\{\/\*\s*Desktop List\s*\*\/}\s*<div className="hidden sm:flex flex-col gap-5">/,
  '\n          {/* Desktop List */}\n          <div className="flex flex-col gap-5">'
);

// 3. Clean Torrents
cleanMobile(
  'src/app/(dashboard)/dashboard/torrents/page.tsx',
  /\s*\{\/\*\s*Mobile view\s*\*\/\}[\s\S]*?\{\/\*\s*Desktop view\s*\*\/}\s*<div className="hidden sm:flex flex-col gap-5">/,
  '\n          {/* Desktop view */}\n          <div className="flex flex-col gap-5">'
);

// 4. Clean Software (Active)
cleanMobile(
  'src/app/(dashboard)/dashboard/software/page.tsx',
  /\s*\{\/\*\s*Mobile view\s*\*\/\}[\s\S]*?\{\/\*\s*Desktop view\s*\*\/}\s*<div className="hidden sm:grid grid-cols-1 lg:grid-cols-2 gap-4">/,
  '\n          {/* Desktop view */}\n          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">'
);

// 5. Clean Software (Trash)
cleanMobile(
  'src/app/(dashboard)/dashboard/software/page.tsx',
  /\s*\{\/\*\s*Mobile view trash\s*\*\/\}[\s\S]*?\{\/\*\s*Desktop view trash\s*\*\/}\s*<div className="hidden sm:grid grid-cols-1 lg:grid-cols-2 gap-4">/,
  '\n          {/* Desktop view trash */}\n          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">'
);

console.log("Cleaned all mobile blocks");

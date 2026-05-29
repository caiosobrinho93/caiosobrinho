const fs = require('fs');

let page = fs.readFileSync('src/app/(dashboard)/dashboard/page.tsx', 'utf8');

page = page.replace(
  /<div className="grid grid-cols-2 gap-2 px-\[15px\] pb-\[15px\]">/,
  '<div className="grid grid-cols-2 gap-4 px-[20px] pb-[20px] pt-[5px]">'
);

page = page.replace(
  /className="btn-secondary flex-1 justify-center h-\[50px\]"/g,
  'className="btn-secondary flex-1 justify-center h-[50px] !text-[10px] sm:!text-xs"'
);

fs.writeFileSync('src/app/(dashboard)/dashboard/page.tsx', page, 'utf8');
console.log('Fixed shortcuts gap');

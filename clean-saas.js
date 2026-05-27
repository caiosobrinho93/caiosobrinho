const fs = require('fs');
const path = require('path');

const filesToClean = [
  'src/components/DashboardShell.tsx',
  'src/app/(dashboard)/dashboard/page.tsx'
];

for (const file of filesToClean) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Remove NeonParticles component entirely
  content = content.replace(/<NeonParticles \/>/g, '');
  content = content.replace(/import NeonParticles from ".\/NeonParticles";/g, '');
  
  // Remove shadow glows
  content = content.replace(/shadow-\[0_0_.*?(rgba|hsl).*?\]/g, '');
  
  // Remove pulse animations
  content = content.replace(/animate-pulse/g, '');
  
  // Clean up rounded borders on Mobile Menu and headers
  content = content.replace(/border-cyan-\d+/g, 'border-border');
  content = content.replace(/border-fuchsia-\d+/g, 'border-border');
  content = content.replace(/text-cyan/g, 'text-primary');
  content = content.replace(/text-fuchsia/g, 'text-primary');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Cleaned SaaS styles in ${file}`);
  }
}

const fs = require('fs');
const path = require('path');
const glob = require('fs');

// ── Find all dashboard page.tsx files ─────────────────────────────────────
function findFiles(dir, ext = '.tsx', results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findFiles(full, ext, results);
    } else if (entry.name.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

const dashDir = 'src/app/(dashboard)/dashboard';
const pages = findFiles(dashDir);

console.log(`Found ${pages.length} TSX files`);

let changedCount = 0;

// ── Pattern: the section header wrapper ───────────────────────────────────
// Before: className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4"
// After: add mb-8 (32px) or use a specific mb-10 for ~40px or mb-16 for 64px; user wanted 100px ≈ mb-24

// Also fix alignment: the header divs often lack uniform horizontal padding alignment on mobile
// We'll add mb-8 on the header block + ensure the space-y or gap already provides separation

// Pattern 1: Standard cabeçalho with border-b
const patterns = [
  // password / bills / receipts / software / notes / wallpapers / files / videos / torrents style
  {
    find: 'border-b border-border/60 pb-4"',
    replace: 'border-b border-border/60 pb-4 mb-8"'
  },
  {
    find: "border-b border-border/60 pb-4\"",
    replace: "border-b border-border/60 pb-4 mb-8\""
  }
];

for (const file of pages) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const p of patterns) {
    // Skip if already has mb-
    if (content.includes(p.find) && !content.includes('pb-4 mb-')) {
      const before = content;
      content = content.split(p.find).join(p.replace);
      if (content !== before) {
        changed = true;
        console.log(`✅ Added mb-8 to header in: ${path.basename(path.dirname(file))}/page.tsx`);
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
}

console.log(`\n✅ Updated ${changedCount} pages with header margin`);

// ── Also fix the DashboardShell.tsx header alignment ─────────────────────
// The issue: on mobile we now have no header, but some pages have their own page-level header
// that needs proper top-padding since there's no shell header on mobile

// The main padding in DashboardShell is: pt-4 px-4 md:p-8 lg:p-10
// This looks correct. On mobile since header is gone, content starts at pt-4 from top which is fine.
// The bottom bar is 54px so pb-[66px] gives enough clearance.

// ── Final output ──────────────────────────────────────────────────────────
console.log('\nDone!');

const fs = require('fs');
const path = require('path');

const shellPath = path.join(__dirname, 'src', 'components', 'DashboardShell.tsx');
let shellContent = fs.readFileSync(shellPath, 'utf8');

// 1. Add dashboardStats
if (!shellContent.includes('const dashboardStats = useStatsStore')) {
  shellContent = shellContent.replace(
    'export default function DashboardShell({ children, username }: DashboardShellProps) {\r\n  const pathname = usePathname();',
    'export default function DashboardShell({ children, username }: DashboardShellProps) {\r\n  const dashboardStats = useStatsStore((s) => s.data);\r\n  const pathname = usePathname();'
  );
  shellContent = shellContent.replace(
    'export default function DashboardShell({ children, username }: DashboardShellProps) {\n  const pathname = usePathname();',
    'export default function DashboardShell({ children, username }: DashboardShellProps) {\n  const dashboardStats = useStatsStore((s) => s.data);\n  const pathname = usePathname();'
  );
}

// 2. Add customStyle logic
if (!shellContent.includes('const isGiselle')) {
  const replacement = `let customStyle: React.CSSProperties = {};
  const currentUsername = dashboardStats?.profile?.username || username;
  const isGiselle = currentUsername?.toLowerCase() === "giselle";
  if (isGiselle) {
    customStyle = {
      '--primary': '#FF2D55',
      '--primary-rgb': '255, 45, 85',
      '--accent': '#FF375F',
      '--ring': 'rgba(255, 45, 85, 0.5)'
    } as React.CSSProperties;
  }`;
  
  shellContent = shellContent.replace('let customStyle: React.CSSProperties = {};', replacement);
}

// 3. Fix background image merging
shellContent = shellContent.replace(
  'customStyle = {\r\n      backgroundImage: `url(${customTheme.bgImage})`,',
  'customStyle = {\r\n      ...customStyle,\r\n      backgroundImage: `url(${customTheme.bgImage})`,'
);
shellContent = shellContent.replace(
  'customStyle = {\n      backgroundImage: `url(${customTheme.bgImage})`,',
  'customStyle = {\n      ...customStyle,\n      backgroundImage: `url(${customTheme.bgImage})`,'
);

// 4. Fix purple RGBs
shellContent = shellContent.replace(/rgba\(94,\s*92,\s*230/g, 'rgba(var(--primary-rgb)');

fs.writeFileSync(shellPath, shellContent, 'utf8');
console.log('Recovery complete!');

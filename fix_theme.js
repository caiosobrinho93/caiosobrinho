const fs = require('fs');
const path = require('path');

const shellPath = path.join(__dirname, 'src', 'components', 'DashboardShell.tsx');
let shellContent = fs.readFileSync(shellPath, 'utf8');

// 1. Add `const stats = useStatsStore((s) => s.data);` to DashboardShell
if (!shellContent.includes('const dashboardStats = useStatsStore')) {
  shellContent = shellContent.replace(
    'export default function DashboardShell({ children, username }: DashboardShellProps) {\r\n    const pathname = usePathname();',
    'export default function DashboardShell({ children, username }: DashboardShellProps) {\r\n    const dashboardStats = useStatsStore((s) => s.data);\r\n    const pathname = usePathname();'
  );
  shellContent = shellContent.replace(
    'export default function DashboardShell({ children, username }: DashboardShellProps) {\n    const pathname = usePathname();',
    'export default function DashboardShell({ children, username }: DashboardShellProps) {\n    const dashboardStats = useStatsStore((s) => s.data);\n    const pathname = usePathname();'
  );
}

// 2. Update isGiselle check
shellContent = shellContent.replace(
  'const isGiselle = username?.toLowerCase() === "giselle";',
  `const currentUsername = dashboardStats?.profile?.username || username;
    const isGiselle = currentUsername?.toLowerCase() === "giselle";`
);

fs.writeFileSync(shellPath, shellContent, 'utf8');
console.log('Fixed DashboardShell theme trigger!');

const fs = require('fs');
const path = require('path');

const shellPath = path.join(__dirname, 'src', 'components', 'DashboardShell.tsx');
let content = fs.readFileSync(shellPath, 'utf8');

// Remove states
content = content.replace(/const \[isRadioOpen, setIsRadioOpen\] = useState\(false\);\n/g, '');
content = content.replace(/const \[isCalculatorOpen, setIsCalculatorOpen\] = useState\(false\);\n/g, '');
content = content.replace(/const \[isNotificationsOpen, setIsNotificationsOpen\] = useState\(false\);\n/g, '');

// Remove buttons from header
content = content.replace(/<button onClick=\{[^}]*setIsCalculatorOpen[^}]*\}.*?<\/button>\s*/gs, '');
content = content.replace(/<button onClick=\{[^}]*setIsRadioOpen[^}]*\}.*?<\/button>\s*/gs, '');
content = content.replace(/<button onClick=\{[^}]*setIsNotificationsOpen[^}]*\}.*?<\/button>\s*/gs, '');

// Remove buttons from mobile menu
// Note: removing <button onClick={() => { setIsCalculatorOpen...
content = content.replace(/<button onClick=\{[^}]*setIsCalculatorOpen[^}]*\}.*?<\/button>\s*/gs, '');
content = content.replace(/<button onClick=\{[^}]*setIsRadioOpen[^}]*\}.*?<\/button>\s*/gs, '');

// Remove components at the end
content = content.replace(/<SynthwaveRadio isOpen=\{isRadioOpen\} onClose=\{[^}]*\} \/>/g, '');
content = content.replace(/<CyberCalculator isOpen=\{isCalculatorOpen\} onClose=\{[^}]*\} \/>/g, '');

// Remove imports
content = content.replace(/import SynthwaveRadio from "\.\/SynthwaveRadio";\n/g, '');
content = content.replace(/import CyberCalculator from "\.\/CyberCalculator";\n/g, '');

fs.writeFileSync(shellPath, content, 'utf8');
console.log('Removed calc and radio from DashboardShell');

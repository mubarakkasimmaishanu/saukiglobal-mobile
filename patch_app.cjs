const fs = require('fs');

const appPath = 'src/App.tsx';
let appCode = fs.readFileSync(appPath, 'utf8');

// Remove imports
appCode = appCode.replace(/import WalletTransfer from '\.\/components\/WalletTransfer';\r?\n/, '');
appCode = appCode.replace(/import NINPrint from '\.\/components\/NINPrint';\r?\n/, '');
appCode = appCode.replace(/import RequestedServices from '\.\/components\/RequestedServices';\r?\n/, '');
appCode = appCode.replace(/import UpgradeToReseller from '\.\/components\/UpgradeToReseller';\r?\n/, '');
appCode = appCode.replace(/import KiraniService from '\.\/components\/KiraniService';\r?\n/, '');
appCode = appCode.replace(/import AirtimeToCash from '\.\/components\/AirtimeToCash';\r?\n/, '');
appCode = appCode.replace(/import ESimServices from '\.\/components\/ESimServices';\r?\n/, '');
appCode = appCode.replace(/import CACRegistration from '\.\/components\/CACRegistration';\r?\n/, '');
appCode = appCode.replace(/import IntlTopup from '\.\/components\/IntlTopup';\r?\n/, '');

// Update View type
appCode = appCode.replace(
  /type View = 'landing' \| 'login' \| 'signup' \| 'dashboard' \| 'profile' \| 'notifications' \| 'pricing' \| 'support' \| 'airtime' \| 'history' \| 'exams' \| 'referral' \| 'fund' \| 'data' \| 'transfer' \| 'cable' \| 'electricity' \| 'nin' \| 'requests' \| 'upgrade' \| 'alpha' \| 'kirani' \| 'smile' \| 'a2c' \| 'esim' \| 'cac' \| 'intl';/,
  "type View = 'landing' | 'login' | 'signup' | 'dashboard' | 'profile' | 'notifications' | 'pricing' | 'support' | 'airtime' | 'history' | 'exams' | 'referral' | 'fund' | 'data' | 'cable' | 'electricity' | 'alpha' | 'smile';"
);

// Remove route renders
const blocksToRemove = [
  /\{\s*currentView === 'transfer' && \([\s\S]*?\)\s*\}\s*/g,
  /\{\s*currentView === 'nin' && \([\s\S]*?\)\s*\}\s*/g,
  /\{\s*currentView === 'requests' && \([\s\S]*?\)\s*\}\s*/g,
  /\{\s*currentView === 'upgrade' && \([\s\S]*?\)\s*\}\s*/g,
  /\{\s*currentView === 'kirani' && \([\s\S]*?\)\s*\}\s*/g,
  /\{\s*currentView === 'a2c' && \([\s\S]*?\)\s*\}\s*/g,
  /\{\s*currentView === 'esim' && \([\s\S]*?\)\s*\}\s*/g,
  /\{\s*currentView === 'cac' && \([\s\S]*?\)\s*\}\s*/g,
  /\{\s*currentView === 'intl' && \([\s\S]*?\)\s*\}\s*/g
];

blocksToRemove.forEach(regex => {
  appCode = appCode.replace(regex, '');
});

fs.writeFileSync(appPath, appCode);
console.log('App.tsx patched successfully');


// Patch UserDashboard.tsx
const dashPath = 'src/components/UserDashboard.tsx';
let dashCode = fs.readFileSync(dashPath, 'utf8');

// Remove upgrade block
dashCode = dashCode.replace(/\{\/\* Upgrade Banner \*\/\}\s*\{\!user\.isReseller && \([\s\S]*?\)\}/, '');

// Remove transfer button
dashCode = dashCode.replace(/<button\s*onClick=\{\(\) => onNavigate\('transfer'\)\}[\s\S]*?<\/button>/, '');

// Remove unwanted services from grid
dashCode = dashCode.replace(/<ServiceButton icon=\{RefreshCcw\} title="Kirani".*?\/>\r?\n\s*/, '');
dashCode = dashCode.replace(/<ServiceButton icon=\{ArrowUpRight\} title="A2C".*?\/>\r?\n\s*/, '');
dashCode = dashCode.replace(/<ServiceButton icon=\{FileText\} title="NIN".*?\/>\r?\n\s*/, '');
dashCode = dashCode.replace(/<ServiceButton icon=\{Cpu\} title="eSIM".*?\/>\r?\n\s*/, '');
dashCode = dashCode.replace(/<ServiceButton icon=\{Briefcase\} title="CAC".*?\/>\r?\n\s*/, '');
dashCode = dashCode.replace(/<ServiceButton icon=\{Globe2\} title="Intl Topup".*?\/>\r?\n\s*/, '');

fs.writeFileSync(dashPath, dashCode);
console.log('UserDashboard.tsx patched successfully');

const fs = require('fs');
const file = 'e:/Project/Swift-cover-Devtrails/frontend/src/pages/Onboarding.tsx';
let content = fs.readFileSync(file, 'utf8');

// The error is caused by duplicate return statements
// Let's clean up all instances of double/triple/messy return statements before the div
content = content.replace(/(return\s*\(\s*){2,}/g, '  return (\n');

fs.writeFileSync(file, content);
console.log('Fixed syntax error in Onboarding.tsx');

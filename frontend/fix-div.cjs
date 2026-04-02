const fs = require('fs');
const file = 'e:/Project/Swift-cover-Devtrails/frontend/src/pages/Onboarding.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix the doubled wrapper div
if (content.includes('<div className="max-w-4xl mx-auto px-6 relative z-10">\n      <div className="max-w-4xl mx-auto px-6 relative z-10">')) {
  content = content.replace('<div className="max-w-4xl mx-auto px-6 relative z-10">\n      <div className="max-w-4xl mx-auto px-6 relative z-10">', '<div className="max-w-4xl mx-auto px-6 relative z-10">');
}
if (content.includes('<div className="max-w-4xl mx-auto px-6 relative z-10">\r\n      <div className="max-w-4xl mx-auto px-6 relative z-10">')) {
  content = content.replace('<div className="max-w-4xl mx-auto px-6 relative z-10">\r\n      <div className="max-w-4xl mx-auto px-6 relative z-10">', '<div className="max-w-4xl mx-auto px-6 relative z-10">');
}

fs.writeFileSync(file, content);
console.log('fixed double div');

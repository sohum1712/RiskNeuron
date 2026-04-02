const fs = require('fs');
const file = 'e:/Project/Swift-cover-Devtrails/frontend/src/pages/Onboarding.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix duplicate return
content = content.replace('  return (\n  return (', '  return (');

// Update background container
const newBgContainer = `<div style={{ 
      minHeight: '100vh', 
      position: 'relative', 
      overflow: 'hidden', 
      backgroundImage: \`url("\${onboardBgUrl}")\`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      backgroundRepeat: 'no-repeat', 
      backgroundAttachment: 'fixed', 
      fontFamily: '"DM Sans", sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '40px'
    }}>`;

content = content.replace(/<div style={{ \n?      minHeight: '100vh',[^{}]*?}}>/, newBgContainer);

// Update Overlay
content = content.replace('background: \'linear-gradient(to right, rgba(12, 17, 23, 0.85) 0%, rgba(12, 17, 23, 0.4) 50%, rgba(12, 17, 23, 0.1) 100%)\'', 'background: \'linear-gradient(to right, rgba(12, 17, 23, 0.3) 0%, rgba(12, 17, 23, 0.7) 40%, rgba(12, 17, 23, 0.95) 100%)\'');

// Update Header and Container
content = content.replace('<div className="max-w-4xl mx-auto px-6 relative z-10">', '<div className="w-full max-w-2xl relative z-10 mr-12 ml-auto">');
content = content.replace('<div className="text-center mb-8">', '<div className="text-left mb-8">');
content = content.replace('<h1 className="text-4xl font-black mb-2">', '<h1 className="text-4xl font-black mb-2 text-white">');

fs.writeFileSync(file, content);
console.log('Finalized Onboarding UI');

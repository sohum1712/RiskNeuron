const fs = require('fs');
const file = 'e:/Project/Swift-cover-Devtrails/frontend/src/pages/Onboarding.tsx';
let content = fs.readFileSync(file, 'utf8');

const bgImport = "import howItWorksBgUrl from '../assets/images/Bg.jpeg';\n";
if (!content.includes('howItWorksBgUrl')) {
  content = content.replace("import type { OnboardingResponse, PlanOption } from '../types';", "import type { OnboardingResponse, PlanOption } from '../types';\n" + bgImport);
}

content = content.replace(/<div className="min-h-screen(.*?)py-12">/, 
  `<div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', padding: '64px 0', backgroundImage: \`url("\${howItWorksBgUrl}")\`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed', fontFamily: '"DM Sans", sans-serif' }}>
     <style>{\`
       h1, h2, h3 { font-family: 'Barlow', sans-serif !important; }
       .font-label { font-family: 'Space Grotesk', sans-serif !important; }
     \`}</style>
     <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(12, 17, 23, 0.85) 0%, rgba(12, 17, 23, 0.4) 50%, rgba(12, 17, 23, 0.1) 100%)', pointerEvents: 'none' }} />
     <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
     <div className="max-w-4xl mx-auto px-6 relative z-10">`
);
content = content.replace(/<div className="max-w-4xl mx-auto px-6">/, '<div className="max-w-4xl mx-auto px-6 relative z-10">');

const replacements = {
  'bg-cyan-500': 'bg-[#F97316]',
  'text-cyan-500': 'text-[#F97316]',
  'text-cyan-400': 'text-[#F97316]',
  'border-cyan-500': 'border-[#F97316]',
  'shadow-cyan-500/50': 'shadow-[#F97316]/50',
  'bg-slate-800 border border-slate-700': 'bg-white/[0.03] backdrop-blur-[16px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)]',
  'bg-slate-900 border border-slate-600': 'bg-black/20 border border-white/10 backdrop-blur-md',
  'bg-slate-900 border-slate-600': 'bg-black/20 border-white/10 backdrop-blur-md',
  'bg-slate-900': 'bg-black/20',
  'border-slate-600': 'border-white/10',
  'focus:border-cyan-500': 'focus:border-[#F97316]',
  'accent-cyan-500': 'accent-[#F97316]',
  'bg-emerald-500': 'bg-[#F97316]',
  'text-emerald-400': 'text-[#F97316]',
  'bg-slate-700': 'bg-white/10',
  'text-slate-400': 'text-[#94A3B8]',
  'text-slate-300': 'text-[#CBD5E1]',
  'text-slate-100': 'text-white',
  'border-slate-700': 'border-white/10',
  'hover:border-slate-500': 'hover:border-white/20'
};

for (const [find, replace] of Object.entries(replacements)) {
  content = content.split(find).join(replace);
}

fs.writeFileSync(file, content);
console.log('updated');

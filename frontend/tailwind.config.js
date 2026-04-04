/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette — derived from Landing page design tokens
        background: '#0C1117',
        surface: '#161C27',
        surface2: '#1E2537',
        border: 'rgba(255,255,255,0.07)',
        orange: '#5690FF',
        'orange-hover': '#4070E0',
        green: '#22C55E',
        // Legacy aliases kept for backward compat
        accent: '#5690FF',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        'text-primary': '#FFFFFF',
        'text-muted': 'rgba(255,255,255,0.55)',
        zepto: '#EAB308',
        blinkit: '#5690FF',
        swiggy: '#A855F7',
      },
      fontFamily: {
        display: ['Barlow', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        label: ['Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'card': '16px',
        'input': '12px',
        'badge': '6px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.3)',
        'orange': '0 4px 24px rgba(86,144,255,0.2)',
        'green': '0 4px 24px rgba(34,197,94,0.2)',
      },
      backdropBlur: {
        'xs': '4px',
      },
    },
  },
  plugins: [],
}

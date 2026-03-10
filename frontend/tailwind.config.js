/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        surface: '#1E293B',
        border: '#334155',
        accent: '#06B6D4',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        'text-primary': '#F8FAFC',
        'text-muted': '#94A3B8',
        zepto: '#EAB308',
        blinkit: '#F97316',
        swiggy: '#A855F7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'input': '8px',
        'badge': '6px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}

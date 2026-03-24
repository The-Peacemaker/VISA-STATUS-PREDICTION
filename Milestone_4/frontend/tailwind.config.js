/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0B0B',
        ivory: '#F5F5DC',
        gold: '#C2A878',
        slateDeep: '#1F1F1F',
        borderStrong: '#2B2B2B',
        glow: '#8EE6E6',
      },
      boxShadow: {
        brutal: '6px 6px 0 #000',
        panel: '0 14px 40px rgba(0,0,0,0.45)',
        glowGold: '0 0 25px rgba(194,168,120,0.45)',
        glowCyan: '0 0 28px rgba(142,230,230,0.45)',
      },
      borderRadius: {
        brutal: '1rem',
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
      backgroundImage: {
        grain: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        drift: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -14px, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(142,230,230,0)' },
          '50%': { boxShadow: '0 0 28px rgba(142,230,230,0.45)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.4s linear infinite',
        drift: 'drift 7s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

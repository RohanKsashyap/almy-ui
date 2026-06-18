/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        headline: ["Plus Jakarta Sans", "sans-serif"],
        display: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
      },
      colors: {
        'hot-pink': '#DC2626',
        'millennial-pink': '#FECACA',
        'soft-pink': '#FEF2F2',
        'rose-gold': '#FCA5A5',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        slideInRight: 'slideInRight 0.3s ease-out forwards',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        slideUp: 'slideUp 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};

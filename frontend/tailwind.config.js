/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Safelist dynamic classes used in StatCard (bg-${color}-500/10, text-${color}-400)
  safelist: [
    'bg-amber-500/10', 'text-amber-400',
    'bg-blue-500/10',  'text-blue-400',
    'bg-green-500/10', 'text-green-400',
    'bg-purple-500/10','text-purple-400',
    'bg-coffee-500/10','text-coffee-400',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        coffee: {
          50:  '#fdf8f0',
          100: '#faefd9',
          200: '#f4dba9',
          300: '#ecc071',
          400: '#e39d3a',
          500: '#d4821a',
          600: '#bc6814',
          700: '#9c4f13',
          800: '#7e4016',
          900: '#683616',
        },
        cream: {
          50:  '#fffef7',
          100: '#fefce8',
          200: '#fef9c3',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

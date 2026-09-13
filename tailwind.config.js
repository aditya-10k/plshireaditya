/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#05070a',
          900: '#090b10',
          850: '#0d1017',
          800: '#131722',
          700: '#1b2232',
          600: '#252e42',
        },
        glow: {
          blue: '#38bdf8',
          indigo: '#6366f1',
          purple: '#a855f7',
          pink: '#ec4899',
        }
      },
      boxShadow: {
        'neon-blue': '0 0 25px -5px rgba(56, 189, 248, 0.4), 0 0 10px -3px rgba(56, 189, 248, 0.3)',
        'neon-purple': '0 0 35px -5px rgba(168, 85, 247, 0.45), 0 0 15px -3px rgba(168, 85, 247, 0.35)',
        'neon-pink': '0 0 25px -5px rgba(236, 72, 153, 0.4)',
        'card-glow': '0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-breathe': 'glowBreathe 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        glowBreathe: {
          '0%, 100%': { filter: 'drop-shadow(0 0 20px rgba(120, 119, 198, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 35px rgba(168, 85, 247, 0.7))' },
        }
      }
    },
  },
  plugins: [],
}

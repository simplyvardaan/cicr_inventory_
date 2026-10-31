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
        theme: {
          bg: '#05030a',
          surface: '#0d0a17',
          card: '#120e22',
          cardBorder: '#231b3b',
          input: '#090712',
          inputBorder: '#261e40',
          purpleLight: '#c084fc',
          purple: '#9333ea',
          purpleDark: '#581c87',
          accent: '#a855f7',
        },
        cicr: {
          dark: '#05030a',
          card: '#0e0b1a',
          border: '#241a40',
          purple: '#9333ea',
          violet: '#7e22ce',
          glow: '#a855f7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'purple-gradient': 'linear-gradient(135deg, #a855f7 0%, #c084fc 40%, #ffffff 100%)',
        'purple-glow': 'radial-gradient(ellipse at top, rgba(147, 51, 234, 0.25), transparent 70%)',
      }
    },
  },
  plugins: [],
}

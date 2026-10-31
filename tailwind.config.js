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
        brand: {
          blue: '#2563eb',
          blueHover: '#1d4ed8',
          blueLight: '#eff6ff',
          red: '#dc2626',
          redHover: '#b91c1c',
          redLight: '#fef2f2',
          black: '#09090b',
          slate: '#0f172a',
          white: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'dock': '0 20px 40px -15px rgba(15, 23, 42, 0.12)',
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
      }
    },
  },
  plugins: [],
}

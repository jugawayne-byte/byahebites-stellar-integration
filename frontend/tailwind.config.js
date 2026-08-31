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
        stellar: {
          50: '#f0f5ff',
          100: '#e0ebff',
          400: '#3884ff',
          500: '#146ef5',
          600: '#0052cc',
          800: '#0a2559',
          900: '#061633',
        },
        byahe: {
          yellow: '#f6b819',
          orange: '#f06424',
          teal: '#0ea5e9',
          card: '#0f172a',
          cardDark: '#0b1120',
          border: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#394ae2',
        'background-light': '#f6f6f8',
        'background-dark': '#111321',
        'surface-dark': '#1e1e1e',
        'border-dark': '#333333',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

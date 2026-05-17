/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00E676',
          dark: '#00c853',
        },
        background: {
          dark: '#05100a',
        },
        surface: {
          dark: '#0c1a14',
        }
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

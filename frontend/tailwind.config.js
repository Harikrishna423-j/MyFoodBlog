/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8f4f1',
        primary: '#ff7a2f',
        primaryHover: '#e65c00',
        textMain: '#333333',
        textDark: '#1a1a2e',
      },
      fontFamily: {
        sans: ['Poppins', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

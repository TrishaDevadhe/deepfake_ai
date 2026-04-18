/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0f19',
        cardBg: '#151c2a',
        primary: '#3b82f6',
        accent: '#10b981',
        danger: '#ef4444'
      }
    },
  },
  plugins: [],
}

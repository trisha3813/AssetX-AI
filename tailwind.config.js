/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#08080a',      // Pitch obsidian charcoal
          sidebar: '#0f0f12', // Sleek graphite container
          card: '#131316',    // Deep charcoal card surface
          hover: '#1c1c22',   // Card micro-hover graphite
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

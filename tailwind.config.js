/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#17324d',
          blue: '#245b82',
          light: '#f3f6f9',
          line: '#d7e0e8',
          green: '#18794e',
          red: '#b42318',
        },
      },
    },
  },
  plugins: [],
};

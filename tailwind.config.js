/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        customCyan: '#009899',
      },
    },
  },
  plugins: [require('tailwind-scrollbar')],
};


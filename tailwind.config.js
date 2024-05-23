/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/**/*.html',
    './src/renderer/**/*.{js,ts,jsx,tsx}',
    './node_modules/flowbite/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('flowbite/plugin')],
};

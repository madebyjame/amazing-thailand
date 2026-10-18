/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './app.js'],
  theme: { extend: { fontFamily: { sans: ['IBM Plex Sans Thai', 'sans-serif'], display: ['Manrope', 'sans-serif'] } } },
  corePlugins: { preflight: false }
};

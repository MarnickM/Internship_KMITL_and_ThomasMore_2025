/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        stalemate: ['Stalemate', 'cursive'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'top': '0 -2px 4px -2px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};

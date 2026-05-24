/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#18202f',
        ocean: '#136f8f',
        mint: '#2fbf9b',
        amber: '#f2a93b',
      },
      boxShadow: {
        soft: '0 16px 40px rgba(24, 32, 47, 0.08)',
      },
    },
  },
  plugins: [],
};

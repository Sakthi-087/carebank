/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
        },
        brand: {
          500: '#22c55e',
          600: '#16a34a',
        },
      },
      boxShadow: {
        glow: '0 20px 45px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
}

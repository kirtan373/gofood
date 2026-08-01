/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#ff6b35',
          dark: '#e14f1d',
          deeper: '#c7430f',
          light: '#ff8c5a',
          soft: '#fff4ee',
        },
        gold: {
          DEFAULT: '#e8a33d',
          deep: '#c97f1f',
          soft: '#fff7e8',
        },
        espresso: {
          950: '#120e0a',
          900: '#17120d',
          800: '#1f1913',
          700: '#2a221a',
          600: '#3a3026',
        },
        cream: {
          DEFAULT: '#faf7f2',
          warm: '#f3ede4',
        },
      },
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['DM Serif Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        brand: '0 6px 24px rgba(255, 107, 53, 0.28)',
        soft: '0 6px 20px rgba(32, 26, 20, 0.07)',
      },
      borderRadius: {
        xl: '20px',
        '2xl': '28px',
      },
    },
  },
  plugins: [],
}

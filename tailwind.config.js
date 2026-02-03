/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xs': ['0.6rem', { lineHeight: '0.8rem' }],    // 80% of default
        'sm': ['0.7rem', { lineHeight: '1rem' }],
        'base': ['0.8rem', { lineHeight: '1.2rem' }],
        'lg': ['0.9rem', { lineHeight: '1.4rem' }],
        'xl': ['1rem', { lineHeight: '1.5rem' }],
        '2xl': ['1.2rem', { lineHeight: '1.8rem' }],
        '3xl': ['1.5rem', { lineHeight: '2rem' }],
        '4xl': ['1.8rem', { lineHeight: '2.25rem' }],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: '#F5E6DA',
        sage: '#9CAF88',
        cream: '#FFF8F2',
        pink: '#D8A7B1',
        terracotta: '#C97C5D',
        gold: '#D4A373',
        brown: {
          DEFAULT: '#5C4033',
          dark: '#3E2C23',
        },
        soft: '#2B2B2B',
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Noto Serif Devanagari"', 'Georgia', 'serif'],
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '30px',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(92,64,51,0.08)',
        card: '0 8px 40px rgba(92,64,51,0.12)',
        hover: '0 16px 56px rgba(92,64,51,0.18)',
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(135deg, #FFF8F2 0%, #F5E6DA 50%, #FDEEE4 100%)',
        'sage-gradient': 'linear-gradient(135deg, #9CAF88 0%, #b8c9a8 100%)',
        'pink-gradient': 'linear-gradient(135deg, #D8A7B1 0%, #edc5cc 100%)',
        'terra-gradient': 'linear-gradient(135deg, #C97C5D 0%, #d99a80 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4A373 0%, #e0b98a 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'fade-up': 'fadeUp 0.7s ease forwards',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

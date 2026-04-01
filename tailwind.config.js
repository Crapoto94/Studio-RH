/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#060e20',
        surface: {
          DEFAULT: '#060e20',
          dim: '#060e20',
          bright: '#1f2b49',
          low: '#091328',
          DEFAULT2: '#0f1930',
          high: '#141f38',
          highest: '#192540',
          lowest: '#000000',
          variant: '#192540',
        },
        primary: {
          DEFAULT: '#a3a6ff',
          dim: '#6063ee',
          container: '#9396ff',
          fixed: '#9396ff',
        },
        secondary: {
          DEFAULT: '#a28efc',
          container: '#49339d',
          dim: '#a28efc',
        },
        outline: {
          DEFAULT: '#6d758c',
          variant: '#40485d',
        },
        on: {
          surface: '#dee5ff',
          'surface-variant': '#a3aac4',
          background: '#dee5ff',
          primary: '#0f00a4',
        },
        error: {
          DEFAULT: '#ff6e84',
          container: '#a70138',
        },
        tertiary: {
          DEFAULT: '#ffa5d9',
          container: '#ff8ed2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      backdropBlur: {
        glass: '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn: { '0%': { transform: 'translateX(-10px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        pulseGlow: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
    },
  },
  plugins: [],
}

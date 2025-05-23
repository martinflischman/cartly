/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#6750A4',
          50: '#F4EFFA',
          100: '#EADDFF',
          200: '#D0BCFF',
          300: '#B69DF8',
          400: '#9A82DB',
          500: '#7F67BE',
          600: '#6750A4',
          700: '#4F378B',
          800: '#381E72',
          900: '#21005D',
        },
        secondary: {
          DEFAULT: '#625B71',
          100: '#E8DEF8',
          200: '#CCC2DC',
          300: '#B0A7C9',
          400: '#958DA5',
          500: '#7A7289',
          600: '#625B71',
          700: '#4A4458',
          800: '#332D41',
          900: '#1D192B',
        },
        surface: {
          DEFAULT: '#F5F5F7',
          light: '#FFFFFF',
          dark: '#E6E1E5',
        },
        error: {
          DEFAULT: '#B3261E',
        },
        'on-primary': '#FFFFFF',
        'on-surface': '#1C1B1F',
      },
      borderRadius: {
        md: '12px',
        lg: '28px',
        xl: '40px',
      },
      boxShadow: {
        material: '0 1.5px 4px rgba(0,0,0,0.13), 0 1.5px 8px rgba(0,0,0,0.11)',
      },
    },
  },
  plugins: [],
} 
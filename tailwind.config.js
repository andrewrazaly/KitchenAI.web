/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2DCE89', // Mint Green
          light: '#4FE3A3',
          dark: '#26ae74',
        },
        secondary: {
          DEFAULT: '#82D616', // Lime Green
          light: '#9BE542',
          dark: '#6DB211',
        },
        accent: {
          DEFAULT: '#FFD60A', // Citrus Yellow
          light: '#FFE03D',
          dark: '#E6C009',
        },
        teal: {
          DEFAULT: '#11CDEF',
          light: '#41D7F2',
          dark: '#0EAFD0',
        },
        navy: {
          DEFAULT: '#344767',
          light: '#495D80',
          dark: '#283553',
        },
        gray: {
          light: '#F8F9FA',
          medium: '#E9ECEF',
          dark: '#CED4DA',
        },
        success: '#2DCE89',
        warning: '#FB6340',
        danger: '#F5365C',
        info: '#11CDEF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        accent: ['Montserrat', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '8px',
        'lg': '12px',
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 4px 12px rgba(0, 0, 0, 0.05)',
        'lg': '0 8px 16px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
      },
    },
  },
  plugins: [],
} 
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0095D6',
        'primary-dark': '#0077B0',
        'primary-light': '#E6F4FB',
        success: '#13A538',
        'success-light': '#E8F7EC',
        muted: '#757574',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        qassimDark: '#004D73',
        qassimLight: '#70A8BA',
        qassimGrey: '#F4F6F8',
        qassimIndigo: '#2C317A'
      },
      fontFamily: {
        tajawal: ['Tajawal', 'system-ui', 'Arial']
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

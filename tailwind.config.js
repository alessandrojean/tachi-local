const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,vue}'
  ],
  theme: {
    fontFamily: {
      ...defaultTheme.fontFamily,
      sans: ['Inter', ...defaultTheme.fontFamily.sans],
      'sans-var': ['Inter var', ...defaultTheme.fontFamily.sans]
    },
    extend: {
      colors: {
        primary: colors.sky
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function ({ addVariant }) {
      addVariant(
        'supports-backdrop-blur',
        '@supports (backdrop-filter: blur(0)) or (-webkit-backdrop-filter: blur(0))'
      )
      addVariant(
        'supports-var-font',
        '@supports (font-variation-settings: normal)'
      )
      addVariant('not-disabled', '&:not(:disabled)')
    }
  ],
}

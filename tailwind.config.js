module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'white-opaque': 'rgba(255, 255, 255, 0.8)',
        'black-opaque': 'rgba(0, 0, 0, 0.8)',
        'green-600-opaque': 'rgba(22, 163, 74, 0.8)'
      },
      maxWidth: {
        'screen-3xl': '1980px'
      }
    },
  },
  plugins: [],
}

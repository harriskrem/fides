import typography from '@tailwindcss/typography'
import daisyui from 'daisyui'

/* eslint-env node */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}",],
  plugins: [typography, daisyui],
  daisyui: {
    themes: ["cupcake"]
  }
}
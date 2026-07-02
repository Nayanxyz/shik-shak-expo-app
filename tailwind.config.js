/** @type {import('tailwindcss').Config} */
module.exports = {
  // This tells Tailwind to look at all files inside your app and components folders
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
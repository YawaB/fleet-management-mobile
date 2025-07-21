/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {},
    extend: {
      colors: {
        primary: "#d3d3d3",
        redBack: "#D64B70",
        blueBg: "#523F8D",
        bleSec: "#0fa3b1",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  theme: {
    fontFamily: {
      // sans: ["Poppins", "sans-serif"],
      // aslam: ["aslam", "serif"],
      jameel: ["noori", "sans-serif"],
    },
    extend: {
      colors: {
        aquagreen: {
          50: "#f3faf8",
          100: "#d7f0ec",
          200: "#afe0d9",
          300: "#7ecac1",
          400: "#54ada6",
          500: "#3a928c",
          600: "#2c7571",
          700: "#275e5c",
          800: "#234c4b",
          900: "#21403f",
          950: "#0e2425",
        },
        dark: {
          bg: "#1e293b", // Dark background
          text: "#e2e8f0", // Light text
          surface: "#1F2937",
        },
        light: {
          bg: "#2a3648",
          text: "#e2e8f0",
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        success: "#10b981",
        error: "#ef4444",
        warning: "#f59e0b",
      },
      fontFamily: {
        display: ["Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
}

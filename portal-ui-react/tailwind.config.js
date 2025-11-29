/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        usth: {
          navy: "#0a2a55",
          sky: "#1d4ed8",
        },
      },
      boxShadow: {
        subtle: "0 10px 30px -12px rgb(16 24 40 / 0.35)",
      },
    },
  },
  plugins: [],
}


import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef4ff",
          100: "#d9e6ff",
          200: "#b8cfff",
          300: "#8aaeff",
          400: "#5d87ff",
          500: "#3a62f5",
          600: "#2745d3",
          700: "#2037a8",
          800: "#1d3087",
          900: "#1c2c6b",
        },
        ink: {
          50:  "#f7f8fa",
          100: "#eef0f4",
          200: "#dde2ea",
          300: "#b8c0cc",
          400: "#8891a3",
          500: "#5d6679",
          600: "#414a5c",
          700: "#2e3543",
          800: "#1d2330",
          900: "#0f1320",
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"PingFang SC"', '"Microsoft YaHei"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,19,32,.04), 0 4px 12px rgba(15,19,32,.06)",
        cardHover: "0 4px 16px rgba(15,19,32,.08), 0 12px 32px rgba(15,19,32,.10)",
      },
    },
  },
  plugins: [],
};

export default config;

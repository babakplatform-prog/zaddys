import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        zaddys: {
          red: "#D90429",
          black: "#0D0D0D",
          white: "#FFFFFF",
          card: "#1A1A1A",
        },
      },
    },
  },
  plugins: [],
};
export default config;

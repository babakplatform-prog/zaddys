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
          red: "#C91414",
          black: "#121212",
          ink: "#C91414",
          gray: "#666666",
          white: "#FFFFFF",
          surface: "#F9F9F9",
          border: "#EAEAEA",
        },
      },
    },
  },
  plugins: [],
};
export default config;
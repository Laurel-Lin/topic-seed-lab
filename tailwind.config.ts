import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17201b",
        paper: "#fbfaf6",
        moss: "#50644f",
        sage: "#dce5d7",
        clay: "#c36b4f",
        gold: "#d9a441",
        bluegray: "#536a7c"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(23, 32, 27, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

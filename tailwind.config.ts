import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  daisyui: {
    themes: ["dracula"],
  },
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
    fontFamily: {
      spaceMono: ["Space Mono", "sans-serif"], // Add your custom font
    },
    screens: {
      sm: "620px",

      md: "870px",

      lg: "1075px",
    },
  },
  plugins: [require("daisyui")],
} satisfies Config;

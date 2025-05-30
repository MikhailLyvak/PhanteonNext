import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      maxWidth: {
        '8xl': '1320px',
      },
      screens: {
        xs: "376px",
        xxl: '1281px'
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
} satisfies Config;

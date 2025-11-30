import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(0, 0%, 3.9%)",
        accent: {
          DEFAULT: "#F9D97F",
          foreground: "hsl(0, 0%, 9%)",
        },
        card: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(0, 0%, 3.9%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(0, 0%, 3.9%)",
        },
        primary: {
          DEFAULT: "hsl(0, 0%, 9%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        secondary: {
          DEFAULT: "hsl(0, 0%, 96.1%)",
          foreground: "hsl(0, 0%, 9%)",
        },
        muted: {
          DEFAULT: "hsl(0, 0%, 96.1%)",
          foreground: "hsl(0, 0%, 45.1%)",
        },
        border: "hsl(0, 0%, 89.8%)",
        input: "hsl(0, 0%, 89.8%)",
        ring: "#F9D97F",
      },
      borderRadius: {
        lg: "12px",
        md: "16px",
        sm: "20px",
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
    },
  },
  plugins: [],
};

export default config;


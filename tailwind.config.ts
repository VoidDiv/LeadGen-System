import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Navy, taken from dress-uniform blues
        brand: {
          50: "#f1f4f9",
          100: "#e1e7f1",
          200: "#c3cfe3",
          300: "#93a7c9",
          400: "#6580ad",
          500: "#456391",
          600: "#344e78",
          700: "#293f62",
          800: "#1f3050",
          900: "#15223b",
        },
        // Brass, used sparingly for the active state
        brass: { 400: "#d6a94a", 500: "#b8892b", 600: "#966f21" },
        paper: "#f5f6f8",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

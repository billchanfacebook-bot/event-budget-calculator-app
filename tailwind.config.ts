import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        shell: "#f5f0e8",
        card: "#fffdf8",
        accent: "#d0672f",
        accentSoft: "#f3d2c1",
        moss: "#71816d",
        border: "#e6ddd2"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(24, 33, 47, 0.08)"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;

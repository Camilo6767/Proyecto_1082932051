import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "fade-in": "fadeIn 1.5s ease forwards",
        "slide-up": "slideUp 1s ease forwards",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": {
            textShadow: "0 0 20px #6366f1, 0 0 60px #6366f1",
          },
          "50%": {
            textShadow: "0 0 60px #a855f7, 0 0 120px #a855f7",
          },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

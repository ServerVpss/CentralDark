import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(152,76%,40%)",
          foreground: "hsl(0,0%,100%)",
        },
        background: "hsl(222,20%,8%)",
        foreground: "hsl(210,20%,95%)",
        card: {
          DEFAULT: "hsl(222,18%,12%)",
          foreground: "hsl(210,20%,95%)",
        },
        border: "hsl(222,15%,20%)",
        muted: {
          DEFAULT: "hsl(222,15%,18%)",
          foreground: "hsl(210,15%,60%)",
        },
        destructive: {
          DEFAULT: "hsl(0,72%,51%)",
          foreground: "hsl(0,0%,100%)",
        },
        warning: {
          DEFAULT: "hsl(38,92%,50%)",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
} satisfies Config;

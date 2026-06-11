/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        // 主色调 - 柔和粉色系
        primary: {
          50: "#FFF5F7",
          100: "#FFE4EA",
          200: "#FFC9D6",
          300: "#FFA3BA",
          400: "#FF7A99",
          500: "#FF5C7F",
          600: "#F03D66",
          700: "#D12A52",
          800: "#AD2445",
          900: "#8A1F3A",
        },
        // 辅助色 - 薄荷绿
        mint: {
          50: "#F0FFF4",
          100: "#C6F6D5",
          200: "#9AE6B4",
          300: "#68D391",
          400: "#48BB78",
          500: "#38A169",
        },
        // 奶油色背景
        cream: {
          50: "#FFFEF9",
          100: "#FFFAF0",
          200: "#FFF5E1",
        },
        // 夜间模式暗色
        night: {
          50: "#E8E8F0",
          100: "#B8B8D0",
          200: "#6E6E91",
          800: "#1A1A2E",
          900: "#0F0F1A",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        cute: ['"ZCOOL KuaiLe"', '"Noto Sans SC"', "cursive"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(255, 92, 127, 0.1)",
        card: "0 8px 30px rgba(0, 0, 0, 0.06)",
        "card-dark": "0 8px 30px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

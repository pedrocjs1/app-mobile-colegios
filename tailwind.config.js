/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#007AFF", // Fallback Default Blue
        secondary: "#5856D6",
        background: "#F2F2F7", // iOS Light Gray
        card: "#FFFFFF",
        text: "#000000",
        subtext: "#8E8E93",
        success: "#34C759",
        warning: "#FF9500",
        danger: "#FF3B30",
        info: "#5AC8FA",
      },
      fontFamily: {
        sans: ["System"], // San Francisco on iOS
      },
    },
  },
  plugins: [],
}

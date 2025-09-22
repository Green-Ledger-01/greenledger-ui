/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    screens: {
      // Mobile-first breakpoints
      'xs': '375px',   // Small mobile
      'sm': '640px',   // Large mobile
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px', // Extra large desktop
    },
    extend: {
      spacing: {
        // Touch-friendly spacing
        'touch': '44px', // Minimum touch target size
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        'touch': '44px',
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      minWidth: {
        'touch': '44px',
      },
      keyframes: {
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "fade-in-down": "fade-in-down 0.8s ease-out both",
        "fade-in-up": "fade-in-up 0.8s ease-out both",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-out-left": "slide-out-left 0.3s ease-in",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        // Touch-friendly utilities
        ".touch-target": {
          minHeight: "44px",
          minWidth: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        ".mobile-scroll": {
          "-webkit-overflow-scrolling": "touch",
          "overscroll-behavior": "contain",
        },
        ".safe-area-inset": {
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        },
        // Animation utilities
        ".animate-fade-in-down": {
          animation: "fade-in-down 0.8s ease-out both",
        },
        ".animate-fade-in-up": {
          animation: "fade-in-up 0.8s ease-out both",
        },
        ".animate-slide-in-left": {
          animation: "slide-in-left 0.3s ease-out",
        },
        ".animate-slide-out-left": {
          animation: "slide-out-left 0.3s ease-in",
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
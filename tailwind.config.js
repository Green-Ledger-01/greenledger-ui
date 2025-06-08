export default {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        keyframes: {
          'fade-in-down': {
            '0%': { opacity: '0', transform: 'translateY(-20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          'fade-in-up': {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
        },
        animation: {
          'fade-in-down': 'fade-in-down 0.8s ease-out both',
          'fade-in-up': 'fade-in-up 0.8s ease-out both',
        },
      },
    },
    plugins: [],
  }
  
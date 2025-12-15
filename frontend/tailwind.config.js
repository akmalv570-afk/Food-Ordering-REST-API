/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          orange: '#FF6B35',
          red: '#F72C25',
          yellow: '#FFB800',
          dark: '#1A1A1A',
          gray: '#2D2D2D',
        },
        accent: {
          warm: '#FF8C42',
          hot: '#FF5722',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'food': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'food-hover': '0 8px 30px rgba(255, 107, 53, 0.15)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'food': '16px',
        'button': '12px',
      }
    },
  },
  plugins: [],
}


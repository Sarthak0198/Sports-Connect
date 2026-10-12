/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sports: {
          navy: '#0B132B',
          navyLight: '#1C2541',
          blue: '#3A86FF',
          blueHover: '#2563EB',
          cyan: '#00F5D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(58, 134, 255, 0.4)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        'card': '0 10px 30px -10px rgba(11, 19, 43, 0.08)',
        'card-hover': '0 20px 40px -15px rgba(11, 19, 43, 0.16)'
      }
    },
  },
  plugins: [],
}

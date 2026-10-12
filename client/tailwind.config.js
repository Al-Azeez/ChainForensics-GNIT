/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#020817',
          secondary: '#06132D',
          card: '#0B1730',
          elevated: '#102246',
          border: 'rgba(6, 217, 255, 0.15)',
          borderSubtle: 'rgba(255, 255, 255, 0.08)'
        },
        brand: {
          blue: '#2563EB',
          cyan: '#06D9FF',
          purple: '#7C3AED',
          light: '#F8FAFC',
          muted: '#94A3B8'
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          critical: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 217, 255, 0.25)',
        'glow-blue': '0 0 25px -5px rgba(37, 99, 235, 0.3)',
        'glow-purple': '0 0 25px -5px rgba(124, 58, 237, 0.3)',
        'card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}

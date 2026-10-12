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
          main: '#0c1222',
          secondary: '#0f172a',
          card: 'rgba(15, 23, 42, 0.78)',
          elevated: 'rgba(20, 30, 55, 0.85)',
          border: 'rgba(255, 255, 255, 0.12)',
          borderSubtle: 'rgba(255, 255, 255, 0.08)'
        },
        brand: {
          crimson: '#BE123C',
          crimsonDark: '#881337',
          cobalt: '#1D4ED8',
          blue: '#2563EB',
          amber: '#F59E0B',
          gold: '#FBBF24',
          cyan: '#06D9FF',
          purple: '#7C3AED',
          light: '#F8FAFC',
          muted: '#94A3B8',
          surface: 'rgba(12, 18, 36, 0.82)',
          surfaceCard: 'rgba(15, 23, 42, 0.78)',
          surfaceInner: 'rgba(9, 14, 28, 0.85)'
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          critical: '#EF4444'
        }
      },
      fontFamily: {
        headline: ['Sora', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Space Grotesk', 'monospace'],
        mono: ['Space Grotesk', 'JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Sora', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 217, 255, 0.25)',
        'glow-blue': '0 0 25px -5px rgba(37, 99, 235, 0.3)',
        'glow-purple': '0 0 25px -5px rgba(124, 58, 237, 0.3)',
        'glow-amber': '0 0 20px -2px rgba(245, 158, 11, 0.45)',
        'glow-red': '0 0 20px -2px rgba(225, 29, 72, 0.45)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
      }
    },
  },
  plugins: [],
}

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
        // Core dark palette
        dark: {
          DEFAULT: '#0a0a0f',
          50: '#0d0d14',
          100: '#111118',
          200: '#16161f',
          300: '#1c1c27',
          400: '#24242f',
        },
        // Text colors
        'text-primary': '#ffffff',
        'text-secondary': 'rgba(255, 255, 255, 0.7)',
        'text-muted': 'rgba(255, 255, 255, 0.4)',
        // Accent
        accent: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
        },
        // Status
        'status-success': '#22c55e',
        'status-warning': '#f59e0b',
        'status-error': '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'glass': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 24px rgba(0, 0, 0, 0.4)',
        'glass-sm': '0 0 0 1px rgba(255, 255, 255, 0.04), 0 2px 12px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-up': 'fadeUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

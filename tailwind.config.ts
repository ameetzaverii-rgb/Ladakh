import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sand: '#e8d9bc',
        rust: '#b85c38',
        gold: '#c9993a',
        deep: '#1a1208',
        stone: '#8b7355',
        sky: '#5a8fa3',
        sage: '#6b7c5e',
        cream: '#f5ede0',
        dark: '#0f0b06',
        muted: '#9a8870',
        border: 'rgba(201,153,58,0.15)',
        background: '#0f0b06',
        foreground: '#e8d9bc',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        mono: ['Space Mono', 'monospace'],
        sans: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config

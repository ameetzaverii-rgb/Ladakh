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
        /* ── Legacy token names, remapped to the light "Prayer Flag" palette.
              Keeping the names means every existing page shifts to light at once. ── */
        sand: '#2a3140',    // primary body text (ink)
        cream: '#14181f',   // headings (near-black ink)
        muted: '#8c92a0',   // faint text
        stone: '#6b7280',   // labels / secondary text
        gold: '#b07a16',    // warm amber accent (was the desert gold)
        rust: '#c0402f',    // red accent / danger (culture)
        sky: '#2f6db5',     // blue (plan / logistics)
        sage: '#3e9e6e',    // green (treks / nature)
        deep: '#ffffff',    // raised surface (cards)
        dark: '#fbfaf7',    // page background (warm paper)
        border: '#e8e3d8',
        background: '#fbfaf7',
        foreground: '#2a3140',

        /* ── Tibetan prayer-flag colour system (use directly for category coding) ── */
        flag: {
          blue: '#2f6db5',
          red: '#d24b3e',
          green: '#3e9e6e',
          yellow: '#e0a21b',
          ink: '#3a4150',
        },
        tint: {
          blue: '#e7f0fa',
          red: '#fbe9e7',
          green: '#e7f4ee',
          yellow: '#fbf0d8',
          ink: '#eceef2',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        display: ['Marcellus', 'serif'],
        mono: ['Space Mono', 'monospace'],
        sans: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,24,31,0.04), 0 4px 16px rgba(20,24,31,0.06)',
        lift: '0 2px 4px rgba(20,24,31,0.06), 0 8px 28px rgba(20,24,31,0.10)',
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

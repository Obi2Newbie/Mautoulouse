import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT: '#1B3D5F', dark: '#0E2640', light: '#2C5F8A' },
        coral: { DEFAULT: '#E05C3A', light: '#FEF0EB', hover: '#C94D2E' },
        gold:  { DEFAULT: '#F4A323', light: '#FEF6E7' },
        teal:  { DEFAULT: '#09A572', light: '#E8FAF3' },
        sand:  '#F8F5F0',
        sidebar: '#0E1827',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body:    ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.07)',
        lg:   '0 8px 40px rgba(0,0,0,0.12)',
        xl:   '0 24px 64px rgba(0,0,0,0.18)',
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
}
export default config

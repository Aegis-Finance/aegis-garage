/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#f5f5f7',
          surface: '#ffffff',
          border: '#d2d2d7',
          text: '#1d1d1f',
          'text-dim': '#6e6e73',
          accent: '#007aff',
          'accent-dim': '#0051d5',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: ['Orbitron', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        aegis: '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#1d1d1f',
            a: {
              color: '#007aff',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

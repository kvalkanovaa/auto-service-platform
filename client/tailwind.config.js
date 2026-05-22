/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,scss}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a5f',
          dark: '#152a4a',
        },
        accent: {
          DEFAULT: '#f97316',
          dark: '#ea6b0a',
        },
        surface: '#ffffff',
        'app-bg': '#f8fafc',
        border: '#e2e8f0',
        muted: '#64748b',
        subtle: '#94a3b8',
      },
      borderRadius: {
        card: '1rem',
        btn: '0.625rem',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
        btn: '0 2px 8px rgba(249,115,22,0.35)',
      },
    },
  },
  plugins: [],
};

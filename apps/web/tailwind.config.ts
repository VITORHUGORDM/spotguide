import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // O tema antigo era roxo/índigo neon; agora os mesmos nomes apontam para o pôr do sol
        purple: {
          200: '#ffe3c8',
          300: '#ffcf9f',
          400: '#f5a962',
          500: '#ef8a4f',
          600: '#e0574f',
          700: '#b94452',
          800: '#7e3a6a',
          900: '#3b2a78',
        },
        indigo: {
          300: '#ffb8b0',
          400: '#f08a86',
          500: '#e0697a',
          600: '#d9697a',
          700: '#a8506f',
          900: '#3b2a78',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
};

export default config;

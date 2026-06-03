// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Nama key di sini akan menjadi nama class Tailwind
        'eight-heavy': ['var(--font-eight-heavy)'],
        'nohemi': ['var(--font-nohemi)'],
      },
    },
  },
  plugins: [],
};

export default config;
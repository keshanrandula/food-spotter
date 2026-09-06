import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fcf8f2",
        foreground: "#1c1917",
        savor: {
          50: '#fffcf7',
          100: '#fbf5ee',
          200: '#f6e9da',
          300: '#edd5be',
          500: '#d9682f',
          600: '#c84b17',
          700: '#a3380e',
          900: '#1c130d',
        },
        warm: {
          50: '#fdfbf7',
          100: '#f9f4ec',
          200: '#f3e8da',
          300: '#e5d3bd',
          800: '#443427',
          900: '#2b2118',
        }
      },
      boxShadow: {
        'savor': '0 12px 35px -8px rgba(160, 60, 20, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'savor-hover': '0 20px 45px -10px rgba(160, 60, 20, 0.14), 0 8px 20px -4px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};
export default config;

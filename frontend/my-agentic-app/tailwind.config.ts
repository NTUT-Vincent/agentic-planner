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
        background: "var(--background)",
        foreground: "var(--foreground)",
        mabel: {
          '50': '#effafc',
          '100': '#d0eff5',
          '200': '#b3e3ee',
          '300': '#7fcee1',
          '400': '#43b0cd',
          '500': '#2793b3',
          '600': '#237797',
          '700': '#23617b',
          '800': '#255165',
          '900': '#224457',
          '950': '#122c3a',
        },
      },
    },
  },
  plugins: [],
};
export default config;

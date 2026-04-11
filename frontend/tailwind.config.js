/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Stitch "Website Refresh" Palette ---
        "background": "#030e22",
        "surface": "#030e22",
        "surface-dim": "#030e22",
        "surface-bright": "#1a2c4b",
        "surface-container": "#0a1932",
        "surface-container-low": "#061329",
        "surface-container-high": "#101f3a",
        "surface-container-highest": "#152543",
        "surface-container-lowest": "#000000",
        "surface-variant": "#152543",
        "surface-tint": "#ffa84f",

        "primary": "#ffa84f",
        "primary-container": "#fe9400",
        "primary-dim": "#ea8900",
        "primary-fixed": "#fe9400",
        "primary-fixed-dim": "#ea8900",
        "on-primary": "#562f00",
        "on-primary-container": "#482600",
        "on-primary-fixed": "#231000",
        "on-primary-fixed-variant": "#542e00",
        "inverse-primary": "#8d5000",

        "secondary": "#3fff8b",
        "secondary-container": "#006d35",
        "secondary-dim": "#24f07e",
        "secondary-fixed": "#3fff8b",
        "secondary-fixed-dim": "#24f07e",
        "on-secondary": "#005d2c",
        "on-secondary-container": "#e3ffe4",
        "on-secondary-fixed": "#004820",
        "on-secondary-fixed-variant": "#006832",

        "tertiary": "#44a5ff",
        "tertiary-container": "#2498f5",
        "tertiary-dim": "#3aa2ff",
        "tertiary-fixed": "#70b5ff",
        "tertiary-fixed-dim": "#4ca8ff",
        "on-tertiary": "#002442",
        "on-tertiary-container": "#001429",
        "on-tertiary-fixed": "#001930",
        "on-tertiary-fixed-variant": "#003b67",

        "error": "#ff716c",
        "error-container": "#9f0519",
        "error-dim": "#d7383b",
        "on-error": "#490006",
        "on-error-container": "#ffa8a3",

        "on-background": "#dce5ff",
        "on-surface": "#dce5ff",
        "on-surface-variant": "#a0abc6",
        "outline": "#6b758e",
        "outline-variant": "#3d485f",
        "inverse-surface": "#f9f9ff",
        "inverse-on-surface": "#4a556c",

        "muted": "#94a3b8",
        "muted-dark": "#64748b",
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Space Grotesk", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
}

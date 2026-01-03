/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ["iransansdn", "tahoma", "sans-serif"],
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.7s ease-out",
        "pixel-shift": "pixel-shift 0.2s steps(2) infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "neon-blue": "neon-pulse-blue 1.5s ease-in-out infinite",
        "neon-red": "neon-pulse-red 1.5s ease-in-out infinite",
        "neon-green": "neon-pulse-green 1.5s ease-in-out infinite",
        "neon-purple": "neon-pulse-purple 1.5s ease-in-out infinite",
        "neon-yellow": "neon-pulse-yellow 1.5s ease-in-out infinite",
        "hover-bounce": "hover-bounce 2s ease-in-out infinite",
        "text-flicker": "text-flicker 1.5s linear infinite",
        "terminal-blink": "terminal-blink 1s steps(2) infinite",
      },
    },
  },
  plugins: [],
};

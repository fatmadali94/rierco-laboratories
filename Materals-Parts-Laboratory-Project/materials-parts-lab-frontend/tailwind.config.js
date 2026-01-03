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
      colors: {
        // Your custom color names
        darkOrange: "#F97028",
        orange: "#F3A20F",
        bg: "#f3ecd2",
        pink: "#f489a3",
        yellow: "#f0bb0d",
        black: "#121212",
        white: "#fffefb",
      },
      textShadow: {
        "triple-stroke": `
          -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 2px 2px 0 white,
          -2px 0 0 white, 2px 0 0 white, 0 -2px 0 white, 0 2px 0 white,
          -4px -4px 0 black, 4px -4px 0 black, -4px 4px 0 black, 4px 4px 0 black,
          -4px 0 0 black, 4px 0 0 black, 0 -4px 0 black, 0 4px 0 black
        `,
      },
      // cursor: {
      //   'big-default': `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="1"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>') 12 12, auto`,
      //   'big-pointer': `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="1"><path d="M10 6v8h4V6h2l-4-4-4 4h2zm8 8v6H6v-6H4v8h16v-8h-2z"/><path d="M13 2L9 6h2v8h4V6h2l-4-4z"/></svg>') 24 24, pointer`,
      // }
      keyframes: {
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-10px)" },
        },
      },

      animation: {
        slideDown: "slideDown 0.3s ease-out",
        slideUp: "slideUp 0.3s ease-out",
      },
    },
  },
  plugins: [
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") }
      );
    },
  ],
};

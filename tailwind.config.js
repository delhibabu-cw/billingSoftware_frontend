/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        Montserrat: ["Montserrat", "sans-serif"],
        OpenSans: ["Open Sans", "sans-serif"],
        Poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        // primaryColor: "#FFFF00",
        primaryColor: "#8DFF00",
        primaryColorHover: "#90Fc03",
        secondaryColor: "#1D7847",
        visionColor: "#EEF8FD",
        missionColor: " #D6E9F3",
        newsColor: "#0E7CB7",
      },
      backgroundImage: {
        instagram:
          "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-1": "linear-gradient(102deg,transparent 41%,primary/50 0)",
        "gradient-1": "linear-gradient(102deg,light 41%,transparent 0)",
        // formbg
        formBgTop:
          "url('../src/assets/images/clientArea/loginModal/leftBg.png')",
        formBgTop:
          "url('../src/assets/images/clientArea/loginModal/leftBg.png')",
      },
      animation: {
        typingLine1:
          "typing 2s steps(12, end), cursor 0.5s steps(12, end) infinite",
        typingLine2: "typing 2s steps(12, end) 2s forwards",
        typingLine3: "typing 2s steps(12, end) 4s forwards",
        slideRight: "slideRight 1s ease-out forwards",
        slideLeft: "slideLeft 1s ease-out forwards",
        slideBar: "slideBar 1s ease-in-out",
        slideInRight: "slideInRight 3s ease-out forwards",
        slideDown: "slideDown 0.5s ease-out forwards infinite",
        loopCards: "loopCards 1s infinite alternate",
        slideBottomToTop: "slideBottomToTop 1s ease-out forwards",
        slideInFast: "slideIn .6s ease-out forwards",
        slideLeftFast: "slideLeftFast .6s ease-out forwards",
        borderSpin: "borderSpin 3s linear infinite",
        titleFromTopLeft: "titleFromTopLeft 5s ease-out forwards",
      },
      keyframes: {
        typing: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        borderSpin: {
          "0%": {
            "--border-angle": "0turn",
          },
          "100%": {
            "--border-angle": "1turn",
          },
        },
        cursor: {
          "50%": { borderColor: "transparent" },
          "100%": { borderColor: "#7E2EA0" },
        },
        slideLeft: {
          "0%": { opacity: 0, transform: "translateX(100px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        slideRight: {
          "0%": { opacity: 0, transform: "translateX(-100px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        slideBar: {
          "0%": { transform: "translateX(-100%)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        slideInRight: {
          "0%": { transform: "translateX(-100%)", opacity: 0 },
          "100%": { transform: "translateX(0)", opacity: 1 },
        },
        slideDown: {
          "0%": { maxHeight: "0", opacity: 0 },
          "100%": { maxHeight: "100px", opacity: 1 },
        },
        slideIn: {
          "0%": { opacity: 0, transform: "translateY(-50px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        slideLeftFast: {
          "0%": { opacity: 0, transform: "translateX(50px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        loopCards: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(20px)" },
        },
        slideBottomToTop: {
          "0%": { transform: "translateY(30px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        cardAnimation: {
          "0%": { transform: "translateY(30px) scale(0.95)", opacity: 0 },
          "100%": { transform: "translateY(0) scale(1)", opacity: 1 },
        },
        titleFromTopLeft: {
          "0%": {
            transform: "translateY(-100%)",
            opacity: 0,
          },
          "100%": {
            transform: "translateY(0)",
            opacity: 1,
          },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents, addBase, addUtilities }) {
      addComponents({
        ".dirrtl": {
          direction: "ltr",
        },
        ".dir-rtl": {
          direction: "rtl",
        },
        ".dir-ltr": {
          direction: "ltr",
        },
        ".h1": { fontSize: "2.5rem" },
        ".h2": { fontSize: "2rem" },
        ".h3": { fontSize: "1.75rem" },
        ".h4": { fontSize: "1.5rem" },
        ".h5": { fontSize: "1.25rem" },
        ".h6": { fontSize: "1rem" },
      });
      addBase({
        h1: { fontSize: "2.5rem" },
        h2: { fontSize: "2rem" },
        h3: { fontSize: "1.75rem" },
        h4: { fontSize: "1.5rem" },
        h5: { fontSize: "1.25rem" },
        h6: { fontSize: "1rem" },
      });
      addUtilities({
        ".hide-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
        ".hide-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
        /* Custom Text Outline Utilities */
        ".text-outline-black": {
          "-webkit-text-stroke": "2px black",
          "-webkit-text-fill-color": "white", // Inner color
        },
        ".text-outline-white": {
          "-webkit-text-stroke": "1px #ffffff61",
          "-webkit-text-fill-color": "black", // Inner color
        },
        ".text-outline-red": {
          "-webkit-text-stroke": "2px red",
          "-webkit-text-fill-color": "white", // Inner color
        },
        '.shadow-custom-light': {
    'box-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  '.shadow-custom-medium': {
    'box-shadow': '0 6px 12px rgba(0, 0, 0, 0.15)',
  },
  '.shadow-custom-dark': {
    'box-shadow': '0 8px 16px rgba(0, 0, 0, 0.25)',
  },
  /* White Box Shadow */
  '.shadow-white': {
    'box-shadow': '0 0 10px rgba(255, 255, 255, 0.5)',
  },
  '.shadow-white-md': {
    'box-shadow': '0 0 10px rgba(255, 255, 255, 0.8)',
  },
  '.shadow-white-lg': {
    'box-shadow': '0 0 20px rgba(255, 255, 255, 0.9)',
  },
  '.shadow-white-xl': {
    'box-shadow': '0 0 30px rgba(255, 255, 255, 1)',
  },
  /* Custom Drop Shadow Utilities */
  '.drop-shadow-custom-light': {
    'filter': 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
  },
  '.drop-shadow-custom-medium': {
    'filter': 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))',
  },
  '.drop-shadow-custom-dark': {
    'filter': 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25))',
  },
  '.drop-shadow-white': {
    'filter': 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))',
  },
  '.datepicker-white': {
    '&::-webkit-calendar-picker-indicator': {
      filter: 'invert(1)', // White color
    },
  },
  '.datepicker-black': {
    '&::-webkit-calendar-picker-indicator': {
      filter: 'invert(0)', // Black color (default)
    },
  },
  '.datepicker-blue': {
    '&::-webkit-calendar-picker-indicator': {
      filter: 'invert(29%) sepia(95%) saturate(749%) hue-rotate(196deg) brightness(91%) contrast(95%)',
    },
  },
      });
    }),
  ],
};


// drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]
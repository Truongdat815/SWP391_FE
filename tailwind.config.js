// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vin: {
          primary: '#003459',
          accent: '#00A7E1',
          red: '#E10600',
          dark: '#0B1220',
        }
      },
      fontFamily: {
        vinfast: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif'
        ]
      },
      boxShadow: {
        header: '0 8px 30px rgba(0,0,0,0.06)'
      }
    },
  },
  plugins: [],
}



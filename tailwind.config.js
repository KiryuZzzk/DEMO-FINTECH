/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        night: {
          DEFAULT: '#07060C',  // negro índigo profundo
          mid:     '#0E0C18',  // índigo oscuro — secciones alternas
          lift:    '#151228',  // índigo noche — secciones elevadas
          card:    '#1E1A38',  // tarjetas sobre índigo noche
        },
        platinum: {
          DEFAULT: '#B8C2D0',  // plata fría — acento principal
          light:   '#CDD6E4',  // plata clara
          pale:    '#E2E8F2',  // plata pálida
          dim:     '#627080',  // plata apagada
        },
        sand: {
          DEFAULT: '#EEE9E0',  // blanco cálido — texto principal
          dim:     '#8A8880',  // texto secundario
          faint:   '#4A4845',  // texto muy sutil
        },
      },
    },
  },
  plugins: [],
}

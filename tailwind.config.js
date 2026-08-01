/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#12213A',
        steel: '#16283B',
        steel2: '#1D3348',
        fog: '#EEF0EA',
        paper: '#FFFFFF',
        charcoal: '#232A31',
        navy: '#1B2A4A',
        navyLight: '#2E4470',
        brass: '#C08A3E',
        brassLight: '#E0AE63',
        rust: '#B3452C',
        moss: '#3F7856',
        slateline: '#5B6570',
        hairline: '#E6E8EB',
      },
      fontFamily: {
        display: ['var(--font-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-plex)', 'monospace'],
      },
      letterSpacing: {
        wideish: '0.04em',
      },
    },
  },
  plugins: [],
};

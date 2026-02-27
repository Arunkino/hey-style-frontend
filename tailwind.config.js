/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#8E6EE8',
                secondary: '#E3DEFF',
                dark: '#000000',
                light: '#FFFFFF',
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            animation: {
                'spin-slow': 'spin 8s linear infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { opacity: '0.4' },
                    '50%': { opacity: '0.8' },
                },
            },
        },
    },
    plugins: [],
}

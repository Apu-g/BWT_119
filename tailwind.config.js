/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                neuravex: {
                    bg: '#fffbf5',        // Soft cream/beige background
                    surface: '#faebd7',   // Deeper peach tone for cards/surfaces
                    card: '#ffe4c4',      // Soft bisque tone for nested elements
                    border: '#000000',    // Keep black borders for the neo-brutalist style
                    accent: '#000000',    // Black accent (Primary)
                    'accent-light': '#374151', // Dark gray accent (Secondary)
                    pink: '#ff4757',      // Keep red for critical/error states
                    text: '#000000',      // Black text
                    muted: '#6b7280',     // Muted gray
                },
            },
            boxShadow: {
                // Hard neo-brutalist shadows with black tones
                'neo': '4px 4px 0 var(--tw-shadow-color, #000000)',
                'neo-sm': '2px 2px 0 var(--tw-shadow-color, #000000)',
                'neo-lg': '8px 8px 0 var(--tw-shadow-color, #000000)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'fade-in': 'fadeIn 0.4s ease-out',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
        fontSize: {
            'fluid-xs': 'clamp(0.6rem, 1vw + 0.5rem, 0.75rem)',
            'fluid-sm': 'clamp(0.75rem, 1.5vw + 0.5rem, 0.875rem)',
            'fluid-base': 'clamp(0.875rem, 2vw + 0.5rem, 1rem)',
            'fluid-lg': 'clamp(1rem, 2.5vw + 0.5rem, 1.125rem)',
            'fluid-xl': 'clamp(1.125rem, 3vw + 0.5rem, 1.25rem)',
            'fluid-2xl': 'clamp(1.25rem, 4vw + 0.5rem, 1.5rem)',
            'fluid-3xl': 'clamp(1.5rem, 5vw + 0.5rem, 1.875rem)',
            'fluid-4xl': 'clamp(1.875rem, 6vw + 0.5rem, 2.25rem)',
            'fluid-5xl': 'clamp(2.25rem, 8vw + 0.5rem, 3rem)',
            'fluid-6xl': 'clamp(2.5rem, 10vw + 0.5rem, 3.75rem)',
        }
    },
    plugins: [],
}

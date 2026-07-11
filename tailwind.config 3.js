/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  important: true,
  theme: {
    extend: {
      fontFamily: {
        sans: ['ATT Aleck Sans', 'Inter var', 'system-ui', 'sans-serif'],
      },
      colors: {
        // AT&T Flywheel Design System - Light Mode Colors
        fw: {
          // Base Colors
          'att-blue': 'rgb(0 159 219)', // Primary brand
          'functional-blue': 'rgb(0 116 179)', // Interactive elements

          // AT&T Blue variants
          blue: {
            DEFAULT: 'rgb(0 159 219)',
            '000': 'rgb(0 171 235)', // Lighter
            '100': 'rgb(102 200 240)', // Even lighter
            '200': 'rgb(153 218 245)', // Very light
            light: 'rgb(230 246 253)', // Background tint
            functional: 'rgb(0 116 179)',
          },

          // Cobalt variants
          cobalt: {
            '100': 'rgb(230 240 250)', // Very light
            '400': 'rgb(51 116 204)',
            '600': 'rgb(0 87 184)', // Hover states
            '700': 'rgb(0 56 143)', // Primary CTAs
            '800': 'rgb(0 35 90)', // Dark mode
          },

          // Flywheel Gray Scale
          gray: {
            '100': 'rgb(248 250 251)', // Lightest backgrounds
            '200': 'rgb(243 244 246)', // Subtle backgrounds
            '300': 'rgb(220 223 227)', // Borders, dividers
            '400': 'rgb(189 194 199)', // Disabled states
            '500': 'rgb(135 140 148)', // Muted elements
            '600': 'rgb(104 110 116)', // Secondary text
            '700': 'rgb(69 75 82)', // Body text
            '800': 'rgb(29 35 41)', // Dark text
            '900': 'rgb(19 23 27)', // Headings
          },

          // Semantic Colors
          green: {
            '400': 'rgb(74 175 66)',
            '600': 'rgb(45 126 36)', // Success
          },
          orange: {
            '400': 'rgb(255 143 77)',
            '600': 'rgb(234 113 47)', // Warning
          },
          red: {
            '400': 'rgb(255 92 115)',
            '600': 'rgb(199 0 50)', // Error
          },
        },
        // Legacy colors for gradual migration
        gray: {
          50: 'rgb(248 250 251)',
          100: 'rgb(243 244 246)',
          200: 'rgb(220 223 227)',
          300: 'rgb(220 223 227)',
          400: 'rgb(189 194 199)',
          500: 'rgb(135 140 148)',
          600: 'rgb(104 110 116)',
          700: 'rgb(69 75 82)',
          800: 'rgb(29 35 41)',
          900: 'rgb(19 23 27)',
        },
        brand: {
          blue: 'rgb(0 56 143)', // Cobalt 700 for CTAs
          lightBlue: 'rgb(230 246 253)',
          darkBlue: 'rgb(0 56 143)',
          accent: 'rgb(0 159 219)', // AT&T Blue
          neutral: 'rgb(104 110 116)',
        },
        complementary: {
          teal: '#00A3A6',
          orange: 'rgb(234 113 47)', // Flywheel Orange
          amber: '#F59E0B',
          green: 'rgb(45 126 36)', // Flywheel Green
          purple: '#6B5B95',
        }
      },
      textColor: {
        // Flywheel Text Tokens
        'fw-heading': 'rgb(19 23 27)', // Gray 900
        'fw-body': 'rgb(69 75 82)', // Gray 700
        'fw-bodyLight': 'rgb(104 110 116)', // Gray 600
        'fw-disabled': 'rgb(135 140 148)', // Gray 500
        'fw-legal': 'rgb(104 110 116)', // Gray 600
        'fw-link': 'rgb(0 116 179)', // Functional Blue
        'fw-linkHover': 'rgb(0 87 184)', // Cobalt 600
        'fw-linkPrimary': 'rgb(255 255 255)', // White
        'fw-linkSecondary': 'rgb(0 56 143)', // Cobalt 700
        'fw-success': 'rgb(45 126 36)', // Green 600
        'fw-warn': 'rgb(234 113 47)', // Orange 600
        'fw-error': 'rgb(199 0 50)', // Red 600
        'fw-info': 'rgb(0 116 179)', // Functional Blue
      },
      backgroundColor: {
        // Flywheel Background Tokens
        'fw-base': 'rgb(255 255 255)', // White
        'fw-wash': 'rgb(248 250 251)', // Gray 100
        'fw-neutral': 'rgb(243 244 246)', // Gray 200
        'fw-accent': 'rgb(230 246 253)', // AT&T Blue 000 - very light
        'fw-primary': 'rgb(0 56 143)', // Cobalt 700
        'fw-ctaPrimary': 'rgb(0 56 143)', // Cobalt 700
        'fw-ctaPrimaryHover': 'rgb(0 87 184)', // Cobalt 600
        'fw-ctaGhost': 'rgb(230 240 250)', // Cobalt 100
        'fw-disabled': 'rgb(220 223 227)', // Gray 300
        'fw-success': 'rgb(45 126 36)', // Green 600
        'fw-warn': 'rgb(234 113 47)', // Orange 600
        'fw-error': 'rgb(199 0 50)', // Red 600
      },
      borderColor: {
        // Flywheel Border Tokens
        'fw-primary': 'rgb(104 110 116)', // Gray 600
        'fw-secondary': 'rgb(220 223 227)', // Gray 300
        'fw-active': 'rgb(0 116 179)', // Functional Blue
        'fw-hover': 'rgb(0 116 179)', // Functional Blue
        'fw-focus': 'rgb(29 35 41)', // Gray 800
        'fw-disabled': 'rgb(220 223 227)', // Gray 300
        'fw-success': 'rgb(45 126 36)', // Green 600
        'fw-warn': 'rgb(234 113 47)', // Orange 600
        'fw-error': 'rgb(199 0 50)', // Red 600
        'fw-ctaPrimary': 'rgb(0 56 143)', // Cobalt 700
      },
      ringColor: {
        // Flywheel Focus Ring Tokens
        'fw-active': 'rgb(0 116 179)', // Functional Blue
      },
      borderRadius: {
        'full': '9999px',
        'lg': '0.5rem',
        'md': '0.375rem',
        'xl': '0.75rem',
        '2xl': '1rem'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography'),
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Content purging is handled automatically in Tailwind CSS v3+
};
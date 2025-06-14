import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// League of Legends inspired color palette
				lol: {
					blue: '#3C89E8',
					'blue-dark': '#1E3A8A',
					'blue-light': '#60A5FA',
					gold: '#C8AA6E',
					'gold-dark': '#A16207',
					'gold-light': '#FDE047',
					'gray-900': '#0A0E13',
					'gray-800': '#1E2328',
					'gray-700': '#3C3C41',
					'gray-600': '#5BC0DE',
					black: '#010A13',
					white: '#F0E6D2'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'pulse-blue': {
					'0%, 100%': {
						boxShadow: '0 0 0 0 rgba(60, 137, 232, 0.7)'
					},
					'70%': {
						boxShadow: '0 0 0 10px rgba(60, 137, 232, 0)'
					}
				},
				'glow': {
					'0%, 100%': {
						boxShadow: '0 0 20px rgba(200, 170, 110, 0.5)'
					},
					'50%': {
						boxShadow: '0 0 30px rgba(200, 170, 110, 0.8)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'pulse-blue': 'pulse-blue 2s infinite',
				'glow': 'glow 2s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-lol': 'linear-gradient(135deg, #0A0E13 0%, #1E2328 100%)',
				'gradient-blue': 'linear-gradient(135deg, #3C89E8 0%, #1E3A8A 100%)',
				'gradient-gold': 'linear-gradient(135deg, #C8AA6E 0%, #A16207 100%)'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;

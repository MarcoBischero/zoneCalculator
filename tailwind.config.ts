import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ['selector', '[class*="dark"], [class*="midnight-pro"], [class*="tokyo-nights"]'],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			border: 'hsl(var(--border) / <alpha-value>)',
			input: 'hsl(var(--input) / <alpha-value>)',
			ring: 'hsl(var(--ring) / <alpha-value>)',
			background: 'hsl(var(--background) / <alpha-value>)',
			foreground: 'hsl(var(--foreground) / <alpha-value>)',
			primary: {
				DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
				foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
			},
			secondary: {
				DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
				foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
			},
			destructive: {
				DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
				foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
			},
			muted: {
				DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
				foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
			},
			accent: {
				DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
				foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
			},
			popover: {
				DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
				foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
			},
			card: {
				DEFAULT: 'hsl(var(--card) / <alpha-value>)',
				foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
			},
			// NEW ZONE RED
			zone: {
				red: {
					DEFAULT: 'hsl(var(--zone-red) / <alpha-value>)',
					foreground: 'hsl(var(--zone-red-foreground) / <alpha-value>)'
				},
				DEFAULT: 'hsl(var(--zone-red) / <alpha-value>)', // Alias for zone-red
			},
			protein: 'hsl(var(--macro-protein) / <alpha-value>)',
			carb: 'hsl(var(--macro-carb) / <alpha-value>)',
			fat: 'hsl(var(--macro-fat) / <alpha-value>)',
			gradientColorStops: {
				'primary-start': 'hsl(var(--primary))',
				'primary-end': 'hsl(var(--secondary))',
			},
			boxShadow: {
				glass: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
				'glow-sm': '0 0 10px hsl(var(--primary) / 0.3)',
				'glow-md': '0 0 20px hsl(var(--primary) / 0.5)',
				'glow-lg': '0 0 30px hsl(var(--primary) / 0.7)',
				'premium-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
				'premium-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
				'premium-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
			},
			animation: {
				gradient: 'gradient 3s ease infinite',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				shimmer: 'shimmer 2s linear infinite',
				'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'scale-in': 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
			},
			keyframes: {
				gradient: {
					'0%, 100%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					}
				},
				'glow-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 10px hsl(var(--primary) / 0.5)'
					},
					'50%': {
						boxShadow: '0 0 20px hsl(var(--primary) / 0.8)'
					}
				},
				shimmer: {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				},
				fadeUp: {
					'0%': { opacity: '0', transform: 'translateY(15px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				scaleUp: {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				brand: { // Alias for easy semantic access
					red: 'hsl(var(--zone-red))'
				}
			}
		},
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)'
		}
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;

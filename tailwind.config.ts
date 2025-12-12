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
			protein: 'hsl(var(--macro-protein) / <alpha-value>)',
			carb: 'hsl(var(--macro-carb) / <alpha-value>)',
			fat: 'hsl(var(--macro-fat) / <alpha-value>)',
			zone: {
				blue: {
					'50': '#f0f9ff',
					'100': '#e0f2fe',
					'400': '#38bdf8',
					'500': '#0ea5e9',
					'600': '#0284c7',
					'700': '#0369a1',
					'900': '#0c4a6e'
				},
				orange: {
					'500': '#f97316',
					'600': '#ea580c'
				}
			},
			gradientColorStops: {
				'primary-start': 'hsl(var(--primary))',
				'primary-end': 'hsl(var(--secondary))',
				'tokyo-cyan': '#00F0FF',
				'tokyo-pink': '#FF006E',
				'tokyo-purple': '#B026FF',
				'tokyo-gold': '#FFD700'
			},
			boxShadow: {
				glass: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
				'glow-sm': '0 0 10px hsl(var(--primary) / 0.3)',
				'glow-md': '0 0 20px hsl(var(--primary) / 0.5)',
				'glow-lg': '0 0 30px hsl(var(--primary) / 0.7)',
				neon: '0 0 10px currentColor, 0 0 20px currentColor'
			},
			animation: {
				gradient: 'gradient 3s ease infinite',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				shimmer: 'shimmer 2s linear infinite'
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
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
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

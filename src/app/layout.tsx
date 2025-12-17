import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { GlobalErrorBoundary } from "@/components/error-boundary";
import { LanguageProvider } from "@/lib/language-context";
import UserIndicator from "@/components/layout/UserIndicator";
import Analytics from "@/components/analytics/Analytics";
import StructuredData from "@/components/seo/StructuredData";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "ZoneCalculator PRO | La Dieta a Zona Automatica con AI",
        template: "%s | ZoneCalculator PRO"
    },
    description: "Il primo calcolatore per la Dieta a Zona con Intelligenza Artificiale. Menù bilanciati in 3 secondi, niente matematica, 100% risultati.",
    metadataBase: new URL('https://zonecalcpro.web.app'),
    keywords: ["Dieta a Zona", "Calcolo Blocchi Zona", "Menu Zona Esempio", "Paleo Diet", "Zone Diet App", "Nutrizionista AI"],
    authors: [{ name: "ZoneCalculator Team" }],
    creator: "ZoneCalculator PRO",
    openGraph: {
        type: "website",
        locale: "it_IT",
        url: "https://zonecalcpro.web.app",
        title: "ZoneCalculator PRO | La Dieta a Zona Automatica",
        description: "Smetti di contare. Inizia a vivere in Zona. L'app che calcola i blocchi e pianifica i tuoi pasti automaticamente.",
        siteName: "ZoneCalculator PRO",
    },
    twitter: {
        card: "summary_large_image",
        title: "ZoneCalculator PRO | AI Zone Diet Coach",
        description: "La Dieta a Zona facile e veloce. Provalo gratis.",
        creator: "@zonecalculatorpro",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <StructuredData />
            </head>
            <body className={inter.className}>
                <Analytics />
                <AuthProvider>
                    <LanguageProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                            themes={["professional-light", "midnight-pro", "tokyo-nights", "zen-garden", "light", "dark"]}
                        >
                            <GlobalErrorBoundary>
                                {children}
                                <UserIndicator />
                            </GlobalErrorBoundary>
                        </ThemeProvider>
                    </LanguageProvider>
                </AuthProvider>
            </body>
        </html>
    )
}

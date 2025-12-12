import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { GlobalErrorBoundary } from "@/components/error-boundary";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { LanguageProvider } from "@/lib/language-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZoneCalculator Pro",
  description: "Advanced Zone Diet Calculator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="professional-light"
              enableSystem
              disableTransitionOnChange
              themes={["professional-light", "midnight-pro", "tokyo-nights", "zen-garden", "light", "dark"]}
            >
              <div className="flex h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto relative h-full">
                  <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                  <GlobalErrorBoundary>
                    {children}
                    <SpeedInsights />
                    <Analytics />
                  </GlobalErrorBoundary>
                </main>
              </div>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
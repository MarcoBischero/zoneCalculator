import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Public Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container px-4 md:px-8 mx-auto h-16 flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                            Z
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
                            ZoneCalculator<span className="text-primary">PRO</span>
                        </span>
                    </div>

                    <nav className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">
                                Accedi
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm" className="hidden sm:flex">
                                Inizia la Prova Gratuita
                            </Button>
                        </Link>
                        <ThemeToggle />
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            {/* Public Footer */}
            <footer className="border-t border-border/40 py-10 bg-muted/30">
                <div className="container mx-auto px-4 text-center md:text-left grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-3">
                        <h4 className="font-bold">ZoneCalculator PRO</h4>
                        <p className="text-sm text-muted-foreground">
                            La tua dieta a zona, semplificata dall'intelligenza artificiale.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-3">Prodotto</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#">Features</Link></li>
                            <li><Link href="#">Pricing</Link></li>
                            <li><Link href="#">Per Nutrizionisti</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-3">Risorse</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#">Blog</Link></li>
                            <li><Link href="#">Calcolatore Blocchi</Link></li>
                            <li><Link href="#">Guida alla Zona</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-3">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#">Privacy Policy</Link></li>
                            <li><Link href="#">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="container mx-auto px-4 mt-10 pt-6 border-t border-border/20 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} ZoneCalculator PRO. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

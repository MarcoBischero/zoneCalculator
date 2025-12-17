'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Star, Zap, Activity, BrainCircuit, ShoppingCart } from "lucide-react";

// ... imports
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/dashboard');
        }
    }, [status, router]);

    if (status === 'loading') return null; // Or a loading spinner

    return (
        <div className="overflow-hidden">
            {/* HERO SECTION */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="container px-4 mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="flex-1 text-center lg:text-left space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                                    Novità 2.0: AI Coach Incluso 🤖
                                </span>
                                <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                                    La Dieta a Zona. <br className="hidden lg:block" />
                                    <span className="text-primary">Finalmente Automatica.</span>
                                </h1>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-xl text-muted-foreground lg:max-w-xl"
                            >
                                Smetti di impazzire con la matematica. L'AI calcola i tuoi blocchi, pianifica i tuoi pasti e ti guida verso il tuo peso forma in 3 secondi netti.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                            >
                                <Link href="/register">
                                    <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8 rounded-full shadow-lg shadow-primary/25">
                                        Inizia la Prova Gratuita <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                                <Link href="/nutritionist">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-12 px-8 rounded-full">
                                        Sei un Nutrizionista?
                                    </Button>
                                </Link>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-sm text-muted-foreground pt-4"
                            >
                                Nessuna carta di credito richiesta. Cancella quando vuoi.
                            </motion.p>
                        </div>

                        <div className="flex-1 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.7 }}
                                className="relative z-10"
                            >
                                {/* App Screenshot / Mockup */}
                                <div className="rounded-2xl border border-border/50 shadow-2xl bg-background/95 backdrop-blur-md overflow-hidden ring-1 ring-border/50">
                                    <div className="aspect-[4/3] bg-muted/20 relative p-4 flex flex-col gap-3">
                                        {/* Mock Header */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="h-2 w-20 bg-muted-foreground/20 rounded-full" />
                                            <div className="flex gap-2">
                                                <div className="h-6 w-6 rounded-full bg-primary/20" />
                                                <div className="h-6 w-6 rounded-full bg-muted-foreground/10" />
                                            </div>
                                        </div>
                                        {/* Mock Content */}
                                        <div className="grid grid-cols-3 gap-3 h-full">
                                            <div className="col-span-2 space-y-3">
                                                <div className="h-24 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10" />
                                                <div className="space-y-2">
                                                    <div className="h-10 rounded-lg bg-background border border-border/50" />
                                                    <div className="h-10 rounded-lg bg-background border border-border/50" />
                                                </div>
                                            </div>
                                            <div className="col-span-1 space-y-3">
                                                <div className="h-full rounded-xl bg-card border border-border/50 p-2 space-y-2">
                                                    <div className="w-8 h-8 rounded-full bg-green-500/20 mx-auto" />
                                                    <div className="h-1 w-full bg-muted-foreground/10 rounded-full" />
                                                    <div className="h-1 w-2/3 bg-muted-foreground/10 rounded-full mx-auto" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Cards */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4 }}
                                    className="absolute -top-10 -right-10 bg-background p-4 rounded-xl shadow-xl border border-border hidden md:block"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Menù Bilanciato</p>
                                            <p className="text-xs text-muted-foreground">3 Blocchi - Perfetto</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Background Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* BENEFITS SECTION */}
            <section className="py-20 bg-muted/30 border-y border-border/50">
                <div className="container px-4 mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Perché ZoneCalculator PRO?</h2>
                        <p className="text-muted-foreground text-lg">
                            Abbiamo risolto l'unico problema della Dieta a Zona: la difficoltà nel calcolo dei blocchi.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Benefit 1 */}
                        <div className="bg-background p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Zero Matematica</h3>
                            <p className="text-muted-foreground">
                                Il calcolatore blocchi automatico fa tutto il lavoro sporco. Inserisci un alimento, l'app calcola il resto per completare il blocco perfetto.
                            </p>
                        </div>

                        {/* Benefit 2 */}
                        <div className="bg-background p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6">
                                <BrainCircuit className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Coach AI 24/7</h3>
                            <p className="text-muted-foreground">
                                Non sai cosa mangiare? Chiedi a ZoneMentor. "Ehi, ho solo tonno e olive, cosa mangio?" Risolto in un attimo.
                            </p>
                        </div>

                        {/* Benefit 3 */}
                        <div className="bg-background p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-6">
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Spesa Intelligente</h3>
                            <p className="text-muted-foreground">
                                Genera la lista della spesa dai tuoi menù settimanali. Niente sprechi, compri solo quello che ti serve per stare in Zona.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SOCIAL PROOF */}
            <section className="py-20">
                <div className="container px-4 mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-16">Chi usa ZoneCalculator?</h2>
                    <div className="text-center mb-12">
                        <span className="inline-block py-1 px-3 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-semibold">
                            Usato da oltre 10.000 Zonisti e 50+ Nutrizionisti Sportivi
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="p-8 bg-muted/20 rounded-2xl border border-border relative">
                            <div className="flex gap-1 mb-4 text-yellow-500">
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                            </div>
                            <p className="text-lg italic mb-6">
                                "Finalmente ho capito come funziona la Zona! Ho perso 4kg in un mese senza impazzire con i calcoli e senza soffrire la fame. L'app si è ripagata da sola."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-muted rounded-full overflow-hidden">
                                    {/* User Avatar Placeholder */}
                                    <div className="w-full h-full bg-gradient-to-tr from-pink-400 to-orange-400"></div>
                                </div>
                                <div>
                                    <p className="font-bold">Marco</p>
                                    <p className="text-sm text-muted-foreground">Utente PRO da 3 mesi</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-muted/20 rounded-2xl border border-border relative">
                            <div className="flex gap-1 mb-4 text-yellow-500">
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                            </div>
                            <p className="text-lg italic mb-6">
                                "Strumento indispensabile per il mio studio. Risparmio 10 ore a settimana nella stesura dei piani pazienti. L'interfaccia è intuitiva."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-muted rounded-full overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-tr from-blue-400 to-cyan-400"></div>
                                </div>
                                <div>
                                    <p className="font-bold">Dr. R. Esposito</p>
                                    <p className="text-sm text-muted-foreground">Nutrizionista Sportivo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="container px-4 mx-auto text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Smetti di Contare.<br />Inizia a Vivere in Zona.</h2>
                    <p className="text-primary-foreground/80 text-xl max-w-2xl mx-auto mb-10">
                        Unisciti a migliaia di persone che hanno migliorato la loro salute con ZoneCalculator PRO.
                    </p>
                    <Link href="/register">
                        <Button variant="secondary" size="lg" className="rounded-full text-xl h-14 px-10 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                            Ottieni il Tuo Piano Ora
                        </Button>
                    </Link>
                    <p className="mt-6 text-sm opacity-70">Garanzia 100% Soddisfatti o Rimborsati.</p>
                </div>
            </section>
        </div>
    );
}

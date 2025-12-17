'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle, Mail, Send, Stethoscope, UserPlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function NutritionistPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSubmitted(true);
        setLoading(false);
    };

    return (
        <>
            {/* Hero Section */}
            <section className="py-20 md:py-32 bg-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                        <Stethoscope className="w-4 h-4" /> Per Professionisti della Nutrizione
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-foreground">
                        Porta il tuo studio <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">nel Futuro</span>.
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Gestisci i tuoi pazienti, crea piani alimentari in secondi e monitora i progressi in tempo reale con la piattaforma ZoneCalculator PRO.
                    </p>

                    {!session ? (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/register">
                                <Button size="lg" className="h-12 px-8 text-lg gap-2 shadow-lg shadow-primary/25">
                                    <UserPlus className="w-5 h-5" /> Registrati come Dietista
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg" className="h-12 px-8 text-lg" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                                Contattaci
                            </Button>
                        </div>
                    ) : (
                        <div className="p-4 bg-card border border-border rounded-xl inline-block shadow-sm">
                            <p className="text-muted-foreground">Sei già registrato come <span className="font-bold text-foreground">{(session.user as any)?.name}</span>.</p>
                            <Link href="/dashboard" className="mt-2 inline-block text-primary hover:underline">
                                Vai alla Dashboard &rarr;
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Gestione Pazienti", desc: "Monitora tutti i tuoi pazienti in un'unica dashboard intuitiva." },
                            { title: "Piani AI", desc: "Genera piani alimentari bilanciati in base ai gusti del paziente con l'AI." },
                            { title: "Monitoraggio Remoto", desc: "Visualizza peso, aderenza e pasti dei tuoi pazienti in tempo reale." }
                        ].map((f, i) => (
                            <div key={i} className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-colors">
                                <h3 className="font-bold text-xl mb-2">{f.title}</h3>
                                <p className="text-muted-foreground">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section id="contact" className="py-20 bg-muted/30">
                <div className="container mx-auto px-4 max-w-xl">
                    <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-8 md:p-10">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold mb-2">Parliamo del tuo Business</h2>
                                <p className="text-muted-foreground">
                                    Compila il form per richiedere una demo o una partnership.
                                </p>
                            </div>

                            {submitted ? (
                                <div className="text-center py-10 animate-in zoom-in duration-300">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-700 mb-2">Richiesta Inviata!</h3>
                                    <p className="text-slate-500">Ti contatteremo entro 24 ore.</p>
                                    <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>Invia un'altra richiesta</Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Nome</label>
                                            <Input
                                                required
                                                placeholder="Mario Rossi"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Telefono</label>
                                            <Input
                                                type="tel"
                                                placeholder="+39 333..."
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Professionale</label>
                                        <Input
                                            required
                                            type="email"
                                            placeholder="studio@esempio.it"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Messaggio</label>
                                        <Textarea
                                            required
                                            placeholder="Vorrei avere maggiori informazioni su..."
                                            className="min-h-[120px]"
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-11 text-base gap-2" disabled={loading}>
                                        {loading ? 'Invio in corso...' : <><Send className="w-4 h-4" /> Invia Richiesta</>}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

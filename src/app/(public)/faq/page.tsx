'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, Stethoscope, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FAQPage() {
    return (
        <div className="container mx-auto px-4 py-16 lg:py-24 max-w-4xl">
            <div className="text-center mb-16 space-y-4">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <HelpCircle className="w-4 h-4" /> Supporto Center
                </span>
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">Domande Frequenti</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Tutto quello che devi sapere su ZoneCalculator PRO, per Pazienti e Professionisti.
                </p>
            </div>

            <Tabs defaultValue="patients" className="space-y-8">
                <div className="flex justify-center">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="patients" className="text-lg py-3">
                            <User className="w-4 h-4 mr-2" /> Pazienti
                        </TabsTrigger>
                        <TabsTrigger value="nutritionist" className="text-lg py-3">
                            <Stethoscope className="w-4 h-4 mr-2" /> Nutrizionisti
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="patients" className="space-y-6 animate-in fade-in-50">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-lg font-medium">Cos'è un "Blocco" nella Dieta a Zona?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                Un blocco è l'unità di misura della Dieta a Zona. Ogni blocco è composto da 7g di proteine, 9g di carboidrati e 1.5g (o 3g) di grassi. L'app calcola automaticamente queste proporzioni per te, quindi non devi preoccuparti della matematica!
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger className="text-lg font-medium">Come faccio a sapere quanti blocchi devo mangiare?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                Il tuo fabbisogno giornaliero viene calcolato automaticamente in base alle tue misure (peso, altezza, circonferenze) e al tuo livello di attività fisica. Puoi aggiornare queste misure nella sezione "Misure" o nel tuo Profilo.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger className="text-lg font-medium">Posso stampare il mio piano settimanale?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                Certamente! Vai nella sezione "Calendario" e clicca sul pulsante "Stampa" in alto a destra. Verrà generata una versione ottimizzata per la stampa del tuo menù settimanale.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger className="text-lg font-medium">L'AI Coach è umano?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                No, il nostro Coach è un'intelligenza artificiale avanzata addestrata sui principi della Dieta a Zona. Può darti consigli immediati su abbinamenti e sostituzioni, ma per questioni mediche specifiche ti consigliamo sempre di rivolgerti al tuo nutrizionista.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </TabsContent>

                <TabsContent value="nutritionist" className="space-y-6 animate-in fade-in-50">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="pro-1">
                            <AccordionTrigger className="text-lg font-medium">Posso gestire più pazienti contemporaneamente?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                Assolutamente sì. La Dashboard Nutrizionista ti permette di avere una visione d'insieme di tutti i tuoi pazienti, i loro progressi, e i piani assegnati. Non c'è un limite rigido al numero di pazienti che puoi seguire con il piano PRO.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="pro-2">
                            <AccordionTrigger className="text-lg font-medium">Come assegno una dieta a un paziente?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                Puoi creare dei "pacchetti" (piani alimentari preimpostati o personalizzati) e assegnarli direttamente dal profilo del paziente. Il paziente vedrà il piano aggiornato in tempo reale sulla sua app.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="pro-3">
                            <AccordionTrigger className="text-lg font-medium">Posso personalizzare il database alimenti?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                Sì, puoi aggiungere alimenti personalizzati o modificare quelli esistenti per i tuoi pazienti. Queste modifiche saranno visibili a tutti i pazienti sotto la tua gestione.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="pro-4">
                            <AccordionTrigger className="text-lg font-medium">Esiste una funzione di monitoraggio remoto?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                Sì, tramite la sezione "Admin > Utenti" puoi vedere l'ultima attività, il peso registrato e l'aderenza al piano dei tuoi pazienti (es. quanti pasti hanno "checkato" come completati).
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </TabsContent>
            </Tabs>

            <div className="mt-20 p-8 rounded-2xl bg-muted/30 border border-border text-center space-y-4">
                <h3 className="text-2xl font-bold">Hai ancora dubbi?</h3>
                <p className="text-muted-foreground">Il nostro team di supporto è sempre disponibile per aiutarti.</p>
                <div className="flex justify-center gap-4">
                    <Link href="/contact">
                        <Button>Contattaci</Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="outline">Torna alla Dashboard</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

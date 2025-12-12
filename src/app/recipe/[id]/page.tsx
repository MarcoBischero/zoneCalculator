'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Share2, Clock, ChefHat, Sparkles, ArrowLeft, Camera, Printer, Scale, CalendarCheck, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { logger } from '@/lib/logger';

export default function RecipePage() {
    const params = useParams();
    const id = params?.id;
    const [meal, setMeal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [autoGenTriggered, setAutoGenTriggered] = useState(false);

    useEffect(() => {
        if (id) {
            fetch(`/api/meals?id=${id}`)
                .then(res => res.json())
                .then(data => {
                    const list = Array.isArray(data) ? data : (data.meals || []);
                    const found = list.find((m: any) => m.codicePasto === parseInt(id as string));
                    if (found) {
                        setMeal(found);
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [id]);

    const handleGenerateAI = useCallback(async () => {
        if (!meal) return;
        setGenerating(true);
        setAutoGenTriggered(true);
        try {
            const res = await fetch('/api/recipe/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mealId: meal.codicePasto, language: 'it' })
            });
            const data = await res.json();
            if (data.success) {
                setMeal((prev: any) => ({ ...prev, description: data.procedure, imgUrl: data.imgUrl }));
            } else {
                logger.warn('AI Gen Failed', { error: data.error });
            }
        } catch (e) {
            logger.error('AI recipe generation failed', e);
        } finally {
            setGenerating(false);
        }
    }, [meal]);

    // Auto-Generate if missing content
    useEffect(() => {
        if (meal && !loading && !meal.description && !meal.imgUrl && !generating && !autoGenTriggered) {
            handleGenerateAI();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meal, loading, generating, autoGenTriggered]);

    // Countdown for UX simulation
    const [seconds, setSeconds] = useState(15);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (generating) {
            setSeconds(15); // Start from 15s
            interval = setInterval(() => {
                setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [generating]);

    if (loading) return <div className="flex justify-center items-center min-h-screen text-slate-500">Caricamento ricetta...</div>;
    if (!meal) return <div className="flex justify-center items-center min-h-screen text-slate-500">Ricetta non trovata.</div>;

    const ingredients = meal.alimenti || [];
    // Split procedure by steps (assuming numbers or newlines)
    const procedureText = meal.description || "";
    // If no AI procedure, fallback to placeholder
    const hasProcedure = !!meal.description;

    // Simple parsing for list items if AI returns a block of text
    const procedureSteps = hasProcedure
        ? procedureText.split(/\d+\.\s+/).filter((s: string) => s.trim().length > 0)
        : [];

    // GENERATING OVERLAY
    if (generating) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4">
                <div className="bg-white/10 p-8 rounded-2xl flex flex-col items-center max-w-sm text-center border border-white/20">
                    <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Creazione Magica in corso...</h2>
                    <p className="text-slate-200 mb-6">Stiamo generando l&apos;immagine e il procedimento per te.</p>

                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${((15 - seconds) / 15) * 100}%` }}
                        ></div>
                    </div>

                    <p className="text-sm font-mono text-slate-300">Tempo stimato: {seconds}s</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative print:bg-white print:p-0 pb-20">
            {/* Header / Infographic Banner - Hidden on print if we want a cleaner print card, but usually we want the title */}

            {/* Navigation - Hidden in Print */}
            <div className="print:hidden bg-slate-900 text-white p-4 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <Link href="/meals">
                        <Button variant="ghost" className="text-slate-300 hover:text-white pl-0">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Torna ai Pasti
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Button onClick={() => window.print()} className="bg-zone-blue-600 hover:bg-zone-blue-700 text-white">
                            <Printer className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Stampa</span>Card
                        </Button>
                    </div>
                </div>
            </div>

            {/* MAIN RECIPE CARD - The Printable Area */}
            <div className="w-full max-w-[210mm] mx-auto bg-white shadow-xl my-4 md:my-8 print:shadow-none print:my-0 print:w-full min-h-[297mm] relative overflow-hidden rounded-xl md:rounded-NONE transition-all">
                {/* Decorative border/holes for binder - HIDDEN ON MOBILE */}
                <div className="hidden md:flex absolute left-0 top-0 bottom-0 w-8 bg-slate-100 border-r border-slate-200 flex-col justify-center gap-24 items-center print:bg-transparent print:border-none print:flex">
                    <div className="w-4 h-4 rounded-full bg-slate-300 print:border print:border-slate-300 print:bg-transparent"></div>
                    <div className="w-4 h-4 rounded-full bg-slate-300 print:border print:border-slate-300 print:bg-transparent"></div>
                    <div className="w-4 h-4 rounded-full bg-slate-300 print:border print:border-slate-300 print:bg-transparent"></div>
                </div>

                <div className="p-6 md:pl-16 md:pr-12 md:py-12 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-4 border-zone-blue-600 pb-6 mb-8">
                        <div>
                            <div className="inline-flex items-center space-x-2 text-zone-blue-600 font-bold uppercase tracking-wider text-[10px] md:text-xs mb-2">
                                <Sparkles className="w-3 h-3" />
                                <span>Ricetta Ufficiale Zona</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-serif font-black text-slate-900 leading-tight mb-2">
                                {meal.nome}
                            </h1>
                            <div className="flex gap-4 md:gap-6 text-slate-500 text-xs md:text-sm font-medium">
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 15 min</span>
                                <span className="flex items-center gap-1"><ChefHat className="w-4 h-4" /> Facile</span>
                                <span className="flex items-center gap-1"><Scale className="w-4 h-4" /> Bilanciato</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-zone-orange-500 rounded-full flex flex-col items-center justify-center text-white shadow-lg print:shadow-none print:text-black print:border-2 print:border-black print:bg-transparent">
                                <span className="text-2xl md:text-3xl font-black leading-none">{meal.blocks}</span>
                                <span className="text-[10px] md:text-xs font-bold uppercase">Blocchi</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 flex-1">
                        {/* Left Column: Ingredients */}
                        <div className="order-2 md:order-1">
                            <h3 className="font-bold text-xl text-slate-900 mb-6 uppercase tracking-wider border-b border-slate-200 pb-2">
                                Ingredienti
                            </h3>
                            <ul className="space-y-4">
                                {ingredients.map((item: any, i: number) => (
                                    <li key={i} className="flex justify-between items-baseline group text-sm md:text-base">
                                        <span className="font-medium text-slate-700 group-hover:text-zone-blue-600 transition-colors">{item.alimento.nome}</span>
                                        <div className="flex-1 mx-4 border-b border-dotted border-slate-300 relative top-[-4px]"></div>
                                        <span className="font-bold text-slate-900">{item.grAlimento}g</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8 md:mt-12 bg-slate-50 p-6 rounded-xl border border-slate-100 print:bg-transparent print:border-2 print:border-slate-800">
                                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <CalendarCheck className="w-4 h-4 text-zone-blue-500" /> Valori Nutrizionali
                                </h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase">Proteine</div>
                                        <div className="font-bold text-slate-900 text-lg">{Math.round(meal.blocks * 7)}g</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase">Carboidrati</div>
                                        <div className="font-bold text-slate-900 text-lg">{Math.round(meal.blocks * 9)}g</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase">Grassi</div>
                                        <div className="font-bold text-slate-900 text-lg">{Math.round(meal.blocks * 1.5)}g</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Instructions & Photo */}
                        <div className="flex flex-col h-full order-1 md:order-2">
                            {/* Photo Placeholder or Real Image */}
                            {meal.imgUrl ? (
                                <div className="w-full aspect-video md:aspect-square relative rounded-lg overflow-hidden shadow-md mb-8 border border-slate-200 print:border-slate-800">
                                    <Image
                                        src={meal.imgUrl}
                                        alt={meal.nome}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-full aspect-video md:aspect-square bg-slate-50 rounded-lg border-2 border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400 mb-8 print:hidden">
                                    <Camera className="w-12 h-12 mb-2 opacity-50" />
                                    <span className="text-sm font-medium mb-4">Nessuna foto disponibile</span>
                                    <Button
                                        onClick={handleGenerateAI}
                                        disabled={generating}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-200"
                                    >
                                        {generating ? <Wand2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                        {generating ? "Generazione in corso..." : "Genera con AI ✨"}
                                    </Button>
                                    <p className="text-[10px] text-slate-400 mt-2 max-w-[200px] text-center">Genera foto e procedimento automatici con Gemini.</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-2">
                                <h3 className="font-bold text-xl text-slate-900 uppercase tracking-wider">
                                    Procedimento
                                </h3>
                                {/* Mobile Generate Button if needed and not already generated */}
                                {!hasProcedure && !meal.imgUrl && (
                                    <Button
                                        onClick={handleGenerateAI}
                                        variant="ghost"
                                        size="sm"
                                        disabled={generating}
                                        className="text-indigo-600 md:hidden"
                                    >
                                        <Wand2 className="w-4 h-4 mr-1" />
                                        {generating ? "..." : "Genera"}
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-6 flex-1">
                                {hasProcedure ? (
                                    procedureSteps.length > 0 ? (
                                        procedureSteps.map((step: string, i: number) => (
                                            <div key={i} className="flex gap-4">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center print:bg-transparent print:border print:border-black print:text-black">
                                                    {i + 1}
                                                </span>
                                                <p className="text-slate-700 leading-relaxed text-sm">
                                                    {step}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{procedureText}</p>
                                    )
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-100 italic text-slate-400">
                                        Nessun procedimento salvato. <br />
                                        Clicca &quot;Genera con AI&quot; per crearlo!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 md:mt-auto pt-8 border-t border-slate-200 text-center text-slate-400 text-xs flex flex-col md:flex-row justify-between items-center gap-2 print:text-slate-600 print:flex-row">
                        <span>Generato da ZoneCalculator v2</span>
                        <span>www.zonecalculator.app</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

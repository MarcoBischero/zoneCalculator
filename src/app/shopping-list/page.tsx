'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, CheckCircle, Circle, RefreshCw, Printer, Calendar, Sparkles, Store } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SUPERMARKETS } from '@/lib/supermarket-layouts';

interface IngredientItem {
    id: string;
    name: string;
    grams: number;
    checked: boolean;
    category: 'Protein' | 'Carb' | 'Fat' | 'Other';
}

interface OrganizedSection {
    name: string;
    icon: string;
    order: number;
    items: { name: string; grams: number; checked?: boolean }[];
}

const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

export default function ShoppingListPage() {
    const [items, setItems] = useState<IngredientItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [optimizing, setOptimizing] = useState(false);
    const [selectedDayIndices, setSelectedDayIndices] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
    const [selectedSupermarket, setSelectedSupermarket] = useState('esselunga');
    const [isOptimized, setIsOptimized] = useState(false);
    const [organizedSections, setOrganizedSections] = useState<OrganizedSection[]>([]);

    const fetchCalendarAndBuildList = useCallback(async () => {
        try {
            setLoading(true);
            setIsOptimized(false);
            const res = await fetch('/api/calendar');
            const calendarItems = await res.json();

            const aggregator = new Map<string, IngredientItem>();

            // Filter by selected days
            const filteredItems = calendarItems.filter((item: any) =>
                selectedDayIndices.includes(item.column)
            );

            // Helper function to normalize ingredient names for smart merging
            const normalizeIngredientName = (name: string): string => {
                let normalized = name.toLowerCase().trim();

                // Remove common variations and plural forms
                normalized = normalized
                    .replace(/\s+/g, ' ')  // Multiple spaces to single
                    .replace(/\bdi\b/g, '') // Remove 'di'
                    .replace(/\bdel\b/g, '') // Remove 'del'
                    .replace(/\bdella\b/g, '') // Remove 'della'
                    .replace(/\bil\b/g, '') // Remove 'il'
                    .replace(/\bla\b/g, '') // Remove 'la'
                    .replace(/\(/g, '')
                    .replace(/\)/g, '')
                    .trim();

                // Handle common singular/plural: remove trailing 'i' or 'e' for basic matching
                // This helps match "pere" with "pera", "kiwi" with "kiwi", etc.
                return normalized;
            };

            filteredItems.forEach((item: any) => {
                const meal = item.pasto;
                if (!meal || !meal.alimenti) return;

                meal.alimenti.forEach((pa: any) => {
                    const food = pa.alimento;
                    const originalName = food.nome;
                    const normalizedName = normalizeIngredientName(originalName);
                    const grams = pa.grAlimento;
                    const category = determineCategory(food);

                    // Try to find existing item with same normalized name
                    let existingItem: IngredientItem | undefined;
                    for (const [key, value] of aggregator.entries()) {
                        if (normalizeIngredientName(key) === normalizedName) {
                            existingItem = value;
                            break;
                        }
                    }

                    if (existingItem) {
                        // Merge with existing item
                        existingItem.grams += grams;
                    } else {
                        // Create new item
                        aggregator.set(originalName, {
                            id: originalName,
                            name: originalName,
                            grams: grams,
                            checked: false,
                            category
                        });
                    }
                });
            });

            setItems(Array.from(aggregator.values()).sort((a, b) => a.category.localeCompare(b.category)));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [selectedDayIndices]);

    useEffect(() => {
        fetchCalendarAndBuildList();
    }, [fetchCalendarAndBuildList]);

    const determineCategory = (food: any): any => {
        if (food.proteine > food.carboidrati && food.proteine > food.grassi) return 'Protein';
        if (food.carboidrati > food.proteine && food.carboidrati > food.grassi) return 'Carb';
        if (food.grassi > food.proteine && food.grassi > food.carboidrati) return 'Fat';
        return 'Other';
    };

    const handleOptimizeRoute = async () => {
        try {
            setOptimizing(true);
            const res = await fetch('/api/shopping/optimize-route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map(i => ({ name: i.name, grams: i.grams })),
                    supermarketId: selectedSupermarket
                })
            });

            if (!res.ok) throw new Error('Failed to optimize');

            const data = await res.json();

            // Merge checked status from original items
            const checkedMap = new Map(items.map(i => [i.name.toLowerCase(), i.checked]));
            const sectionsWithChecked = data.organized.map((section: OrganizedSection) => ({
                ...section,
                items: section.items.map(item => ({
                    ...item,
                    checked: checkedMap.get(item.name.toLowerCase()) || false
                }))
            }));

            setOrganizedSections(sectionsWithChecked);
            setIsOptimized(true);
        } catch (error) {
            console.error('Optimization error:', error);
            alert('Errore durante l\'ottimizzazione. Riprova.');
        } finally {
            setOptimizing(false);
        }
    };

    const toggleCheck = (itemName: string) => {
        if (isOptimized) {
            setOrganizedSections(organizedSections.map(section => ({
                ...section,
                items: section.items.map(item =>
                    item.name === itemName ? { ...item, checked: !item.checked } : item
                )
            })));
        } else {
            setItems(items.map(i => i.id === itemName ? { ...i, checked: !i.checked } : i));
        }
    };

    const toggleDay = (dayIndex: number) => {
        setSelectedDayIndices(prev =>
            prev.includes(dayIndex)
                ? prev.filter(d => d !== dayIndex)
                : [...prev, dayIndex].sort()
        );
    };

    const selectAllDays = () => {
        setSelectedDayIndices([0, 1, 2, 3, 4, 5, 6]);
    };

    const handlePrint = () => {
        window.print();
    };

    const groupedItems = {
        Protein: items.filter(i => i.category === 'Protein'),
        Carb: items.filter(i => i.category === 'Carb'),
        Fat: items.filter(i => i.category === 'Fat'),
        Other: items.filter(i => i.category === 'Other'),
    };

    const getTotalGrams = (category: 'Protein' | 'Carb' | 'Fat' | 'Other') => {
        return groupedItems[category].reduce((sum, item) => sum + item.grams, 0);
    };

    const currentSupermarket = SUPERMARKETS.find(s => s.id === selectedSupermarket);

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header - Hide on print */}
                <div className="print:hidden flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <ShoppingCart className="w-8 h-8 text-primary" />
                            Lista della Spesa
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {isOptimized
                                ? `Ottimizzata per ${currentSupermarket?.name}`
                                : 'Generata dal tuo piano settimanale'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handlePrint} variant="default" size="sm" disabled={items.length === 0}>
                            <Printer className="w-4 h-4 mr-2" />
                            Stampa
                        </Button>
                        <Button onClick={fetchCalendarAndBuildList} variant="outline" size="sm">
                            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                            Aggiorna
                        </Button>
                    </div>
                </div>

                {/* Day Selector - Hide on print */}
                <Card className="print:hidden">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Seleziona Giorni
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={selectAllDays}
                                disabled={selectedDayIndices.length === 7}
                            >
                                Tutta la settimana
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map((day, index) => (
                                <Button
                                    key={index}
                                    variant={selectedDayIndices.includes(index) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleDay(index)}
                                    className="min-w-[100px]"
                                >
                                    {day}
                                </Button>
                            ))}
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                            {selectedDayIndices.length === 0 && "Seleziona almeno un giorno"}
                            {selectedDayIndices.length === 7 && "Intera settimana selezionata"}
                            {selectedDayIndices.length > 0 && selectedDayIndices.length < 7 &&
                                `${selectedDayIndices.length} giorni selezionati`
                            }
                        </div>
                    </CardContent>
                </Card>

                {/* AI Supermarket Optimizer - Hide on print */}
                {items.length > 0 && (
                    <Card className="print:hidden bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                Ottimizzazione AI Percorso
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                                    <Store className="w-4 h-4" />
                                    Seleziona il tuo supermercato
                                </label>
                                <select
                                    value={selectedSupermarket}
                                    onChange={(e) => {
                                        setSelectedSupermarket(e.target.value);
                                        setIsOptimized(false);
                                    }}
                                    className="w-full mt-1 p-2 border rounded-md bg-white dark:bg-gray-900 text-foreground border-indigo-200 dark:border-indigo-800 focus:ring-2 focus:ring-indigo-500"
                                >
                                    {SUPERMARKETS.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                onClick={handleOptimizeRoute}
                                disabled={optimizing || items.length === 0}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700"
                                size="lg"
                            >
                                {optimizing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Ottimizzazione in corso...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        {isOptimized ? 'Ri-ottimizza Percorso' : 'Ottimizza Percorso'}
                                    </>
                                )}
                            </Button>
                            {isOptimized && (
                                <div className="text-xs text-center text-indigo-700 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded border border-indigo-200 dark:border-indigo-800">
                                    ✨ Lista ordinata per un percorso ottimale in {currentSupermarket?.name}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Print-only header */}
                <div className="hidden print:block mb-6">
                    <h1 className="text-2xl font-bold mb-2">Lista della Spesa</h1>
                    <p className="text-sm text-gray-600">
                        Giorni: {selectedDayIndices.map(i => DAYS[i]).join(', ')}
                        {isOptimized && ` | Supermercato: ${currentSupermarket?.name}`}
                    </p>
                    <hr className="mt-4 border-gray-300" />
                </div>

                {/* Shopping List Content */}
                {loading ? (
                    <div className="text-center py-20 text-muted-foreground">Caricamento...</div>
                ) : selectedDayIndices.length === 0 ? (
                    <Card className="border-dashed border-2 print:hidden">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                            <Calendar className="w-12 h-12 mb-4 opacity-50" />
                            <p>Seleziona almeno un giorno per generare la lista</p>
                        </CardContent>
                    </Card>
                ) : items.length === 0 ? (
                    <Card className="border-dashed border-2 print:hidden">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                            <ShoppingCart className="w-12 h-12 mb-4 opacity-50" />
                            <p>Nessun pasto nel calendario per i giorni selezionati</p>
                            <Button variant="link" onClick={() => window.location.href = '/calendar'}>
                                Vai al Calendario
                            </Button>
                        </CardContent>
                    </Card>
                ) : isOptimized ? (
                    // Optimized view by supermarket sections
                    <div className="space-y-6">
                        {organizedSections.map((section, idx) => (
                            <Card key={`${section.name}-${idx}`} className="shadow-sm print:shadow-none print:border-2">
                                <CardHeader className="pb-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 border-b">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                                            <span className="text-2xl">{section.icon}</span>
                                            <span>{section.name}</span>
                                            <span className="text-xs font-normal text-white/80">
                                                ({section.items.length} {section.items.length === 1 ? 'articolo' : 'articoli'})
                                            </span>
                                        </CardTitle>
                                        <span className="text-xs font-semibold text-white/90">
                                            Totale: {Math.round(section.items.reduce((sum, item) => sum + item.grams, 0))}g
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ul className="divide-y divide-border">
                                        {section.items.map((item, itemIdx) => (
                                            <li
                                                key={`${item.name}-${itemIdx}`}
                                                className={cn(
                                                    "flex items-center justify-between p-4 transition-all print:py-2",
                                                    "cursor-pointer hover:bg-muted/50 print:cursor-default print:hover:bg-transparent",
                                                    item.checked && "bg-muted/30"
                                                )}
                                                onClick={() => toggleCheck(item.name)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.checked
                                                        ? <CheckCircle className="w-5 h-5 text-green-500 print:hidden" />
                                                        : <Circle className="w-5 h-5 text-muted-foreground/30 print:hidden" />
                                                    }
                                                    <span className="hidden print:inline-block w-4 h-4 border-2 border-gray-400 mr-2"></span>
                                                    <span className={cn(
                                                        "font-medium text-foreground",
                                                        item.checked && "line-through text-muted-foreground print:no-underline print:text-foreground"
                                                    )}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <span className={cn(
                                                    "font-bold text-foreground",
                                                    item.checked && "text-muted-foreground print:text-foreground"
                                                )}>
                                                    {Math.round(item.grams)}g
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    // Default view by macronutrient category
                    <div className="space-y-6">
                        {Object.entries(groupedItems).map(([category, catItems]) => (
                            catItems.length > 0 && (
                                <Card key={category} className="shadow-sm print:shadow-none print:border-2">
                                    <CardHeader className="pb-3 bg-muted/50 border-b print:bg-gray-50">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                                {category === 'Protein' ? 'Proteine' :
                                                    category === 'Carb' ? 'Carboidrati' :
                                                        category === 'Fat' ? 'Grassi' : 'Altro'}
                                            </CardTitle>
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                Totale: {Math.round(getTotalGrams(category as any))}g
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ul className="divide-y divide-border">
                                            {catItems.map((item) => (
                                                <li
                                                    key={item.id}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 transition-all print:py-2",
                                                        "cursor-pointer hover:bg-muted/50 print:cursor-default print:hover:bg-transparent",
                                                        item.checked && "bg-muted/30"
                                                    )}
                                                    onClick={() => toggleCheck(item.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {item.checked
                                                            ? <CheckCircle className="w-5 h-5 text-green-500 print:hidden" />
                                                            : <Circle className="w-5 h-5 text-muted-foreground/30 print:hidden" />
                                                        }
                                                        <span className="hidden print:inline-block w-4 h-4 border-2 border-gray-400 mr-2"></span>
                                                        <span className={cn(
                                                            "font-medium text-foreground",
                                                            item.checked && "line-through text-muted-foreground print:no-underline print:text-foreground"
                                                        )}>
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    <span className={cn(
                                                        "font-bold text-foreground",
                                                        item.checked && "text-muted-foreground print:text-foreground"
                                                    )}>
                                                        {Math.round(item.grams)}g
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )
                        ))}
                    </div>
                )}
            </div>

            {/* Print styles */}
            <style jsx global>{`
                @media print {
                    body {
                        background: white;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:block {
                        display: block !important;
                    }
                    .print\\:inline-block {
                        display: inline-block !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:border-2 {
                        border-width: 2px !important;
                    }
                    .print\\:bg-gray-50 {
                        background-color: #f9fafb !important;
                    }
                    .print\\:py-2 {
                        padding-top: 0.5rem !important;
                        padding-bottom: 0.5rem !important;
                    }
                    .print\\:cursor-default {
                        cursor: default !important;
                    }
                    .print\\:hover\\:bg-transparent:hover {
                        background-color: transparent !important;
                    }
                    .print\\:no-underline {
                        text-decoration: none !important;
                    }
                    .print\\:text-foreground {
                        color: inherit !important;
                    }
                    @page {
                        margin: 1cm;
                    }
                }
            `}</style>
        </div>
    );
}

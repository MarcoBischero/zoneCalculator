'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, CheckCircle, Circle, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IngredientItem {
    id: string; // unique key (name based)
    name: string;
    grams: number;
    checked: boolean;
    category: 'Protein' | 'Carb' | 'Fat' | 'Other';
}

export default function ShoppingListPage() {
    const [items, setItems] = useState<IngredientItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDays, setSelectedDays] = useState<string[]>(['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']);
    const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

    const fetchCalendarAndBuildList = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/calendar');
            const calendarItems = await res.json();

            const aggregator = new Map<string, IngredientItem>();

            calendarItems.forEach((item: any) => {
                const meal = item.pasto;
                if (!meal || !meal.alimenti) return;

                meal.alimenti.forEach((pa: any) => {
                    const food = pa.alimento;
                    const name = food.nome;
                    const grams = pa.grAlimento;
                    const category = determineCategory(food);

                    if (aggregator.has(name)) {
                        const existing = aggregator.get(name)!;
                        existing.grams += grams;
                    } else {
                        aggregator.set(name, {
                            id: name,
                            name: name,
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
    }, []);

    useEffect(() => {
        fetchCalendarAndBuildList();
    }, [fetchCalendarAndBuildList]);

    // Simple heuristic for Mock/Real data category
    // In real app, 'Alimento' should have a category field. 
    // Here we guess based on generic names or just group by "Items"
    const determineCategory = (food: any): any => {
        // This would ideally come from the DB (food.category)
        // For now, return 'Grocery' to keep it simple unless we want to parse protein/carb/fat from macros
        if (food.proteine > food.carboidrati && food.proteine > food.grassi) return 'Protein';
        if (food.carboidrati > food.proteine && food.carboidrati > food.grassi) return 'Carb';
        if (food.grassi > food.proteine && food.grassi > food.carboidrati) return 'Fat';
        return 'Other';
    };

    const toggleCheck = (id: string) => {
        setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    };

    const groupedItems = {
        Protein: items.filter(i => i.category === 'Protein'),
        Carb: items.filter(i => i.category === 'Carb'),
        Fat: items.filter(i => i.category === 'Fat'),
        Other: items.filter(i => i.category === 'Other'),
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
                            <ShoppingCart className="w-8 h-8 text-zone-blue-600" />
                            Shopping List
                        </h1>
                        <p className="text-slate-500 mt-1">Generated from your weekly calendar plans.</p>
                    </div>
                    <Button onClick={fetchCalendarAndBuildList} variant="outline" size="sm">
                        <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400">Building list...</div>
                ) : items.length === 0 ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-slate-400">
                            <ShoppingCart className="w-12 h-12 mb-4 opacity-50" />
                            <p>No meals in your calendar yet.</p>
                            <Button variant="link" onClick={() => window.location.href = '/calendar'}>Go to Planner</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedItems).map(([category, catItems]) => (
                            catItems.length > 0 && (
                                <Card key={category} className="shadow-sm">
                                    <CardHeader className="pb-3 bg-slate-50 border-b border-slate-100">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                            {category}s
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <ul className="divide-y divide-slate-100">
                                            {catItems.map((item) => (
                                                <li
                                                    key={item.id}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 transition-all cursor-pointer hover:bg-slate-50",
                                                        item.checked && "bg-slate-50/50"
                                                    )}
                                                    onClick={() => toggleCheck(item.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {item.checked
                                                            ? <CheckCircle className="w-5 h-5 text-green-500" />
                                                            : <Circle className="w-5 h-5 text-slate-300" />
                                                        }
                                                        <span className={cn("font-medium text-slate-700", item.checked && "line-through text-slate-400")}>
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    <span className={cn("font-bold text-slate-900", item.checked && "text-slate-400")}>
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
        </div>
    );
}

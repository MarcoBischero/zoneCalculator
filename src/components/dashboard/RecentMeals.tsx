'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Utensils, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';

export function RecentMeals() {
    const [meals, setMeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/meals')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMeals(data.slice(0, 3)); // Only show top 3
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex justify-center p-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
    );

    if (meals.length === 0) return (
        <div className="text-center py-10 flex flex-col items-center justify-center space-y-3 opacity-60 hover:opacity-100 transition-opacity">
            <div className="p-3 bg-muted/10 rounded-full ring-1 ring-muted/20">
                <UtensilsCrossed className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">Nessun pasto recente</p>
                <p className="text-xs text-muted-foreground">Inizia a creare il tuo primo pasto in Zona!</p>
            </div>
            <Link href="/meals/new">
                <Button variant="outline" size="sm">
                    Crea il tuo primo pasto
                </Button>
            </Link>
        </div>
    );

    return (
        <div className="space-y-3 flex-1">
            {meals.map((meal) => (
                <div key={meal.codicePasto} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors border border-dashed border-border hover:border-border/80 cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl shadow-sm group-hover:shadow-md transition-all">
                            {meal.imgUrl ? '📸' : '🍽️'}
                        </div>
                        <div>
                            <div className="font-semibold text-foreground text-sm">{meal.nome}</div>
                            <div className="text-xs text-muted-foreground">
                                {meal.mealType === '0' ? 'Colazione' :
                                    meal.mealType === '1' ? 'Pranzo' :
                                        meal.mealType === '2' ? 'Cena' : 'Spuntino'}
                            </div>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-xs font-bold text-muted-foreground bg-card group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {meal.blocks}
                    </div>
                </div>
            ))}
        </div>
    );
}

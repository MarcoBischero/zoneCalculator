'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export function SavedMealsList() {
    const [meals, setMeals] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/meals')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMeals(data);
                } else {
                    console.error('API returned non-array:', data);
                    setMeals([]);
                }
            })
            .catch(console.error);
    }, []);

    if (meals.length === 0) return <div className="text-sm text-slate-400 text-center py-4">No saved meals yet.</div>;

    return (
        <div className="space-y-3">
            {(Array.isArray(meals) ? meals : []).map(meal => (
                <div key={meal.codicePasto} className="p-3 rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-all group relative">
                    <div className="flex justify-between items-start mb-2">
                        <Link href={`/calculator?edit=${meal.codicePasto}`} replace className="flex-1">
                            <span className="font-semibold text-foreground text-sm hover:text-primary transition-colors block leading-tight">{meal.nome}</span>
                        </Link>
                        <span className="text-xs font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded ml-2 flex-shrink-0">{meal.blocks} Blk</span>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="text-xs text-muted-foreground">
                            <span>{meal.mealType || 'Mixed'}</span>
                        </div>

                        <div className="flex gap-2">
                            <Link href={`/recipe/${meal.codicePasto}`}>
                                <button className="p-1.5 rounded-md hover:bg-indigo-50 text-indigo-600 transition-colors" title="View Recipe Card">
                                    <Eye className="w-4 h-4" />
                                </button>
                            </Link>
                            <Link href={`/calculator?edit=${meal.codicePasto}`} replace>
                                <button className="text-xs font-medium text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors">
                                    Load →
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

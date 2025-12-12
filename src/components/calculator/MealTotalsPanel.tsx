import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';

interface MealTotalsPanelProps {
    totals: {
        protein: number;
        carbs: number;
        fat: number;
        blocksP: number;
        blocksC: number;
        blocksF: number;
        calories: number;
    };
    mealType: string;
    setMealType: (type: string) => void;
    mealName: string;
    setMealName: (name: string) => void;
    onSave: () => void;
    isSaving: boolean;
    hasItems: boolean;
}

export function MealTotalsPanel({
    totals,
    mealType,
    setMealType,
    mealName,
    setMealName,
    onSave,
    isSaving,
    hasItems
}: MealTotalsPanelProps) {
    return (
        <div className="sticky top-6 space-y-4">
            <div className="glass-panel p-6 rounded-2xl border-primary/20 shadow-xl shadow-primary/5">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Meal Totals</h3>
                    <div className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                        {totals.calories} kcal
                    </div>
                </div>

                {/* Macro Bars */}
                <div className="space-y-6">
                    {/* Protein */}
                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-foreground">Protein</span>
                            <span className="font-bold text-red-500">{totals.blocksP} <span className="text-[10px] text-muted-foreground font-normal">blocks</span></span>
                        </div>
                        <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totals.blocksP / 4) * 100)}%` }} />
                        </div>
                        <div className="text-right text-[10px] text-muted-foreground mt-1">{totals.protein}g</div>
                    </div>

                    {/* Carbs */}
                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-foreground">Carbs</span>
                            <span className="font-bold text-green-500">{totals.blocksC} <span className="text-[10px] text-muted-foreground font-normal">blocks</span></span>
                        </div>
                        <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totals.blocksC / 4) * 100)}%` }} />
                        </div>
                        <div className="text-right text-[10px] text-muted-foreground mt-1">{totals.carbs}g</div>
                    </div>

                    {/* Fat */}
                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-foreground">Fat</span>
                            <span className="font-bold text-yellow-500">{totals.blocksF} <span className="text-[10px] text-muted-foreground font-normal">blocks</span></span>
                        </div>
                        <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totals.blocksF / 4) * 100)}%` }} />
                        </div>
                        <div className="text-right text-[10px] text-muted-foreground mt-1">{totals.fat}g</div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border/50">
                    <div className="space-y-4">
                        {/* Meal Type Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Meal Type</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['0', '1', '2', '3'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setMealType(type)}
                                        className={cn(
                                            "text-xs font-medium py-2 rounded-lg border transition-all",
                                            mealType === type
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border hover:border-primary/50 text-muted-foreground"
                                        )}
                                    >
                                        {type === '0' ? 'Colaz.' : type === '1' ? 'Pranzo' : type === '2' ? 'Cena' : 'Spunt.'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Meal Name</label>
                            <input
                                type="text"
                                value={mealName}
                                onChange={(e) => setMealName(e.target.value)}
                                className="w-full bg-secondary/10 border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>

                        <Button className="w-full mt-2" size="lg" onClick={onSave} disabled={isSaving || !hasItems}>
                            {isSaving ? 'Saving...' : 'Save Meal'}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}

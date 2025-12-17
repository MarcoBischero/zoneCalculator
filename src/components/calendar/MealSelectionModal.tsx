import { Button } from '@/components/ui/button';
import { Meal } from '@/types/calendar';
import { X } from 'lucide-react';
import React from 'react';

interface MealSelectionModalProps {
    day: string;
    type: string;
    meals: Meal[];
    onSelect: (meal: Meal) => void;
    onClose: () => void;
}

export function MealSelectionModal({ day, type, meals, onSelect, onClose }: MealSelectionModalProps) {
    return (
        <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-200"
            onClick={onClose}
        >
            <div
                className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
                    <div>
                        <h3 className="font-bold text-lg text-foreground">Seleziona Pasto</h3>
                        <p className="text-xs text-muted-foreground">Per {day} • {type}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-destructive/10 hover:text-destructive">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-4 overflow-y-auto space-y-2 flex-1">
                    {meals.length === 0 ? (
                        <div className="text-center py-8 space-y-4">
                            <p className="text-muted-foreground">Nessun pasto salvato.</p>
                            <Button variant="outline" onClick={onClose}>Chiudi</Button>
                        </div>
                    ) : (
                        <>
                            {meals.map(meal => (
                                <button
                                    key={meal.codicePasto}
                                    onClick={() => onSelect(meal)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left bg-card"
                                >
                                    <div className="font-medium text-foreground">{meal.nome}</div>
                                    <div className="text-xs font-bold bg-muted px-2 py-1 rounded text-muted-foreground">{meal.blocks} Blocchi</div>
                                </button>
                            ))}
                            <div className="pt-4 border-t border-border mt-2">
                                <Button variant="outline" className="w-full" onClick={onClose}>Annulla</Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

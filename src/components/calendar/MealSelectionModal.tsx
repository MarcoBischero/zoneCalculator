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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Seleziona Pasto</h3>
                        <p className="text-xs text-slate-500">Per {day} • {type}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}><X className="w-5 h-5" /></Button>
                </div>

                <div className="p-4 overflow-y-auto space-y-2">
                    {meals.length === 0 ? (
                        <p className="text-center text-slate-400 py-8">Nessun pasto salvato. Vai al Calcolatore per crearne uno!</p>
                    ) : (
                        meals.map(meal => (
                            <button
                                key={meal.codicePasto}
                                onClick={() => onSelect(meal)}
                                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-zone-blue-500 hover:bg-zone-blue-50 transition-all text-left"
                            >
                                <div className="font-medium text-slate-800">{meal.nome}</div>
                                <div className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{meal.blocks} Blocchi</div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

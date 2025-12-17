import React, { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Plus, X, MoreHorizontal, ArrowRight, Trash, Sparkles, Check } from 'lucide-react';
import { Meal } from '@/types/calendar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
interface CalendarSlotProps {
    day: string;
    type: string;
    plan: Record<string, any>; // Changed from strict Meal to allow isConsumed
    meals?: Meal[];
    handleSelectMeal: (meal: Meal) => void;
    setSelectingFor: (val: { day: string; type: string } | null) => void;
    clearSlot: (e: React.MouseEvent, day: string, type: string) => void;
    moveForward?: (day: string, type: string) => void;
    onTrack?: (day: string, type: string, status: boolean) => void; // Callback provided by parent
}

export function CalendarSlot({ day, type, plan, meals = [], handleSelectMeal, setSelectingFor, clearSlot, moveForward, onTrack }: CalendarSlotProps) {
    const key = `${day}-${type}`;
    const assignedMeal = plan[key];
    const { setNodeRef: setDropRef, isOver } = useDroppable({ id: key });
    const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
        id: key,
        disabled: !assignedMeal
    });

    const [isConsuming, setIsConsuming] = useState(false);

    const handleToggleConsumed = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!assignedMeal) return;
        setIsConsuming(true);
        try {
            const newStatus = !assignedMeal.isConsumed;
            const res = await fetch('/api/calendar/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ day, type, status: newStatus })
            });

            if (res.ok && onTrack) {
                onTrack(day, type, newStatus);
            }
        } catch (e) { console.error(e); }
        finally { setIsConsuming(false); }
    };

    const getSuggestions = () => {
        if (assignedMeal || !meals.length) return [];
        return meals.filter(m => {
            if (type.includes('Colazione')) return m.blocks >= 2 && m.blocks <= 4;
            if (type.includes('Spuntino')) return m.blocks <= 2;
            return m.blocks >= 3;
        }).slice(0, 2);
    };

    const suggestions = getSuggestions();
    const isEaten = assignedMeal?.isConsumed;

    // Handler for clicking the slot
    const handleSlotClick = () => {
        if (isDragging) return;
        // Only open selection if NO meal is assigned
        if (!assignedMeal) {
            setSelectingFor({ day, type });
        }
    };

    return (
        <div
            ref={(node) => {
                setDropRef(node);
                if (assignedMeal) setDragRef(node);
            }}
            onClick={handleSlotClick}
            className={`
                relative flex flex-col justify-between min-h-[120px] p-3 rounded-xl transition-all duration-200 border group print:min-h-[80px] print:p-2 print:border-slate-300
                ${assignedMeal
                    ? isEaten
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 print:bg-transparent'
                        : 'bg-card border-border hover:border-primary/30 hover:shadow-md print:bg-transparent'
                    : 'bg-muted/10 border-dashed border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5 cursor-pointer print:hidden'}
                ${isOver ? 'ring-2 ring-primary/20 scale-[1.01] bg-primary/5' : ''}
                ${isDragging ? 'opacity-40 rotate-1 scale-95 shadow-xl cursor-grabbing' : ''}
                ${!assignedMeal ? 'cursor-pointer' : 'cursor-default'} // Show pointer only if clickable (empty)
            `}
            {...(assignedMeal ? { ...attributes, ...listeners } : {})}
            style={{
                transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
                zIndex: isDragging ? 50 : 0
            }}
        >
            {/* Header: Type & Actions */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground print:text-black">
                    {type}
                </span>

                {assignedMeal && (
                    <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isEaten ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 print:text-black print:bg-transparent print:border print:border-slate-400' : 'bg-secondary text-secondary-foreground print:text-black print:bg-transparent print:border print:border-slate-400'}`}>
                            {assignedMeal.blocks} BLK
                        </span>

                        {/* Menu Actions */}
                        <div onClick={e => e.stopPropagation()} className="print:hidden">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="h-5 w-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {moveForward && (
                                        <DropdownMenuItem onClick={() => moveForward(day, type)}>
                                            <ArrowRight className="w-4 h-4 mr-2" />
                                            Sposta a domani
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => setSelectingFor({ day, type })}>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Sostituisci
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => clearSlot(e, day, type)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                        <Trash className="w-4 h-4 mr-2" />
                                        Rimuovi
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                )}
            </div>

            {/* Content: Meal Name & Checkbox */}
            {assignedMeal ? (
                <div className="flex-1 flex flex-col justify-center gap-3 min-w-0">
                    <div className="flex items-start gap-3 group/check min-w-0 w-full">
                        <button
                            onClick={handleToggleConsumed}
                            className={`
                                mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 print:hidden
                                ${isEaten
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                    : 'border-muted-foreground/30 text-transparent hover:border-emerald-500 hover:text-emerald-500/30 bg-background'}
                            `}
                        >
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </button>

                        <span className={`text-sm font-medium leading-tight transition-all duration-200 truncate w-full block ${isEaten ? 'text-muted-foreground line-through decoration-emerald-500/30' : 'text-foreground'} print:text-black print:text-xs print:whitespace-normal`} title={assignedMeal.nome}>
                            {assignedMeal.nome}
                        </span>
                    </div>
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 gap-1 pb-2 print:hidden">
                    {suggestions.length > 0 ? (
                        <div className="w-full space-y-1">
                            {suggestions.map(meal => (
                                <div
                                    key={meal.codicePasto}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectMeal(meal);
                                    }}
                                    className="text-[10px] w-full p-1.5 bg-muted/40 rounded border border-transparent hover:bg-background hover:border-border hover:shadow-sm transition-all cursor-pointer truncate"
                                >
                                    {meal.nome}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <Plus className="w-6 h-6 mb-1 opacity-50" />
                            <span className="text-[10px] font-medium opacity-50">Aggiungi</span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

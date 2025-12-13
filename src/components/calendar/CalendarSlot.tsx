import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Plus, X, MoreHorizontal, ArrowRight, Trash, Sparkles } from 'lucide-react';
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
    plan: Record<string, Meal>;
    meals?: Meal[];
    handleSelectMeal: (meal: Meal) => void;
    setSelectingFor: (val: { day: string; type: string } | null) => void;
    clearSlot: (e: React.MouseEvent, day: string, type: string) => void;
    moveForward?: (day: string, type: string) => void;
}

export function CalendarSlot({ day, type, plan, meals = [], handleSelectMeal, setSelectingFor, clearSlot, moveForward }: CalendarSlotProps) {
    const key = `${day}-${type}`;
    const assignedMeal = plan[key];

    const { setNodeRef: setDropRef, isOver } = useDroppable({ id: key });
    const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
        id: key,
        disabled: !assignedMeal
    });

    const getSuggestions = () => {
        if (assignedMeal || !meals.length) return [];

        return meals.filter(m => {
            if (type.includes('Colazione')) return m.blocks >= 2 && m.blocks <= 4;
            if (type.includes('Spuntino')) return m.blocks <= 2;
            return m.blocks >= 3;
        }).slice(0, 2);
    };

    const suggestions = getSuggestions();

    return (
        <div
            ref={(node) => {
                setDropRef(node);
                if (assignedMeal) setDragRef(node);
            }}
            onClick={() => !isDragging && setSelectingFor({ day, type })}
            className={`
    p-3 rounded-xl min-h-[110px] flex flex-col justify-between transition-all duration-200 cursor-pointer group relative
    ${assignedMeal
                    ? 'bg-white dark:bg-slate-900 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-800 ring-1 ring-slate-900/5 dark:ring-white/10'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'}
    ${isOver ? 'ring-2 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 scale-[1.02]' : ''}
    ${isDragging ? 'opacity-50 rotate-2 scale-95' : ''}
`}
            {...(assignedMeal ? { ...attributes, ...listeners } : {})}
            style={{
                transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
            }}
        >
            <div className="flex justify-between items-start">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md transition-colors ${assignedMeal ? 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800' : 'text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-slate-800/50 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-300'}`}>
                    {type}
                </span>
                {assignedMeal && (
                    <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
                        {assignedMeal.blocks} Blk
                    </span>
                )}
            </div>

            {assignedMeal ? (
                <div className="mt-3 relative">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight line-clamp-2 pr-6" title={assignedMeal?.nome}>
                        {assignedMeal.nome}
                    </div>

                    {/* Mobile/Desktop Actions Menu */}
                    <div className="absolute -top-8 -right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-indigo-50">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {moveForward && (
                                    <DropdownMenuItem onClick={() => moveForward(day, type)}>
                                        <ArrowRight className="w-4 h-4 mr-2" />
                                        Sposta a domani
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={(e) => clearSlot(e, day, type)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                    <Trash className="w-4 h-4 mr-2" />
                                    Rimuovi
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col flex-1 justify-end gap-2">
                    {!suggestions.length ? (
                        <div className="flex justify-center items-center flex-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                            <Plus className="w-6 h-6 text-indigo-300 dark:text-indigo-600" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                            <div className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                Suggeriti
                            </div>
                            {suggestions.map(meal => (
                                <div
                                    key={meal.codicePasto}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectMeal(meal);
                                    }}
                                    className="text-[10px] p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50 truncate transition-colors"
                                >
                                    {meal.nome}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

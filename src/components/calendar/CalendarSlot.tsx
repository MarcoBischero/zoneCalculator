import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Plus, X } from 'lucide-react';
import { Meal } from '@/types/calendar';

interface CalendarSlotProps {
    day: string;
    type: string;
    plan: Record<string, Meal>;
    handleSelectMeal: (meal: Meal) => void;
    setSelectingFor: (val: { day: string; type: string } | null) => void;
    clearSlot: (e: React.MouseEvent, day: string, type: string) => void;
}

export function CalendarSlot({ day, type, plan, setSelectingFor, clearSlot }: CalendarSlotProps) {
    const key = `${day}-${type}`;
    const assignedMeal = plan[key];

    const { setNodeRef: setDropRef, isOver } = useDroppable({ id: key });
    const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
        id: key,
        disabled: !assignedMeal
    });

    return (
        <div
            ref={(node) => {
                setDropRef(node);
                if (assignedMeal) setDragRef(node);
            }}
            onClick={() => !isDragging && setSelectingFor({ day, type })}
            className={`
    p-3 rounded-xl border-2 min-h-[100px] flex flex-col justify-between transition-all cursor-pointer group relative shadow-sm
    ${assignedMeal
                    ? 'border-blue-600 bg-white shadow-md'
                    : 'border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-white'}
    ${isOver ? 'ring-2 ring-blue-600 !border-blue-600 bg-blue-50' : ''}
    ${isDragging ? 'opacity-50' : ''}
`}
            {...(assignedMeal ? { ...attributes, ...listeners } : {})}
            style={{
                transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
            }}
        >
            <div className="flex justify-between items-start">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest bg-slate-100 px-1 rounded">{type}</span>
                {assignedMeal && <span className="text-[11px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">{assignedMeal.blocks} Blk</span>}
            </div>

            {assignedMeal ? (
                <div className="mt-2">
                    <div className="text-sm font-medium text-slate-800 leading-tight truncate" title={assignedMeal?.nome}>{assignedMeal.nome}</div>
                    <button
                        onClick={(e) => clearSlot(e, day, type)}
                        className="absolute top-1 right-1 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                <div className="flex justify-center items-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-5 h-5 text-zone-blue-400" />
                </div>
            )}
        </div>
    );
}

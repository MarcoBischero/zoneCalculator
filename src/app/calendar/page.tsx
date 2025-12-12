'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, X, Check, RefreshCw, Copy, Trash2, Loader2 } from 'lucide-react';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const MEAL_TYPES = ['Colazione', 'Spuntino 1', 'Pranzo', 'Spuntino 2', 'Cena'];

interface Meal {
    codicePasto: number;
    nome: string;
    blocks: number;
}


interface CalendarSlotProps {
    day: string;
    type: string;
    plan: Record<string, Meal>;
    handleSelectMeal: (meal: Meal) => void;
    setSelectingFor: (val: { day: string; type: string } | null) => void;
    clearSlot: (e: React.MouseEvent, day: string, type: string) => void;
}

function CalendarSlot({ day, type, plan, setSelectingFor, clearSlot }: CalendarSlotProps) {
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

export default function CalendarPage() {
    const [plan, setPlan] = useState<Record<string, Meal>>({});
    const [meals, setMeals] = useState<Meal[]>([]);
    const [selectingFor, setSelectingFor] = useState<{ day: string; type: string } | null>(null);
    const [generating, setGenerating] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [activeDrag, setActiveDrag] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            setActiveDrag(null);
            return;
        }

        const [fromDay, fromType] = active.id.split('-');
        const [toDay, toType] = over.id.split('-');

        const fromMeal = plan[active.id];

        if (fromMeal) {
            const newPlan = { ...plan };
            delete newPlan[active.id];
            newPlan[over.id] = fromMeal;
            setPlan(newPlan);

            const fromDayIndex = DAYS.indexOf(fromDay);
            const fromTypeIndex = MEAL_TYPES.indexOf(fromType);
            const toDayIndex = DAYS.indexOf(toDay);
            const toTypeIndex = MEAL_TYPES.indexOf(toType);

            await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'remove',
                    day: fromDayIndex,
                    type: fromTypeIndex
                })
            });

            await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add',
                    day: toDayIndex,
                    type: toTypeIndex,
                    mealId: fromMeal.codicePasto
                })
            });
        }

        setActiveDrag(null);
    };

    useEffect(() => {
        fetch('/api/meals').then(res => res.json()).then(data => {
            if (Array.isArray(data)) setMeals(data);
        });
    }, []);

    useEffect(() => {
        loadCalendar();
    }, []);

    const loadCalendar = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch('/api/calendar');
            if (!res.ok) throw new Error('Failed to load calendar');
            const items = await res.json();
            const newPlan: Record<string, Meal> = {};
            items.forEach((item: any) => {
                const day = DAYS[item.column];
                const type = MEAL_TYPES[item.order];
                if (day && type) {
                    newPlan[`${day}-${type}`] = item.pasto;
                }
            });
            setPlan(newPlan);
        } catch (err) {
            setError('Impossibile caricare il calendario. Ricarica la pagina.');
            console.error('Calendar load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMeal = async (meal: Meal) => {
        if (selectingFor) {
            const { day, type } = selectingFor;
            const dayIndex = DAYS.indexOf(day);
            const typeIndex = MEAL_TYPES.indexOf(type);

            setPlan(prev => ({ ...prev, [`${day}-${type}`]: meal }));
            setSelectingFor(null);

            await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add',
                    day: dayIndex,
                    type: typeIndex,
                    mealId: meal.codicePasto
                })
            });
            loadCalendar();
        }
    };

    const clearSlot = async (e: React.MouseEvent, day: string, type: string) => {
        e.stopPropagation();
        const dayIndex = DAYS.indexOf(day);
        const typeIndex = MEAL_TYPES.indexOf(type);

        const newPlan = { ...plan };
        delete newPlan[`${day}-${type}`];
        setPlan(newPlan);

        await fetch('/api/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'remove',
                day: dayIndex,
                type: typeIndex
            })
        });
    }

    const generateWeek = async () => {
        if (!confirm("Questo sovrascriverà la tua settimana attuale. Continuare?")) return;
        setGenerating(true);
        try {
            const res = await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate' })
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Errore sconosciuto');
            }

            await loadCalendar();
        } catch (e: any) {
            alert(e.message || 'Errore durante la generazione');
        } finally {
            setGenerating(false);
        }
    };

    const clearWeek = async () => {
        if (!confirm("Sei sicuro di voler svuotare l'intero calendario settimanale?")) return;
        setClearing(true);
        try {
            await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'clear_week' })
            });
            await loadCalendar();
        } catch (e) {
            alert('Errore durante la cancellazione');
        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen relative">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Planner Settimanale</h1>
                    <p className="text-slate-500">Pianifica i tuoi blocchi Zona per la settimana.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={clearWeek}
                        disabled={clearing || Object.keys(plan).length === 0}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                        {clearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Svuota
                    </Button>
                    <Button
                        variant="outline"
                        onClick={async () => {
                            if (confirm('Vuoi copiare la settimana scorsa al posto di questa?')) {
                                await fetch('/api/calendar', {
                                    method: 'POST',
                                    body: JSON.stringify({ action: 'copy_previous' })
                                });
                                loadCalendar();
                            }
                        }}
                    >
                        <Copy className="mr-2 h-4 w-4" />
                        Copia Scorsa Settimana
                    </Button>
                    <Button
                        onClick={generateWeek}
                        disabled={generating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
                        {generating ? 'Generando...' : 'AI Auto-Fill'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-3 text-slate-600">Caricamento calendario...</span>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={(event) => setActiveDrag(event.active.id as string)}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-7 gap-4 min-w-[1000px] overflow-x-auto pb-8">
                        {DAYS.map((day) => (
                            <div key={day} className="flex flex-col gap-3">
                                <div className="text-center font-medium text-slate-700 py-2 bg-white rounded-lg border shadow-sm">
                                    {day}
                                </div>
                                {MEAL_TYPES.map((type) => (
                                    <CalendarSlot
                                        key={`${day}-${type}`}
                                        day={day}
                                        type={type}
                                        plan={plan}
                                        handleSelectMeal={handleSelectMeal}
                                        setSelectingFor={setSelectingFor}
                                        clearSlot={clearSlot}
                                    />
                                ))}
                            </div>
                        ))}

                    </div>
                </DndContext>
            )}

            {/* Meal Selection Modal */}
            {selectingFor && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Seleziona Pasto</h3>
                                <p className="text-xs text-slate-500">Per {selectingFor.day} • {selectingFor.type}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectingFor(null)}><X className="w-5 h-5" /></Button>
                        </div>

                        <div className="p-4 overflow-y-auto space-y-2">
                            {meals.length === 0 ? (
                                <p className="text-center text-slate-400 py-8">Nessun pasto salvato. Vai al Calcolatore per crearne uno!</p>
                            ) : (
                                meals.map(meal => (
                                    <button
                                        key={meal.codicePasto}
                                        onClick={() => handleSelectMeal(meal)}
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
            )}

        </div>
    );
}


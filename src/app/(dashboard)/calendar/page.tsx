'use client';
import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

import { CalendarSlot } from '@/components/calendar/CalendarSlot';
import { Meal } from '@/types/calendar';

const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const MEAL_TYPES = ['Colazione', 'Spuntino 1', 'Pranzo', 'Spuntino 2', 'Cena'];

import { CalendarControls } from '@/components/calendar/CalendarControls';
import { MealSelectionModal } from '@/components/calendar/MealSelectionModal';

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

            try {
                const res = await fetch('/api/calendar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'move',
                        day: fromDayIndex,
                        type: fromTypeIndex,
                        targetDay: toDayIndex,
                        targetType: toTypeIndex
                    })
                });

                if (!res.ok) {
                    console.error("Failed to sync move");
                    // Optionally revert state here if critical
                }
            } catch (e) {
                console.error("Error moving meal:", e);
            }
        }

        setActiveDrag(null);
    };

    useEffect(() => {
        fetch('/api/meals?limit=100').then(res => res.json()).then(data => {
            // API returns { meals: [], pagination: {} }
            if (data.meals && Array.isArray(data.meals)) {
                setMeals(data.meals);
            } else if (Array.isArray(data)) {
                // Fallback for legacy
                setMeals(data);
            }
        }).catch(err => console.error("Failed to load meals", err));
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
                    newPlan[`${day}-${type}`] = {
                        ...item.pasto,
                        isConsumed: item.isConsumed,
                        calendarItemId: item.id
                    };
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

    const handleCopyPrevious = async () => {
        if (confirm('Vuoi copiare la settimana scorsa al posto di questa?')) {
            await fetch('/api/calendar', {
                method: 'POST',
                body: JSON.stringify({ action: 'copy_previous' })
            });
            loadCalendar();
        }
    };

    const moveForward = async (day: string, type: string) => {
        const currentIdx = DAYS.indexOf(day);
        if (currentIdx >= 6) return; // Can't move from Sunday

        const nextDay = DAYS[currentIdx + 1];
        const nextKey = `${nextDay}-${type}`;
        const currentKey = `${day}-${type}`;
        const meal = plan[currentKey];

        if (!meal) return;

        if (plan[nextKey]) {
            if (!confirm(`Lo slot ${nextDay} - ${type} è occupato. Sovrascrivere?`)) return;
        }

        // Optimistic update
        const newPlan = { ...plan };
        delete newPlan[currentKey];
        newPlan[nextKey] = meal;
        setPlan(newPlan);

        try {
            const currentTypeIdx = MEAL_TYPES.indexOf(type);

            await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'move',
                    day: currentIdx,
                    type: currentTypeIdx,
                    targetDay: currentIdx + 1,
                    targetType: currentTypeIdx
                })
            });
        } catch (e) {
            console.error(e);
            alert('Errore durante lo spostamento');
            loadCalendar(); // Revert on error
        }
    };

    return (
        <div className="p-6 lg:p-10 space-y-8 animate-in-up pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Weekly Plan</h1>
                    <p className="text-muted-foreground mt-2">Organize your Zone meals for the week.</p>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl print:border-none print:shadow-none print:p-0">
                <div className="print:hidden">
                    <CalendarControls
                        onClearWeek={clearWeek}
                        onCopyPrevious={handleCopyPrevious}
                        onGenerate={generateWeek}
                        isClearing={clearing}
                        isGenerating={generating}
                        hasItems={Object.keys(plan).length > 0}
                    />
                </div>

                {error && (
                    <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl print:hidden">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20 print:hidden">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-3 text-muted-foreground">Loading calendar...</span>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={(event) => setActiveDrag(event.active.id as string)}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="mt-6 grid grid-cols-7 gap-4 min-w-[1000px] overflow-x-auto pb-4 print:min-w-0 print:overflow-visible print:gap-1">
                            {DAYS.map((day) => {
                                const dayTotal = MEAL_TYPES.reduce((acc, type) => {
                                    const meal = plan[`${day}-${type}`];
                                    return acc + (meal ? (parseFloat(meal.blocks as any) || 0) : 0);
                                }, 0);

                                const isTargetReached = dayTotal >= 11; // Example target, could be dynamic later

                                return (
                                    <div key={day} className="flex flex-col gap-3 print:gap-1">
                                        <div className={`
                                            flex items-center justify-between px-3 py-2 rounded-xl border transition-colors
                                            ${isTargetReached
                                                ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400'
                                                : 'bg-white/5 border-white/10 text-foreground/80'}
                                        `}>
                                            <span className="font-bold text-sm">{day}</span>
                                            <span className={`text-xs font-mono font-medium ${isTargetReached ? 'text-green-600 dark:text-green-400' : 'opacity-60'}`}>
                                                {dayTotal > 0 ? `${dayTotal} Blk` : '-'}
                                            </span>
                                        </div>
                                        {MEAL_TYPES.map((type) => (
                                            <CalendarSlot
                                                key={`${day}-${type}`}
                                                day={day}
                                                type={type}
                                                plan={plan}
                                                // @ts-ignore
                                                meals={meals} // Passing meals for smart suggestions
                                                handleSelectMeal={handleSelectMeal}
                                                setSelectingFor={setSelectingFor}
                                                clearSlot={clearSlot}
                                                moveForward={moveForward}
                                                onTrack={async (d, t, status) => {
                                                    // Immediately update local state for snappiness if needed, 
                                                    // but for correctness we reload the calendar data to sync strict state
                                                    // In a real optimized app we would shallow merge 'plan' state here.
                                                    // Let's do shallow merge for instant feedback + background refresh
                                                    const key = `${d}-${t}`;
                                                    if (plan[key]) {
                                                        const updatedPlan = { ...plan, [key]: { ...plan[key], isConsumed: status } };
                                                        setPlan(updatedPlan);
                                                    }
                                                    // No await loadCalendar() to avoid flicker, just trust local + api
                                                }}
                                            />
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </DndContext>
                )}
            </div>

            {/* Meal Selection Modal */}
            {selectingFor && (
                <MealSelectionModal
                    day={selectingFor.day}
                    type={selectingFor.type}
                    meals={meals}
                    onSelect={handleSelectMeal}
                    onClose={() => setSelectingFor(null)}
                />
            )}
        </div>
    );
}


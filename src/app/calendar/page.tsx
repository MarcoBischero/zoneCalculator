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

    const handleCopyPrevious = async () => {
        if (confirm('Vuoi copiare la settimana scorsa al posto di questa?')) {
            await fetch('/api/calendar', {
                method: 'POST',
                body: JSON.stringify({ action: 'copy_previous' })
            });
            loadCalendar();
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

            <div className="glass-panel p-6 rounded-2xl">
                <CalendarControls
                    onClearWeek={clearWeek}
                    onCopyPrevious={handleCopyPrevious}
                    onGenerate={generateWeek}
                    isClearing={clearing}
                    isGenerating={generating}
                    hasItems={Object.keys(plan).length > 0}
                />

                {error && (
                    <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
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
                        <div className="mt-6 grid grid-cols-7 gap-4 min-w-[1000px] overflow-x-auto pb-4">
                            {DAYS.map((day) => (
                                <div key={day} className="flex flex-col gap-3">
                                    <div className="text-center font-bold text-sm text-foreground/80 py-3 bg-white/5 rounded-xl border border-white/10">
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


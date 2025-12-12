'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2, Camera, RefreshCw, Copy } from 'lucide-react';
import { PhotoMealModal } from '@/components/calculator/PhotoMealModal';
import { FoodSelector } from '@/components/calculator/FoodSelector';
import { SavedMealsList } from '@/components/calculator/SavedMealsList';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';


export const dynamic = 'force-dynamic';

interface MealRow {
    id: number;
    foodName: string;
    protein: number;
    carbs: number;
    fat: number;
    grams: number;
    blocks: number;
}

import { useSession } from "next-auth/react";

import { Suspense } from 'react';

function CalculatorContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const copyId = searchParams.get('copy');

    const [mealName, setMealName] = useState('My Zone Meal');
    const [mealType, setMealType] = useState('Colazione');
    const [isShared, setIsShared] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

    const [rows, setRows] = useState<MealRow[]>([
        { id: 1, foodName: '', protein: 0, carbs: 0, fat: 0, grams: 0, blocks: 0 },
        { id: 2, foodName: '', protein: 0, carbs: 0, fat: 0, grams: 0, blocks: 0 },
        { id: 3, foodName: '', protein: 0, carbs: 0, fat: 0, grams: 0, blocks: 0 },
        { id: 4, foodName: '', protein: 0, carbs: 0, fat: 0, grams: 0, blocks: 0 },
        { id: 5, foodName: '', protein: 0, carbs: 0, fat: 0, grams: 0, blocks: 0 },
    ]);
    const [totals, setTotals] = useState({
        protein: 0,
        carbs: 0,
        fat: 0,
        blocks: 0,
        blocksP: 0,
        blocksC: 0,
        blocksF: 0,
        calories: 0,
        ratio: 0
    });

    useEffect(() => {
        const mealId = editId || copyId;
        const importData = searchParams.get('import');

        if (importData) {
            try {
                const ingredients = JSON.parse(decodeURIComponent(importData));
                const newRows = ingredients.map((ing: any, i: number) => ({
                    id: i + 1,
                    foodName: ing.name,
                    protein: ing.macros.p,
                    carbs: ing.macros.c,
                    fat: ing.macros.f,
                    grams: ing.grams,
                    blocks: 0
                }));
                while (newRows.length < 5) {
                    newRows.push({
                        id: newRows.length + 1,
                        foodName: '',
                        protein: 0, carbs: 0, fat: 0, grams: 0, blocks: 0
                    });
                }
                setRows(newRows);
                setMealName("AI Chef Creation");
            } catch (e) {
                console.error("Failed to parse imported meal", e);
            }
        } else if (mealId) {
            fetch('/api/meals')
                .then(res => res.json())
                .then((meals: any[]) => {
                    if (!Array.isArray(meals)) {
                        console.error('Failed to load meal data', meals);
                        return;
                    }
                    const meal = meals.find(m => m.codicePasto === parseInt(mealId!));
                    if (meal) {
                        if (editId) setMealName(meal.nome); // Only set name if editing, not copying
                        const newRows = meal.alimenti.map((item: any, index: number) => ({
                            id: index + 1,
                            foodName: item.alimento.nome,
                            protein: item.alimento.proteine,
                            carbs: item.alimento.carboidrati,
                            fat: item.alimento.grassi,
                            grams: item.grAlimento,
                            blocks: 0
                        }));

                        while (newRows.length < 5) {
                            newRows.push({
                                id: newRows.length + 1,
                                foodName: '',
                                protein: 0, carbs: 0, fat: 0, grams: 0, blocks: 0
                            });
                        }
                        setRows(newRows);
                    }
                });
        }
    }, [editId, copyId, searchParams]);

    useEffect(() => {
        const newTotals = rows.reduce((acc, row) => {
            const ratio = row.grams / 100;
            return {
                protein: acc.protein + (row.protein * ratio),
                carbs: acc.carbs + (row.carbs * ratio),
                fat: acc.fat + (row.fat * ratio),
            };
        }, { protein: 0, carbs: 0, fat: 0 });

        const pBlocks = newTotals.protein / 7;
        const cBlocks = newTotals.carbs / 9;
        const fBlocks = newTotals.fat / 1.5;

        // Calories: P*4 + C*4 + F*9
        const calories = (newTotals.protein * 4) + (newTotals.carbs * 4) + (newTotals.fat * 9);

        // Ratio: P / C (avoid division by zero)
        const ratio = newTotals.carbs > 0 ? (newTotals.protein / newTotals.carbs) : 0;

        setTotals({
            protein: parseFloat(newTotals.protein.toFixed(1)),
            carbs: parseFloat(newTotals.carbs.toFixed(1)),
            fat: parseFloat(newTotals.fat.toFixed(1)),
            blocks: parseFloat(pBlocks.toFixed(1)),
            blocksP: parseFloat(pBlocks.toFixed(1)),
            blocksC: parseFloat(cBlocks.toFixed(1)),
            blocksF: parseFloat(fBlocks.toFixed(1)),
            calories: Math.round(calories),
            ratio: parseFloat(ratio.toFixed(2))
        });
    }, [rows]);

    // Load Data for Edit / Import
    useEffect(() => {
        const mealId = editId || copyId;
        const importData = searchParams.get('import');

        if (importData) {
            try {
                const data = JSON.parse(decodeURIComponent(importData));
                // Check if it's the new format { name: "...", ingredients: [...] } or old array format
                const ingredients = Array.isArray(data) ? data : (data.ingredients || []);
                const importedName = !Array.isArray(data) && data.name ? data.name : "AI Chef Meal";

                const newRows = ingredients.map((ing: any, i: number) => ({
                    id: i + 1,
                    foodName: ing.name,
                    protein: ing.macros.p,
                    carbs: ing.macros.c,
                    fat: ing.macros.f,
                    grams: ing.grams,
                    blocks: 0
                }));
                while (newRows.length < 5) {
                    newRows.push({
                        id: newRows.length + 1,
                        foodName: '',
                        protein: 0, carbs: 0, fat: 0, grams: 0, blocks: 0
                    });
                }
                setRows(newRows);
                setMealName(importedName);
            } catch (e) {
                console.error("Failed to parse imported meal", e);
            }
        } else if (mealId) {
            fetch('/api/meals')
                .then(res => res.json())
                .then((meals: any[]) => {
                    if (!Array.isArray(meals)) return;
                    const meal = meals.find(m => m.codicePasto === parseInt(mealId!));
                    if (meal) {
                        const newRows = meal.alimenti.map((item: any, index: number) => ({
                            id: index + 1,
                            foodName: item.alimento.nome,
                            protein: item.alimento.proteine,
                            carbs: item.alimento.carboidrati,
                            fat: item.alimento.grassi,
                            grams: item.grAlimento,
                            blocks: 0
                        }));

                        while (newRows.length < 5) {
                            newRows.push({
                                id: newRows.length + 1,
                                foodName: '',
                                protein: 0, carbs: 0, fat: 0, grams: 0, blocks: 0
                            });
                        }

                        setRows(newRows);
                        // Only overwrite name if we are editing (not copying/template)
                        // Actually for copy we might want "Copy of..." but for now keep same name
                        setMealName(meal.nome);

                        if (meal.mealType && meal.mealType !== '0') {
                            setMealType(meal.mealType);
                        }
                        setIsShared(meal.isShared || false);
                    }
                }).catch(e => console.error(e));
        }
    }, [editId, copyId, searchParams]);

    const updateRow = (index: number, updates: Partial<MealRow>) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], ...updates };
        setRows(newRows);
    };

    const handleGramsChange = (index: number, val: string) => {
        let grams = parseFloat(val);
        if (isNaN(grams) || grams < 0) grams = 0;
        updateRow(index, { grams });
    };

    const handleAddRow = () => {
        setRows([...rows, { id: rows.length + 1, foodName: '', protein: 0, carbs: 0, fat: 0, grams: 0, blocks: 0 }]);
    };

    const handleDeleteRow = (index: number) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows.map((r, i) => ({ ...r, id: i + 1 })));
    };

    const handleSave = async (asNew: boolean = false) => {
        if (!mealName) {
            setSaveMessage({ type: 'error', text: 'Please enter a meal name first.' });
            return;
        }

        setIsSaving(true);
        setSaveMessage(null);

        // If Saving as New, we force ID to undefined
        const idToSend = asNew ? undefined : (editId ? parseInt(editId!) : undefined);

        try {
            console.log('Saving meal:', { id: idToSend, name: mealName, blocks: totals.blocks });
            const res = await fetch('/api/meals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: idToSend,
                    name: mealName,
                    mealType: mealType,
                    blocks: totals.blocks.toString(),
                    rows: rows.filter(r => r.foodName && r.grams > 0),
                    isShared: isShared
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSaveMessage({ type: 'success', text: asNew ? 'Saved as new meal!' : 'Meal updated successfully!' });
                setTimeout(() => {
                    window.location.href = '/meals';
                }, 1000);
            } else {
                console.error('Save failed:', data);
                setSaveMessage({ type: 'error', text: data.error || 'Failed to save meal.' });
            }
        } catch (e) {
            console.error('Network error during save:', e);
            setSaveMessage({ type: 'error', text: 'Network error. Please ensure the backend is running.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container py-6 space-y-8 max-w-7xl relative">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none rounded-3xl" />
            <PhotoMealModal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                onMealGenerated={(newRows) => {
                    // Pad with empty rows if needed
                    while (newRows.length < 5) {
                        newRows.push({
                            id: newRows.length + 1,
                            foodName: '',
                            protein: 0, carbs: 0, fat: 0, grams: 0, blocks: 0
                        });
                    }
                    setRows(newRows);
                    setMealName("Photo Scan Meal");
                }}
            />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-6 rounded-xl shadow-sm border border-border">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent bg-[length:200%_auto] animate-gradient">
                        Meal Builder
                    </h1>
                    <p className="text-muted-foreground">Create perfectly balanced Zone meals.</p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-2 items-center">
                    <div className="flex flex-col gap-1 w-full md:w-auto">
                        <input
                            type="text"
                            value={mealName}
                            onChange={(e) => setMealName(e.target.value)}
                            placeholder="Nome del pasto"
                            className="p-2 rounded-lg glass-card backdrop-blur-xl bg-card/40 border-primary/20 text-foreground text-sm w-full md:w-64 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <select
                            className="p-2 rounded-lg glass-card backdrop-blur-xl bg-card/40 border-primary/20 text-foreground text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                            value={mealType}
                            onChange={(e) => setMealType(e.target.value)}
                        >
                            <option value="Colazione">Colazione</option>
                            <option value="Spuntino 1">Spuntino 1</option>
                            <option value="Pranzo">Pranzo</option>
                            <option value="Spuntino 2">Spuntino 2</option>
                            <option value="Cena">Cena</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={async () => {
                            const name = prompt("Nome del pasto che vuoi generare (es. 'Colazione Energetica'):");
                            if (!name) return;

                            setIsSaving(true);
                            try {
                                const res = await fetch('/api/meals/ai-generate', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        name,
                                        type: mealType,
                                        blocks: Math.round(totals.blocks > 0 ? totals.blocks : 3), // Default to 3 if 0
                                        preference: "Any"
                                    })
                                });
                                const data = await res.json();
                                if (data.success && data.ingredients) {
                                    const newRows = data.ingredients.map((ing: any, i: number) => ({
                                        id: i + 1,
                                        foodName: ing.name,
                                        protein: ing.macros.p,
                                        carbs: ing.macros.c,
                                        fat: ing.macros.f,
                                        grams: ing.grams,
                                        blocks: 0
                                    }));
                                    // Pad
                                    while (newRows.length < 5) {
                                        newRows.push({
                                            id: newRows.length + 1,
                                            foodName: '',
                                            protein: 0, carbs: 0, fat: 0, grams: 0, blocks: 0
                                        });
                                    }
                                    setRows(newRows);
                                    setMealName(name);
                                } else {
                                    alert("AI Generation Failed: " + (data.error || "Unknown"));
                                }
                            } catch (e) {
                                alert("Error contacting AI chef");
                            } finally {
                                setIsSaving(false);
                            }
                        }}
                        className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/50 border border-violet-500/50 transition-all hover:scale-105"
                    >
                        <span className="mr-2">✨</span> AI Chef
                    </Button>
                    <Button variant="outline" className="text-muted-foreground border-border hover:bg-muted" onClick={() => setRows(rows.map(r => ({ ...r, foodName: '', protein: 0, carbs: 0, fat: 0, grams: 0, blocks: 0 })))}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Reset
                    </Button>
                    <Button onClick={() => handleSave(false)} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                        {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button onClick={() => handleSave(true)} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                        <Copy className="w-4 h-4 mr-2" /> Save as New
                    </Button>
                </div>
            </div>


            {/* Status Message */}
            {
                saveMessage && (
                    <div className={cn("p-4 rounded-lg flex items-center gap-2", saveMessage?.type === 'success' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300")}>
                        {saveMessage?.type === 'success' ? <div className="h-2 w-2 rounded-full bg-green-500" /> : <div className="h-2 w-2 rounded-full bg-red-500" />}
                        {saveMessage?.text}
                    </div>
                )
            }

            {
                status === 'unauthenticated' && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
                        <span className="font-bold">⚠️ Authentication Required</span>
                        <span>You are currently not logged in. You can build meals, but you won&apos;t be able to save them. <a href="/login" className="underline font-bold">Log in here</a>.</span>
                    </div>
                )
            }

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Grid */}
                <div className="flex-1 glass-card bg-card/60 backdrop-blur-xl rounded-xl shadow-lg border border-primary/10 overflow-hidden flex flex-col relative z-10">
                    {/* Table Header */}
                    <div className="overflow-x-auto">
                        <div className="min-w-[600px]">
                            <div className="grid grid-cols-12 gap-2 md:gap-4 p-3 md:p-4 bg-gradient-to-r from-secondary/80 to-secondary/60 text-secondary-foreground font-bold text-xs md:text-sm uppercase tracking-wide">
                                <div className="col-span-4">Food Item</div>
                                <div className="col-span-1 text-center">P</div>
                                <div className="col-span-1 text-center">C</div>
                                <div className="col-span-1 text-center">F</div>
                                <div className="col-span-2 text-center">Grams</div>
                                <div className="col-span-2 text-center">Real Values</div>
                                <div className="col-span-1 text-center">Act</div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-border flex-1">
                                {rows.map((row, index) => {
                                    const ratio = row.grams / 100;
                                    const realP = (row.protein * ratio).toFixed(1);
                                    const realC = (row.carbs * ratio).toFixed(1);
                                    const realF = (row.fat * ratio).toFixed(1);

                                    return (
                                        <div key={row.id} className={`grid grid-cols-12 gap-2 md:gap-4 p-3 md:p-4 items-center ${index % 2 === 0 ? 'bg-muted/30' : 'bg-card'} hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300`}>
                                            {/* Food Selector */}
                                            <div className="col-span-4">
                                                <FoodSelector
                                                    value={row.foodName}
                                                    onSelect={(food) => updateRow(index, {
                                                        foodName: food.nome,
                                                        protein: food.proteine,
                                                        carbs: food.carboidrati,
                                                        fat: food.grassi
                                                    })}
                                                />
                                            </div>
                                            {/* Removed redundant Meal Type selector */}

                                            {(session?.user as any)?.role == 2 && (
                                                <div className="flex items-center space-x-2 pt-2">
                                                    <input
                                                        type="checkbox"
                                                        id="share"
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                        checked={isShared}
                                                        onChange={e => setIsShared(e.target.checked)}
                                                    />
                                                    <Label htmlFor="share" className="text-sm font-medium text-slate-700">
                                                        Condividi con i tuoi Pazienti
                                                    </Label>
                                                </div>
                                            )}
                                            {/* Macros per 100g (Read only) */}
                                            <div className="col-span-1 text-center text-xs md:text-sm font-semibold text-foreground/80">{row.protein}</div>
                                            <div className="col-span-1 text-center text-xs md:text-sm font-semibold text-foreground/80">{row.carbs}</div>
                                            <div className="col-span-1 text-center text-xs md:text-sm font-semibold text-foreground/80">{row.fat}</div>

                                            {/* Grams Input */}
                                            <div className="col-span-2 flex items-center justify-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-16 md:w-20 p-1.5 text-center border rounded-lg glass-card bg-background/40 backdrop-blur-sm border-primary/20 text-foreground font-bold focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all"
                                                    value={row.grams || ''}
                                                    onChange={(e) => handleGramsChange(index, e.target.value)}
                                                    placeholder="0"
                                                    onFocus={(e) => e.target.select()}
                                                />
                                            </div>

                                            {/* Real Calculated Values */}
                                            <div className="col-span-2 flex justify-center gap-1 text-[10px] font-bold font-mono">
                                                <span className={cn("border px-1 py-0.5 rounded min-w-[30px] text-center flex items-center justify-center", parseFloat(realP) > 0 ? "bg-red-500/20 border-red-500/40 text-red-300" : "bg-muted text-muted-foreground border-border")}>
                                                    {realP}
                                                </span>
                                                <span className={cn("border px-1 py-0.5 rounded min-w-[30px] text-center flex items-center justify-center", parseFloat(realC) > 0 ? "bg-green-500/20 border-green-500/40 text-green-300" : "bg-muted text-muted-foreground border-border")}>
                                                    {realC}
                                                </span>
                                                <span className={cn("border px-1 py-0.5 rounded min-w-[30px] text-center flex items-center justify-center", parseFloat(realF) > 0 ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-300" : "bg-muted text-muted-foreground border-border")}>
                                                    {realF}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-1 flex justify-center">
                                                <button
                                                    onClick={() => handleDeleteRow(index)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors p-1.5 hover:bg-destructive/10 rounded-full"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Add Row Button - Direct Access */}
                            <div className="bg-card p-2 border-t border-border flex justify-center">
                                <Button variant="ghost" onClick={handleAddRow} className="w-full border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary hover:bg-accent/5 font-medium h-12">
                                    <Plus className="w-4 h-4 mr-2" /> Add Food Item
                                </Button>
                            </div>

                            {/* Footer / Summary */}
                            <div className="glass-card bg-secondary/10 backdrop-blur-sm text-foreground p-4 border-t border-primary/10">
                                <div className="flex flex-col md:flex-row justify-end items-center gap-6">

                                    {/* Actions Left (Removed as Add Row is moved up) */}
                                    {/* 
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={handleAddRow} className="text-secondary hover:bg-secondary/20 font-medium">
                                    <Plus className="w-4 h-4 mr-2" /> Add Row
                                </Button>
                            </div> 
                            */}

                                    {/* Dense Stats Board */}
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex gap-4 text-xs">
                                            <div className="glass-card bg-card/60 backdrop-blur-md px-3 py-1.5 rounded-lg border-l-4 border-l-orange-500 border-t border-r border-b border-border/50 shadow-sm">
                                                <span className="text-muted-foreground uppercase tracking-wider text-[10px] block mb-0.5">Calories</span>
                                                <span className="text-lg font-bold text-foreground">{totals.calories}</span>
                                            </div>
                                            <div className="glass-card bg-card/60 backdrop-blur-md px-3 py-1.5 rounded-lg border-l-4 border-l-cyan-500 border-t border-r border-b border-border/50 shadow-sm">
                                                <span className="text-muted-foreground uppercase tracking-wider text-[10px] block mb-0.5">P/C Ratio</span>
                                                <span className={cn("text-lg font-bold", totals.ratio >= 0.6 && totals.ratio <= 0.8 ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400")}>
                                                    {totals.ratio}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 text-sm glass-card bg-card/60 backdrop-blur-md p-2 rounded-lg border-l-4 border-l-violet-500 border-t border-r border-b border-border/50 shadow-sm">
                                            {/* Breakdown Table Mini */}
                                            <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-right">
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase self-center"></span>
                                                <span className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase self-center">Prot</span>
                                                <span className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase self-center">Carb</span>
                                                <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold uppercase self-center">Fat</span>

                                                <span className="text-[10px] text-muted-foreground uppercase font-bold self-center text-left">Grams</span>
                                                <span className="font-mono font-bold text-foreground">{totals.protein}</span>
                                                <span className="font-mono font-bold text-foreground">{totals.carbs}</span>
                                                <span className="font-mono font-bold text-foreground">{totals.fat}</span>

                                                <span className="text-[10px] text-muted-foreground uppercase font-bold self-center text-left">Blocks</span>
                                                <span className="font-mono font-bold text-red-600 dark:text-red-400">{totals.blocksP}</span>
                                                <span className="font-mono font-bold text-green-600 dark:text-green-400">{totals.blocksC}</span>
                                                <span className="font-mono font-bold text-yellow-600 dark:text-yellow-400">{totals.blocksF}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* My Saved Meals Sidebar */}
                    <div className="w-full lg:w-80 flex-shrink-0 relative z-10">
                        <div className="glass-panel backdrop-blur-xl bg-card/50 border-primary/10 rounded-xl shadow-sm p-4 h-full">
                            <h3 className="font-bold text-foreground mb-4 sticky top-0 bg-card">My Saved Meals</h3>
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                <SavedMealsList />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CalculatorPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading Calculator...</div>}>
            <CalculatorContent />
        </Suspense>
    );
}



'use client';
import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw, Trash2, Camera, Settings2, Info, Plus } from 'lucide-react';
import { PhotoMealModal } from '@/components/calculator/PhotoMealModal';
import { ZoneSearch } from '@/components/calculator/ZoneSearch';
import { MealBlock } from '@/components/calculator/MealBlock';
import { MealTotalsPanel } from '@/components/calculator/MealTotalsPanel';
import { useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';

export const dynamic = 'force-dynamic';

interface MealRow {
    foodName: string;
    protein: number;
    carbs: number;
    fat: number;
    grams: number;
    // Helper to track unique ID for list performance
    uniqueId: string;
    codiceAlimento?: number;
}

function CalculatorContent() {
    const { t } = useLanguage();
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const copyId = searchParams.get('copy');

    const [rows, setRows] = useState<MealRow[]>([]);
    const [mealName, setMealName] = useState('My Meal');
    const [mealType, setMealType] = useState('1'); // Default to Lunch
    const [isSaving, setIsSaving] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [totals, setTotals] = useState({
        protein: 0, carbs: 0, fat: 0,
        blocksP: 0, blocksC: 0, blocksF: 0,
        calories: 0
    });

    const importParam = searchParams.get('import');

    // Initial Load Logic (Edit/Copy/Import)
    useEffect(() => {
        const idToLoad = editId || copyId;

        if (importParam) {
            try {
                const parsed = JSON.parse(decodeURIComponent(importParam));
                console.log("Importing meal data:", parsed);
                if (parsed.name) setMealName(parsed.name);
                if (Array.isArray(parsed.ingredients)) {
                    const newRows = parsed.ingredients.map((ing: any) => ({
                        foodName: ing.name,
                        protein: Number(ing.macros.p) || 0,
                        carbs: Number(ing.macros.c) || 0,
                        fat: Number(ing.macros.f) || 0,
                        grams: Number(ing.grams) || 100,
                        uniqueId: Math.random().toString(36).substr(2, 9),
                        codiceAlimento: 0 // Treat as new/generic items
                    }));
                    setRows(newRows);
                }
            } catch (e) {
                console.error("Failed to parse import data", e);
            }
        } else if (idToLoad) {
            console.log("Loading meal to edit:", idToLoad);
            fetch(`/api/meals?id=${idToLoad}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch meal data");
                    return res.json();
                })
                .then(data => {
                    console.log("Meal API Response:", data);
                    // API returns { meals: [...] } or just array in some fallback cases
                    const list = data.meals || (Array.isArray(data) ? data : []);
                    const found = list.find((m: any) => m.codicePasto === parseInt(idToLoad));

                    if (found) {
                        console.log("Found meal:", found);
                        setMealName(found.nome + (copyId ? ' (Copy)' : ''));
                        setMealType(found.mealType || '1');

                        // Robust mapping
                        if (Array.isArray(found.alimenti)) {
                            const newRows = found.alimenti.map((a: any) => {
                                // Safeguard against broken relations
                                if (!a.alimento) {
                                    console.warn("Missing alimento relation for item:", a);
                                    return null;
                                }
                                return {
                                    foodName: a.alimento.nome || "Unknown Food",
                                    protein: Number(a.alimento.proteine) || 0,
                                    carbs: Number(a.alimento.carboidrati) || 0,
                                    fat: Number(a.alimento.grassi) || 0,
                                    grams: Number(a.grAlimento) || 100, // Explicit Number conversion
                                    uniqueId: Math.random().toString(36).substr(2, 9),
                                    codiceAlimento: a.codiceAlimento
                                };
                            }).filter((row: any) => row !== null) as MealRow[];

                            console.log("Mapped rows:", newRows);
                            setRows(newRows);
                        } else {
                            console.warn("found.alimenti is not an array:", found.alimenti);
                        }
                    } else {
                        console.error("Meal not found in response list");
                        // Optional fallback: maybe fetch directly by ID if not searching list?
                        // But current API pattern seems to support list search.
                    }
                })
                .catch(err => console.error("Error loading meal:", err));
        }
    }, [editId, copyId, importParam]);

    // Recalculate Totals
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

        setTotals({
            protein: Math.round(newTotals.protein),
            carbs: Math.round(newTotals.carbs),
            fat: Math.round(newTotals.fat),
            blocksP: parseFloat(pBlocks.toFixed(1)),
            blocksC: parseFloat(cBlocks.toFixed(1)),
            blocksF: parseFloat(fBlocks.toFixed(1)),
            calories: Math.round((newTotals.protein * 4) + (newTotals.carbs * 4) + (newTotals.fat * 9))
        });
    }, [rows]);

    const handleAddFood = (food: any) => {
        setRows([...rows, {
            foodName: food.nome,
            protein: food.proteine,
            carbs: food.carboidrati,
            fat: food.grassi,
            grams: 100, // Default to 100g
            uniqueId: Math.random().toString(36).substr(2, 9),
            codiceAlimento: food.codiceAlimento
        }]);
    };

    const handleUpdateGrams = (index: number, grams: number) => {
        const newRows = [...rows];
        newRows[index].grams = grams;
        setRows(newRows);
    };

    const handleDeleteRow = (index: number) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!session) return;
        setIsSaving(true);
        console.log("Saving meal...", { editId, mealType, mealName, totals, rows });

        try {
            const payload = {
                id: (editId && !copyId) ? parseInt(editId) : undefined,
                date: new Date().toISOString(),
                type: mealType,
                name: mealName,
                blocks: totals.blocksP,
                foods: rows.map(r => ({
                    codiceAlimento: r.codiceAlimento || 0,
                    nome: r.foodName,
                    proteine: r.protein,
                    carboidrati: r.carbs,
                    grassi: r.fat,
                    grams: r.grams
                }))
            };

            console.log("Payload to send:", payload);

            const res = await fetch('/api/meals', {
                method: 'POST', // Simplified: always POST for now, handle edit later
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log("Save response status:", res.status);

            if (res.ok) {
                const data = await res.json();
                console.log("Save success:", data);
                router.push('/meals');
            } else {
                const err = await res.json();
                console.error("Save failed:", err);
                alert(`Error saving meal: ${err.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error("Exception during save:", e);
            alert("Exception during save. Check console.");
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8 animate-in-up pb-32">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">{t('calculator.title')}</h1>
                    <p className="text-muted-foreground mt-2">{t('calculator.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsPhotoModalOpen(true)}>
                        <Camera className="w-4 h-4 mr-2" /> {t('calculator.ai_chef')}
                    </Button>
                    <Button variant="outline" onClick={() => setRows([])}>
                        <RefreshCw className="w-4 h-4 mr-2" /> {t('calculator.clear')}
                    </Button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left: Builder Canvas */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Search Bar (Floating) */}
                    <div className="sticky top-6 z-40">
                        <ZoneSearch onSelect={handleAddFood} />
                    </div>

                    {/* Food Stack */}
                    <div className="space-y-3 min-h-[300px]">
                        {rows.length === 0 ? (
                            <div className="border-2 border-dashed border-border/50 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                                <div className="p-4 bg-muted/50 rounded-full mb-4">
                                    <Button size="icon" variant="ghost" className="h-12 w-12 pointer-events-none">
                                        <Plus className="w-8 h-8 text-muted-foreground/50" />
                                    </Button>
                                </div>
                                <p className="font-medium">{t('calculator.empty_plate')}</p>
                                <p className="text-sm mt-1">{t('calculator.search_prompt')}</p>
                            </div>
                        ) : (
                            rows.map((row, i) => (
                                <MealBlock
                                    key={row.uniqueId}
                                    foodName={row.foodName}
                                    protein={row.protein}
                                    carbs={row.carbs}
                                    fat={row.fat}
                                    grams={row.grams}
                                    onChangeGrams={(val) => handleUpdateGrams(i, val)}
                                    onDelete={() => handleDeleteRow(i)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Real-time Stats Panel */}
                <div className="lg:col-span-1">
                    <MealTotalsPanel
                        totals={totals}
                        mealType={mealType}
                        setMealType={setMealType}
                        mealName={mealName}
                        setMealName={setMealName}
                        onSave={handleSave}
                        isSaving={isSaving}
                        hasItems={rows.length > 0}
                    />
                </div>

            </div>

            <PhotoMealModal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                onMealGenerated={(newRows) => {
                    // Map generic rows to our specific structure if needed, or just set them
                    // Ensure they have unique IDs
                    const processedRows = newRows.map(r => ({
                        ...r,
                        uniqueId: Math.random().toString(36).substr(2, 9)
                    }));
                    setRows(processedRows);

                    // Generate smart name: "Chicken & Rice" or "Top Ingredient 1, Top Ingredient 2"
                    // Sort by grams descending to find "main" ingredients
                    const sorted = [...processedRows].sort((a, b) => b.grams - a.grams);
                    const topNames = sorted.slice(0, 2).map(r => r.foodName);
                    const dateStr = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });

                    let smartName = "AI Meal";
                    if (topNames.length > 0) {
                        smartName = topNames.join(' & ');
                    }
                    setMealName(`${smartName} (${dateStr})`);
                }}
            />
            {/* Debug Panel - Only for Super Admin (Role 1) */}
            {Number(session?.user?.role) === 1 && (
                <div className="bg-slate-100 p-4 rounded text-xs font-mono text-slate-600 overflow-auto max-h-40">
                    <p><strong>DEBUG INFO (Admin Only):</strong></p>
                    <p>Edit ID: {editId || 'None'}</p>
                    <p>Rows Loaded: {rows.length}</p>
                    <p>Meal Name: {mealName}</p>
                    <details>
                        <summary>Raw Rows Data</summary>
                        <pre>{JSON.stringify(rows, null, 2)}</pre>
                    </details>
                </div>
            )}
        </div>
    );
}

export default function CalculatorPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <CalculatorContent />
        </Suspense>
    );
}


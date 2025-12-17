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

// ... imports
import { motion, Variants } from 'framer-motion';

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

    // ... (Keep existing useEffect logic for loading/importing data unchanged)
    useEffect(() => {
        const idToLoad = editId || copyId;

        if (importParam) {
            try {
                let decoded = importParam;
                try {
                    decoded = decodeURIComponent(importParam);
                } catch (e) {
                    console.warn("URI decode failed, attempting to parse raw string", e);
                }

                const parsed = JSON.parse(decoded);
                if (parsed.name) setMealName(parsed.name);
                if (Array.isArray(parsed.ingredients)) {
                    const newRows = parsed.ingredients.map((ing: any) => ({
                        foodName: ing.name,
                        protein: Number(ing.macros.p) || 0,
                        carbs: Number(ing.macros.c) || 0,
                        fat: Number(ing.macros.f) || 0,
                        grams: Number(ing.grams) || 100,
                        uniqueId: Math.random().toString(36).substr(2, 9),
                        codiceAlimento: 0
                    }));
                    setRows(newRows);
                }
            } catch (e) {
                console.error("Failed to parse import data", e);
            }
        } else if (idToLoad) {
            fetch(`/api/meals?id=${idToLoad}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (!data) return;
                    const list = data.meals || (Array.isArray(data) ? data : []);
                    const found = list.find((m: any) => m.codicePasto === parseInt(idToLoad));
                    if (found) {
                        setMealName(found.nome + (copyId ? ' (Copy)' : ''));
                        setMealType(found.mealType || '1');
                        if (Array.isArray(found.alimenti)) {
                            const newRows = found.alimenti.map((a: any) => {
                                if (!a.alimento) return null;
                                return {
                                    foodName: a.alimento.nome,
                                    protein: Number(a.alimento.proteine) || 0,
                                    carbs: Number(a.alimento.carboidrati) || 0,
                                    fat: Number(a.alimento.grassi) || 0,
                                    grams: Number(a.grAlimento) || 100,
                                    uniqueId: Math.random().toString(36).substr(2, 9),
                                    codiceAlimento: a.codiceAlimento
                                };
                            }).filter((row: any) => row !== null) as MealRow[];
                            setRows(newRows);
                        }
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
            grams: 100,
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

            const res = await fetch('/api/meals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push('/meals');
            } else {
                const err = await res.json();
                alert(`Error saving meal: ${err.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error(e);
            alert("Exception during save.");
        } finally {
            setIsSaving(false);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 pb-32 lg:pb-10"
        >

            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{t('calculator.title')}</h1>
                    <p className="text-muted-foreground mt-2 text-lg">{t('calculator.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-10 px-4 rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setIsPhotoModalOpen(true)}>
                        <Camera className="w-4 h-4 mr-2" /> {t('calculator.ai_chef')}
                    </Button>
                    <Button variant="ghost" className="h-10 px-4 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setRows([])}>
                        <RefreshCw className="w-4 h-4 mr-2" /> {t('calculator.clear')}
                    </Button>
                </div>
            </motion.div>

            {/* Main Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left: Builder Canvas */}
                <motion.div variants={containerVariants} className="lg:col-span-2 space-y-6">

                    {/* Search Bar (Floating) */}
                    <motion.div variants={itemVariants} className="sticky top-6 z-40 bg-background/80 backdrop-blur-md p-1 rounded-2xl shadow-lg shadow-black/5 border border-white/5">
                        <ZoneSearch onSelect={handleAddFood} />
                    </motion.div>

                    {/* Food Stack */}
                    <div className="space-y-3 min-h-[300px]">
                        {rows.length === 0 ? (
                            <motion.div variants={itemVariants} className="border-2 border-dashed border-border/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center h-[400px] text-muted-foreground bg-secondary/5">
                                <div className="p-6 bg-background rounded-full mb-6 shadow-sm">
                                    <Plus className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                                <p className="font-medium text-lg text-foreground">{t('calculator.empty_plate')}</p>
                                <p className="text-sm mt-2 max-w-xs mx-auto">{t('calculator.search_prompt')}</p>
                            </motion.div>
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
                </motion.div>

                {/* Right: Real-time Stats Panel */}
                <motion.div variants={itemVariants} className="lg:col-span-1">
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
                </motion.div>

            </div>

            <PhotoMealModal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                onMealGenerated={(newRows) => {
                    const processedRows = newRows.map(r => ({
                        ...r,
                        uniqueId: Math.random().toString(36).substr(2, 9)
                    }));
                    setRows(processedRows);

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
        </motion.div>
    );
}

export default function CalculatorPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <CalculatorContent />
        </Suspense>
    );
}


'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, ChefHat, ThermometerSun, Refrigerator, ArrowRight, Loader2, Utensils, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

// Mock DB for "fridge" ingredients (normally fetched from API or Food DB)
// Mock DB for "fridge" ingredients (normally fetched from API or Food DB)
const SAMPLE_INGREDIENTS = [
    { id: 1, name: 'Petto di Pollo', type: 'PROTEIN', P: 23, C: 0, F: 1 },
    { id: 2, name: 'Salmone', type: 'PROTEIN', P: 20, C: 0, F: 13 },
    { id: 3, name: 'Uova', type: 'PROTEIN', P: 13, C: 1, F: 11 },
    { id: 4, name: 'Broccoli', type: 'CARBS', P: 3, C: 7, F: 0 },
    { id: 5, name: 'Mela', type: 'CARBS', P: 0, C: 14, F: 0 },
    { id: 6, name: 'Avena', type: 'CARBS', P: 16, C: 66, F: 7 },
    { id: 7, name: 'Mandorle', type: 'FAT', P: 21, C: 22, F: 49 },
    { id: 8, name: 'Olio d\'Oliva', type: 'FAT', P: 0, C: 0, F: 100 },
    { id: 9, name: 'Avocado', type: 'FAT', P: 2, C: 9, F: 15 },
    { id: 10, name: 'Yogurt Greco', type: 'PROTEIN', P: 10, C: 3, F: 0 },
];

export default function ChefPage() {
    const { t } = useLanguage();
    const [mode, setMode] = useState<'fridge' | 'zone'>('zone'); // Default to Zone mode as it's the unique selling point

    // Fridge Mode State
    const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);

    // Zone Mode State
    const [zoneBlocks, setZoneBlocks] = useState(3);
    const [mealTime, setMealTime] = useState('Lunch');
    const [preference, setPreference] = useState('Any');

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedRecipe, setGeneratedRecipe] = useState<any | null>(null);

    const toggleIngredient = (id: number) => {
        if (selectedIngredients.includes(id)) {
            setSelectedIngredients(selectedIngredients.filter(i => i !== id));
        } else {
            setSelectedIngredients([...selectedIngredients, id]);
        }
    };

    // Manual Input State
    const [manualInput, setManualInput] = useState('');
    const [manualIngredients, setManualIngredients] = useState<string[]>([]);

    const addManualIngredient = () => {
        if (manualInput.trim()) {
            setManualIngredients([...manualIngredients, manualInput.trim()]);
            setManualInput('');
        }
    };

    const removeManualIngredient = (index: number) => {
        setManualIngredients(manualIngredients.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGeneratedRecipe(null);

        try {
            const body = mode === 'fridge'
                ? {
                    mode: 'fridge',
                    ingredients: SAMPLE_INGREDIENTS.filter(i => selectedIngredients.includes(i.id)).map(i => i.name),
                    manualIngredients,
                    blocks: 3 // Default for fridge mode
                }
                : {
                    mode: 'zone',
                    blocks: zoneBlocks,
                    mealTime,
                    preference
                };

            const res = await fetch('/api/chef', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to generate recipe');
            }

            setGeneratedRecipe(result.data);

        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Error generating recipe. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const getExportUrl = () => {
        if (!generatedRecipe) return '#';
        // Export structure matching CalculatorPage expectation
        const payload = {
            name: generatedRecipe.title,
            ingredients: generatedRecipe.ingredients
        };
        const data = encodeURIComponent(JSON.stringify(payload));
        return `/calculator?import=${data}`;
    };

    // Helper to calc block totals for display
    const getRecipeTotals = () => {
        if (!generatedRecipe) return { p: 0, c: 0, f: 0 };
        let p = 0, c = 0, f = 0;
        generatedRecipe.ingredients.forEach((i: any) => {
            const ratio = i.grams / 100;
            p += (i.macros.p * ratio) / 7;
            c += (i.macros.c * ratio) / 9;
            f += (i.macros.f * ratio) / 1.5; // Standard Zone Fat Block = 1.5g (if assuming lean protein base)
            // Note: Advanced Zone often counts 3g fat/block if including hidden fats, but stick to standard math for now
        });
        return { p: p.toFixed(1), c: c.toFixed(1), f: f.toFixed(1) };
    };

    const totals = getRecipeTotals();

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-zone-orange-500" />
                        AI Chef
                    </h1>
                    <p className="text-slate-500">Let our advanced algorithms design your perfect Zone meal.</p>
                </div>
            </div>

            {/* Mode Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                    onClick={() => setMode('fridge')}
                    className={cn(
                        "cursor-pointer rounded-2xl p-6 border-2 transition-all hover:scale-[1.02]",
                        mode === 'fridge' ? "border-zone-blue-500 bg-white shadow-xl ring-4 ring-zone-blue-500/10" : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                    )}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className={cn("p-3 rounded-xl", mode === 'fridge' ? "bg-zone-blue-100 text-zone-blue-600" : "bg-slate-100 text-slate-500")}>
                            <Refrigerator className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">What&apos;s in my Fridge?</h3>
                            <p className="text-slate-500 text-sm">I have ingredients, I need a recipe.</p>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setMode('zone')}
                    className={cn(
                        "cursor-pointer rounded-2xl p-6 border-2 transition-all hover:scale-[1.02]",
                        mode === 'zone' ? "border-zone-orange-500 bg-white shadow-xl ring-4 ring-zone-orange-500/10" : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                    )}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className={cn("p-3 rounded-xl", mode === 'zone' ? "bg-zone-orange-100 text-zone-orange-600" : "bg-slate-100 text-slate-500")}>
                            <ChefHat className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">I feel ZonEd</h3>
                            <p className="text-slate-500 text-sm">I have a block target, surprise me.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {mode === 'fridge' ? (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800">Select Available Ingredients</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {SAMPLE_INGREDIENTS.map(ing => (
                                <button
                                    key={ing.id}
                                    onClick={() => toggleIngredient(ing.id)}
                                    className={cn(
                                        "p-3 rounded-lg border text-sm font-medium transition-all text-left flex flex-col justify-between h-20",
                                        selectedIngredients.includes(ing.id)
                                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-inner"
                                            : "border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    <span>{ing.name}</span>
                                    <span className="text-[10px] uppercase opacity-70 bg-white/50 px-1 rounded w-fit">{ing.type}</span>
                                </button>
                            ))}
                        </div>

                        {/* Manual Input Section */}
                        <div className="mt-6 border-t pt-4 border-slate-100">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Add Other Ingredients (What else is in the fridge?)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addManualIngredient()}
                                    placeholder="e.g., Leftover Pasta, Half a Lemon..."
                                    className="flex-1 p-3 rounded-lg border border-slate-200 text-sm"
                                />
                                <Button onClick={addManualIngredient} variant="outline" className="h-auto">
                                    <Plus className="w-4 h-4 mr-2" /> Add
                                </Button>
                            </div>

                            {manualIngredients.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {manualIngredients.map((item, idx) => (
                                        <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-indigo-100">
                                            {item}
                                            <button onClick={() => removeManualIngredient(idx)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button
                                size="lg"
                                disabled={selectedIngredients.length === 0 || isGenerating}
                                onClick={handleGenerate}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                            >
                                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                                {isGenerating ? "Cooking..." : "Generate Recipe"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800">Configure Your Zone Experience</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">How hungry are you? (Blocks)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1" max="6" step="1"
                                        value={zoneBlocks}
                                        onChange={(e) => setZoneBlocks(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-zone-orange-500"
                                    />
                                    <span className="text-3xl font-black text-zone-orange-500 w-12 text-center">{zoneBlocks}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">1 Block = Snack, 3-4 Blocks = Main Meal</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Meal Time</label>
                                <div className="flex gap-2">
                                    {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setMealTime(t)}
                                            className={cn(
                                                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors border",
                                                mealTime === t
                                                    ? "bg-slate-800 text-white border-slate-800"
                                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Dietary Preference</label>
                            <div className="flex gap-2 flex-wrap">
                                {['Any', 'Meat', 'Fish', 'Vegetarian', 'Vegan'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPreference(p)}
                                        className={cn(
                                            "py-2 px-3 rounded-lg text-sm font-medium transition-colors border",
                                            preference === p
                                                ? "bg-slate-800 text-white border-slate-800"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button
                                size="lg"
                                disabled={isGenerating}
                                onClick={handleGenerate}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                            >
                                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                                {isGenerating ? "Designing..." : "Create Perfect Meal"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Area */}
            {generatedRecipe && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="bg-slate-900 p-6 border-b border-slate-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold mb-1 text-white">{generatedRecipe.title}</h2>
                                <p className="text-slate-300">{generatedRecipe.description}</p>
                            </div>
                            <div className="bg-orange-500 text-white px-4 py-2 rounded-xl font-black text-xl shadow-lg border border-orange-400">
                                {generatedRecipe.blocks} BLK
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold">{t('chef.ingredients_col')}</th>
                                    <th className="px-4 py-3 text-right font-bold">{t('chef.amount_col')}</th>
                                    <th className="px-4 py-3 text-right font-bold hidden md:table-cell">{t('chef.details_col')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {generatedRecipe.ingredients.map((ing: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-medium text-slate-800">{ing.name}</td>
                                        <td className="px-4 py-3 text-right font-bold text-blue-600">{Math.round(ing.grams)}g</td>
                                        <td className="px-4 py-3 text-right text-slate-400 text-xs hidden md:table-cell">
                                            High quality source
                                        </td>
                                    </tr>
                                ))}
                                {/* Totals Footer */}
                                <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                                    <td className="px-4 py-3 text-slate-700">{t('chef.total_nutrients')}</td>
                                    <td className="px-4 py-3 text-right text-slate-900" colSpan={2}>
                                        <span className="text-red-500 mr-3">P: {Math.round(parseFloat(String(totals.p)) * 7)}g</span>
                                        <span className="text-green-500 mr-3">C: {Math.round(parseFloat(String(totals.c)) * 9)}g</span>
                                        <span className="text-yellow-500">F: {Math.round(parseFloat(String(totals.f)) * 1.5)}g</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mt-8 flex justify-end gap-3">
                            <Button variant="outline">{t('common.save')}</Button>
                            <Link href={getExportUrl()}>
                                <Button className="bg-green-600 hover:bg-green-700 text-white">
                                    <Utensils className="w-4 h-4 mr-2" /> {t('chef.send_to_builder')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

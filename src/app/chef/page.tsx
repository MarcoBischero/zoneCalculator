'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, ChefHat, ThermometerSun, Refrigerator, ArrowRight, Loader2, Utensils, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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

    const handleGenerate = () => {
        setIsGenerating(true);
        setGeneratedRecipe(null);

        // Simulate AI Delay
        setTimeout(() => {
            if (mode === 'fridge') {
                generateFridgeRecipe();
            } else {
                generateZoneRecipe();
            }
            setIsGenerating(false);
        }, 2000);
    };

    const generateFridgeRecipe = () => {
        // Mock logic: combine selected ingredients into a balanced meal if possible
        const ingredients = SAMPLE_INGREDIENTS.filter(i => selectedIngredients.includes(i.id));
        const allIngredientNames = [...ingredients.map(i => i.name), ...manualIngredients];

        // If manual ingredients are present, we skip the strict P/C/F check for now or assume they fill gaps
        const hasManual = manualIngredients.length > 0;

        // Simple heuristic: Do we have P, C, and F?
        const hasP = ingredients.some(i => i.type === 'PROTEIN');
        const hasC = ingredients.some(i => i.type === 'CARBS');
        const hasF = ingredients.some(i => i.type === 'FAT');

        if ((!hasP || !hasC) && !hasManual) {
            setGeneratedRecipe({
                title: "Incomplete Meal Warning",
                description: "You are missing key macronutrients (Protein/Carbs) for a Zone meal. Try adding more ingredients!",
                blocks: 0,
                ingredients: []
            });
            return;
        }

        const blocks = 3; // Assuming a default of 3 blocks for fridge mode for now
        const customText = manualIngredients.join(', '); // Combine manual ingredients into custom text

        const prompt = `
                Create a balanced Zone Diet meal using the following ingredients:
                ${allIngredientNames.join(', ')}
                ${customText ? `\nAdditional items/preferences: ${customText}` : ''}

                TARGET BLOCKS: ${blocks} Blocks
                
                CRITICAL ZONE DIET RULES:
                - 1 Block Protein = 7g Protein
                - 1 Block Carbs = 9g Carbs
                - 1 Block Fat = 1.5g Fat (assuming added fat to lean protein)

                Total Macros Target for ${blocks} Blocks:
                - Protein: ${blocks * 7}g
                - Carbs: ${blocks * 9}g
                - Fat: ${blocks * 1.5}g

                Constraint: You must try to use the selected ingredients. If they are not enough to reach the target blocks, suggesting adding common Zone-friendly ingredients (e.g. Olive Oil, Almonds for fat; Apple, Spinach for carbs; Chicken, Tofu for protein).
                
                Return a JSON array of ingredients to build this meal. 
                Format: [{"name": "Chicken Breast", "grams": 120, "macros": { "p": 26, "c": 0, "f": 1.5 }}]
                The 'macros' in the JSON must be the values PER 100g of the food item.
                Calculate 'grams' so that the total meal matches the target blocks.
            `;
        setGeneratedRecipe({
            title: "Fridge Scramble Delight",
            description: "A quick balanced mix of your available ingredients.",
            blocks: blocks,
            ingredients: [
                ...ingredients.map(i => ({
                    name: i.name,
                    grams: 100, // Mock amount
                    macros: { p: i.P, c: i.C, f: i.F }
                })),
                ...manualIngredients.map(name => ({
                    name: name,
                    grams: 50, // Estimate
                    macros: { p: 7, c: 9, f: 3 } // Generic balanced assumption for demo
                }))
            ]
        });
    };

    const generateZoneRecipe = () => {
        let template: any[] = [];
        let title = "";

        // Randomization Arrays with correct macros per 100g
        // Randomization Arrays with correct macros per 100g
        const proteins = [
            { name: 'Petto di Pollo', p: 23, c: 0, f: 1 },
            { name: 'Fesa di Tacchino', p: 24, c: 0, f: 1 },
            { name: 'Merluzzo', p: 18, c: 0, f: 1 },
            { name: 'Salmone', p: 20, c: 0, f: 13 },
            { name: 'Tofu', p: 8, c: 2, f: 4 },
            { name: 'Albumi', p: 11, c: 1, f: 0 },
            { name: 'Manzo Magro', p: 26, c: 0, f: 15 },
        ];

        const carbs = [
            { name: 'Broccoli', p: 3, c: 7, f: 0 },
            { name: 'Fagiolini', p: 2, c: 7, f: 0 },
            { name: 'Spinaci', p: 3, c: 4, f: 0 },
            { name: 'Mela', p: 0, c: 14, f: 0 },
            { name: 'Pera', p: 0, c: 15, f: 0 },
            { name: 'Avena', p: 16, c: 66, f: 7 },
            { name: 'Orzo', p: 12, c: 73, f: 2 },
        ];

        const fats = [
            { name: 'Olio d\'Oliva', p: 0, c: 0, f: 100 },
            { name: 'Mandorle', p: 21, c: 22, f: 49 },
            { name: 'Noci', p: 15, c: 14, f: 65 },
            { name: 'Avocado', p: 2, c: 9, f: 15 },
            { name: 'Noci Macadamia', p: 8, c: 14, f: 76 },
        ];

        // Filter by Preference
        let validProteins = proteins;
        if (preference === 'Vegetarian') validProteins = proteins.filter(p => ['Tofu', 'Egg Whites'].includes(p.name));
        if (preference === 'Vegan') validProteins = proteins.filter(p => ['Tofu'].includes(p.name));
        if (preference === 'Fish') validProteins = proteins.filter(p => ['Cod Fillet', 'Salmon'].includes(p.name));
        if (preference === 'Meat') validProteins = proteins.filter(p => ['Chicken Breast', 'Turkey Breast', 'Lean Beef'].includes(p.name));

        // Random Selection Helper
        const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

        // 1. Pick Protein Source
        const pSource = pick(validProteins);
        // Calculate grams needed to hit TARGET PROTEIN BLOCKS
        // targetP (g) = blocks * 7
        // grams = (targetP * 100) / pSource.p
        const pTargetGrams = zoneBlocks * 7;
        const pGrams = (pTargetGrams * 100) / pSource.p;

        // 2. Pick Carb Source
        const cSource = pick(carbs);
        // Calculate grams needed to hit TARGET CARB BLOCKS
        // targetC (g) = blocks * 9
        // grams = (targetC * 100) / cSource.c
        const cTargetGrams = zoneBlocks * 9;
        const cGrams = (cTargetGrams * 100) / cSource.c;

        // 3. Pick Fat Source
        const fSource = pick(fats);

        // Calculate Fat contribution from Protein source (important for blocks!)
        // Fat in Protein Source = (pGrams / 100) * pSource.f
        const fatInProtein = (pGrams / 100) * pSource.f;
        const fatBlocksInProtein = fatInProtein / 1.5; // 1.5g fat per block

        // Remaining Fat Blocks needed
        let fatBlocksNeeded = zoneBlocks - fatBlocksInProtein;
        if (fatBlocksNeeded < 0) fatBlocksNeeded = 0; // If protein is very fatty (e.g. Salmon), no extra fat needed

        // grams = (targetF_g * 100) / fSource.f
        // targetF_g = fatBlocksNeeded * 1.5
        const fGrams = (fatBlocksNeeded * 1.5 * 100) / fSource.f;

        if (mealTime === 'Breakfast') {
            title = `Colazione Zona: ${pSource.name} & ${cSource.name}`;
        } else if (mealTime === 'Snack') {
            title = `Spuntino Energetico: ${pSource.name} & ${cSource.name}`;
        } else {
            title = `Scelta dello Chef: ${pSource.name} con ${cSource.name}`;
        }

        template = [
            { name: pSource.name, grams: Math.round(pGrams), macros: pSource },
            { name: cSource.name, grams: Math.round(cGrams), macros: cSource },
        ];

        // Only add fat source if we actually need it (> 1g to be significant)
        if (fGrams > 1) {
            template.push({ name: fSource.name, grams: Math.round(fGrams), macros: fSource });
        }

        setGeneratedRecipe({
            title,
            description: `Un pasto perfettamente bilanciato da ${zoneBlocks} blocchi per ${mealTime} (${preference}).`,
            blocks: zoneBlocks,
            ingredients: template
        });
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
                                            ? "border-zone-blue-500 bg-zone-blue-50 text-zone-blue-700 shadow-inner"
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
                                className="bg-zone-blue-600 hover:bg-zone-blue-700 text-white font-bold"
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
                                className="bg-zone-orange-500 hover:bg-zone-orange-600 text-white font-bold"
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
                    <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">{generatedRecipe.title}</h2>
                                <p className="text-slate-400">{generatedRecipe.description}</p>
                            </div>
                            <div className="bg-zone-orange-500 text-white px-4 py-2 rounded-xl font-black text-xl shadow-lg">
                                {generatedRecipe.blocks} BLK
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold">Ingredient</th>
                                    <th className="px-4 py-3 text-right font-bold">Amount</th>
                                    <th className="px-4 py-3 text-right font-bold hidden md:table-cell">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {generatedRecipe.ingredients.map((ing: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-medium text-slate-800">{ing.name}</td>
                                        <td className="px-4 py-3 text-right font-bold text-zone-blue-600">{Math.round(ing.grams)}g</td>
                                        <td className="px-4 py-3 text-right text-slate-400 text-xs hidden md:table-cell">
                                            High quality source
                                        </td>
                                    </tr>
                                ))}
                                {/* Totals Footer */}
                                {/* Totals Footer */}
                                <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                                    <td className="px-4 py-3 text-slate-700">Totale Nutrienti</td>
                                    <td className="px-4 py-3 text-right text-slate-900" colSpan={2}>
                                        <span className="text-red-500 mr-3">P: {Math.round(parseFloat(String(totals.p)) * 7)}g</span>
                                        <span className="text-green-500 mr-3">C: {Math.round(parseFloat(String(totals.c)) * 9)}g</span>
                                        <span className="text-yellow-500">F: {Math.round(parseFloat(String(totals.f)) * 1.5)}g</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mt-8 flex justify-end gap-3">
                            <Button variant="outline">Save to Favorites</Button>
                            <Link href={getExportUrl()}>
                                <Button className="bg-green-600 hover:bg-green-700 text-white">
                                    <Utensils className="w-4 h-4 mr-2" /> Send to Meal Builder
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

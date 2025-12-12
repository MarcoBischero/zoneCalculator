'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus, ChevronLeft, ChevronRight, Utensils } from 'lucide-react';

interface Food {
    codiceAlimento: number;
    nome: string;
    proteine: number;
    carboidrati: number;
    grassi: number;
    // Mock types for display
    type?: 'PROTEIN' | 'CARBS' | 'FAT';
}

import { AddFoodDialog } from '@/components/foods/AddFoodDialog';

export default function FoodsPage() {
    const [foods, setFoods] = useState<Food[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingFood, setEditingFood] = useState<Food | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const fetchFoods = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/foods?q=${encodeURIComponent(query)}&take=20`);
            const data = await res.json();

            // Enrich with mock types for visuals if missing
            const enriched = data.map((f: any) => ({
                ...f,
                type: f.proteine > f.carboidrati ? 'PROTEIN' : (f.carboidrati > f.grassi ? 'CARBS' : 'FAT')
            }));

            setFoods(enriched);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [query]);

    useEffect(() => {
        const timeoutId = setTimeout(fetchFoods, query ? 500 : 0);
        return () => clearTimeout(timeoutId);
    }, [query, fetchFoods]);

    const handleEdit = (food: Food) => {
        setEditingFood(food);
        setIsAddDialogOpen(true);
    };

    const handleDialogClose = () => {
        setEditingFood(null);
        setIsAddDialogOpen(false);
    };

    return (
        <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
            <AddFoodDialog
                isOpen={isAddDialogOpen}
                onClose={handleDialogClose}
                onSuccess={fetchFoods}
                foodToEdit={editingFood}
            />
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Food Database</h1>
                    <p className="text-slate-500">Manage your nutritional sources.</p>
                </div>
                <Button className="bg-zone-blue-600" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add New Food
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search for foods (e.g., 'Chicken', 'Apple')..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zone-blue-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/80 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Food Name</th>
                                <th className="px-6 py-4">Macronutrient Type</th>
                                <th className="px-6 py-4 text-right">Protein (g)</th>
                                <th className="px-6 py-4 text-right">Carbs (g)</th>
                                <th className="px-6 py-4 text-right">Fat (g)</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {foods.map((food) => (
                                <tr key={food.codiceAlimento} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-slate-900">{food.nome}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${food.type === 'PROTEIN' ? 'bg-red-100 text-red-800' :
                                                food.type === 'CARBS' ? 'bg-green-100 text-green-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {food.type || 'BALANCED'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-600">{food.proteine}</td>
                                    <td className="px-6 py-4 text-right text-slate-600">{food.carboidrati}</td>
                                    <td className="px-6 py-4 text-right text-slate-600">{food.grassi}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="opacity-0 group-hover:opacity-100 text-zone-blue-600 hover:bg-blue-50"
                                            onClick={() => handleEdit(food)}
                                        >
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {foods.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center">
                                            <Utensils className="w-12 h-12 text-slate-200 mb-2" />
                                            <p>{query.length < 2 ? 'Start typing to search the database...' : 'No foods found matching your search.'}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
                    <span>Showing {foods.length} results</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled><ChevronLeft className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0"><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

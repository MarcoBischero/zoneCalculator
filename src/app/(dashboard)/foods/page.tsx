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
        <div className="p-6 lg:p-10 space-y-8 animate-in-up pb-20">
            <AddFoodDialog
                isOpen={isAddDialogOpen}
                onClose={handleDialogClose}
                onSuccess={fetchFoods}
                foodToEdit={editingFood}
            />
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Food Database</h1>
                    <p className="text-muted-foreground mt-2">Manage your nutritional sources and macros.</p>
                </div>
                <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-semibold" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-5 h-5 mr-2" /> Add New Food
                </Button>
            </div>

            <div className="glass-panel p-1 rounded-2xl overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-white/10 flex gap-4 bg-white/5 backdrop-blur-md">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search for foods (e.g., 'Chicken', 'Apple')..."
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-4">Food Name</th>
                                <th className="px-6 py-4">Macronutrient Type</th>
                                <th className="px-6 py-4 text-right">Protein (g)</th>
                                <th className="px-6 py-4 text-right">Carbs (g)</th>
                                <th className="px-6 py-4 text-right">Fat (g)</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {foods.map((food) => (
                                <tr key={food.codiceAlimento} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-foreground group-hover:text-primary transition-colors">{food.nome}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border
                        ${food.type === 'PROTEIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                food.type === 'CARBS' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                            {food.type || 'BALANCED'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-muted-foreground">{food.proteine}</td>
                                    <td className="px-6 py-4 text-right text-muted-foreground">{food.carboidrati}</td>
                                    <td className="px-6 py-4 text-right text-muted-foreground">{food.grassi}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="opacity-0 group-hover:opacity-100 text-primary hover:bg-primary/10 rounded-full px-4"
                                            onClick={() => handleEdit(food)}
                                        >
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {foods.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center">
                                            <Utensils className="w-12 h-12 text-muted-foreground/20 mb-3" />
                                            <p>{query.length < 2 ? 'Start typing to search the database...' : 'No foods found matching your search.'}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex justify-between items-center text-sm text-muted-foreground">
                    <span>Showing {foods.length} results</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-white/10 bg-white/5 text-muted-foreground hover:text-foreground" disabled><ChevronLeft className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

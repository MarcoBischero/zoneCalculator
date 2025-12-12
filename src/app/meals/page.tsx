'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, ChevronDown, ChevronUp, Loader2, Search, Users, Utensils, Pencil, BookOpen } from 'lucide-react';
import Link from 'next/link';
import he from 'he';

interface Meal {
    codicePasto: number;
    nome: string;
    mealType: string;
    blocks: number;
}

export default function MealsListPage() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMeals();
    }, []);

    const fetchMeals = () => {
        setLoading(true);
        fetch('/api/meals')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {

                if (data.meals && Array.isArray(data.meals)) {
                    setMeals(data.meals);
                } else if (Array.isArray(data)) {
                    setMeals(data);
                } else {
                    console.error('API returned non-array:', data);
                    setMeals([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setMeals([]);
                setLoading(false);
            });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this meal?')) return;

        try {
            const res = await fetch(`/api/meals?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMeals(meals.filter(m => m.codicePasto !== id));
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data.error || 'Failed to delete meal');
            }
        } catch (error) {
            console.error('Error deleting meal:', error);
            alert('Error deleting meal');
        }
    };

    const filteredMeals = meals.filter(m =>
        m.nome.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-10 space-y-8 animate-in-up pb-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">My Meals</h1>
                    <p className="text-muted-foreground mt-2">View and manage your saved Zone meals.</p>
                </div>
                <Link href="/calculator">
                    <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-semibold">
                        <Utensils className="w-5 h-5 mr-2" /> Create New Meal
                    </Button>
                </Link>
            </div>

            <div className="glass-panel p-1 rounded-2xl overflow-hidden shadow-sm">
                {/* Toolbar */}
                <div className="p-4 border-b border-white/10 flex gap-4 bg-white/5 backdrop-blur-md">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search meals..."
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-muted-foreground font-medium uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Meal Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-center">Blocks</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground animate-pulse">Loading meals...</td>
                                </tr>
                            ) : filteredMeals.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Utensils className="w-8 h-8 opacity-20" />
                                            <p>No meals found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredMeals.map((meal) => (
                                    <tr key={meal.codicePasto} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-semibold text-foreground group-hover:text-primary transition-colors">{he.decode(meal.nome)}</td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-medium uppercase text-muted-foreground/80">
                                                {meal.mealType || 'Mixed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs ring-1 ring-primary/20">
                                                {meal.blocks}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full" asChild>
                                                    <Link href={`/calculator?edit=${meal.codicePasto}`}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 rounded-full" title="View Recipe" asChild>
                                                    <Link href={`/recipe/${meal.codicePasto}`}>
                                                        <BookOpen className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full"
                                                    onClick={() => handleDelete(meal.codicePasto)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

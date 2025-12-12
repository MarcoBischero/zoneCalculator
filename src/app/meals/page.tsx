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
                if (Array.isArray(data)) {
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
                alert('Failed to delete meal');
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
        <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Meals</h1>
                    <p className="text-slate-500">View and manage your saved Zone meals.</p>
                </div>
                <Link href="/calculator">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Utensils className="w-4 h-4 mr-2" /> Create New Meal
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search meals..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Meal Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-center">Blocks</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Loading meals...</td>
                                </tr>
                            ) : filteredMeals.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No meals found.</td>
                                </tr>
                            ) : (
                                filteredMeals.map((meal) => (
                                    <tr key={meal.codicePasto} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-800">{he.decode(meal.nome)}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-xs font-medium uppercase">
                                                {meal.mealType || 'Mixed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs ring-1 ring-blue-100">
                                                {meal.blocks}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/calculator?edit=${meal.codicePasto}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/recipe/${meal.codicePasto}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-orange-600 hover:bg-orange-50" title="View Recipe">
                                                        <BookOpen className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
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

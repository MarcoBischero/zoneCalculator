'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Food {
    codiceAlimento: number;
    nome: string;
    proteine: number;
    carboidrati: number;
    grassi: number;
    codTipo: number;
}

interface FoodSelectorProps {
    value: string;
    onSelect: (food: Food) => void;
}

export function FoodSelector({ value, onSelect }: FoodSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [foods, setFoods] = useState<Food[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetch(`/api/foods?q=${encodeURIComponent(query)}&take=50`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setFoods(data);
                    } else {
                        console.error('API returned non-array:', data);
                        setFoods([]);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [isOpen, query]);

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div
                className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 text-sm cursor-text flex items-center justify-between min-h-[38px]"
                onClick={() => setIsOpen(true)}
            >
                <div className="truncate">{value || 'Seleziona Alimento...'}</div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                            <input
                                autoFocus
                                type="text"
                                className="w-full pl-7 pr-2 py-1 text-xs border border-slate-200 rounded focus:border-blue-500 outline-none"
                                placeholder="Cerca..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-1">
                        {loading ? (
                            <div className="text-xs text-center p-2 text-slate-400">Caricamento...</div>
                        ) : (Array.isArray(foods) ? foods : []).length === 0 ? (
                            <div className="text-xs text-center p-2 text-slate-400">Nessun alimento trovato</div>
                        ) : (
                            (Array.isArray(foods) ? foods : []).map(food => (
                                <button
                                    key={food.codiceAlimento}
                                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-blue-50 rounded flex items-center justify-between group"
                                    onClick={() => {
                                        onSelect(food);
                                        setIsOpen(false);
                                        setQuery('');
                                    }}
                                >
                                    <span className="truncate text-slate-700 font-medium">{food.nome}</span>
                                    <div className="flex gap-1 opacity-50 group-hover:opacity-100 text-[10px]">
                                        <span className="text-red-600">P:{food.proteine}</span>
                                        <span className="text-green-600">C:{food.carboidrati}</span>
                                        <span className="text-yellow-600">F:{food.grassi}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                    {/* Add New Hint */}
                    <div className="p-1 border-t border-slate-100 bg-slate-50 text-[10px] text-center text-slate-400">
                        {"Non lo trovi? Aggiungilo al DB."}
                    </div>
                </div>
            )}
        </div>
    );
}

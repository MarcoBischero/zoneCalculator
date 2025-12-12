'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, Apple } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Food {
    codiceAlimento: number;
    nome: string;
    proteine: number;
    carboidrati: number;
    grassi: number;
}

interface ZoneSearchProps {
    onSelect: (food: Food) => void;
}

export function ZoneSearch({ onSelect }: ZoneSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Food[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            setLoading(true);
            setIsOpen(true);
            fetch(`/api/foods?q=${encodeURIComponent(query)}&take=10`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setResults(data);
                    setLoading(false);
                });
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="relative w-full max-w-2xl mx-auto z-50" ref={wrapperRef}>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none text-lg transition-all placeholder:text-muted-foreground/50"
                    placeholder="Search for food (e.g. 'Chicken', 'Apple')..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1 bg-muted rounded border border-border">CMD+K</div>
                </div>
            </div>

            {/* Results Dropdown */}
            {isOpen && (results.length > 0 || loading) && (
                <div className="absolute w-full mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {loading && (
                        <div className="p-4 flex items-center justify-center text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Searching Zone Database...
                        </div>
                    )}
                    {!loading && results.map((food, i) => (
                        <button
                            key={food.codiceAlimento}
                            onClick={() => {
                                onSelect(food);
                                setQuery('');
                                setIsOpen(false);
                            }}
                            className={cn(
                                "w-full text-left p-4 hover:bg-primary/5 transition-colors flex items-center justify-between group border-b border-border/10 last:border-0",
                                i === 0 && "bg-primary/5" // Highlight top result
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary/20 rounded-lg text-secondary group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                    <Apple className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">{food.nome}</h4>
                                    <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5 opacity-70 group-hover:opacity-100">
                                        <span>P: {food.proteine}g</span>
                                        <span>C: {food.carboidrati}g</span>
                                        <span>F: {food.grassi}g</span>
                                    </div>
                                </div>
                            </div>
                            <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

'use client';

import { X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface MealBlockProps {
    foodName: string;
    protein: number;
    carbs: number;
    fat: number;
    grams: number;
    onChangeGrams: (val: number) => void;
    onDelete: () => void;
}

export function MealBlock({ foodName, protein, carbs, fat, grams, onChangeGrams, onDelete }: MealBlockProps) {
    const ratio = grams / 100;
    const realP = (protein * ratio).toFixed(1);
    const realC = (carbs * ratio).toFixed(1);
    const realF = (fat * ratio).toFixed(1);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="group relative glass-card p-4 rounded-2xl flex flex-col gap-4 hover:border-primary/40 transition-colors duration-300"
        >
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground/30 cursor-grab active:cursor-grabbing" />
                    <div>
                        <h4 className="font-bold text-foreground leading-tight">{foodName}</h4>
                        <div className="text-[10px] text-muted-foreground mt-1 flex gap-2">
                            <span className="text-red-500/80">P: {protein}</span>
                            <span className="text-green-500/80">C: {carbs}</span>
                            <span className="text-yellow-500/80">F: {fat}</span>
                            <span className="opacity-50">/100g</span>
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive -mr-2 -mt-2 transition-all"
                    onClick={onDelete}
                >
                    <X className="w-3 h-3" />
                </Button>
            </div>

            {/* Controls */}
            <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Grams</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={grams || ''}
                            onChange={(e) => onChangeGrams(parseFloat(e.target.value) || 0)}
                            className="w-full bg-secondary/10 border border-border/50 rounded-lg py-3 px-4 font-mono font-bold text-xl text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all"
                            placeholder="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none">g</span>
                    </div>
                </div>

                {/* Live Macros */}
                <div className="flex gap-1">
                    <div className="flex flex-col items-center min-w-[32px]">
                        <span className={cn("text-xs font-bold", parseFloat(realP) > 0 ? "text-red-500" : "text-muted-foreground")}>{realP}</span>
                        <span className="text-[8px] text-muted-foreground uppercase">Prot</span>
                    </div>
                    <div className="w-px h-6 bg-border/50 self-end mb-1"></div>
                    <div className="flex flex-col items-center min-w-[32px]">
                        <span className={cn("text-xs font-bold", parseFloat(realC) > 0 ? "text-green-500" : "text-muted-foreground")}>{realC}</span>
                        <span className="text-[8px] text-muted-foreground uppercase">Carb</span>
                    </div>
                    <div className="w-px h-6 bg-border/50 self-end mb-1"></div>
                    <div className="flex flex-col items-center min-w-[32px]">
                        <span className={cn("text-xs font-bold", parseFloat(realF) > 0 ? "text-yellow-500" : "text-muted-foreground")}>{realF}</span>
                        <span className="text-[8px] text-muted-foreground uppercase">Fat</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

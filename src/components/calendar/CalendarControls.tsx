import { Button } from '@/components/ui/button';
import { Copy, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import React from 'react';

interface CalendarControlsProps {
    onClearWeek: () => void;
    onCopyPrevious: () => void;
    onGenerate: () => void;
    isClearing: boolean;
    isGenerating: boolean;
    hasItems: boolean;
}

export function CalendarControls({
    onClearWeek,
    onCopyPrevious,
    onGenerate,
    isClearing,
    isGenerating,
    hasItems
}: CalendarControlsProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Planner Settimanale</h1>
                <p className="text-slate-500">Pianifica i tuoi blocchi Zona per la settimana.</p>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    onClick={onClearWeek}
                    disabled={isClearing || !hasItems}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                    {isClearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Svuota
                </Button>
                <Button
                    variant="outline"
                    onClick={onCopyPrevious}
                >
                    <Copy className="mr-2 h-4 w-4" />
                    Copia Scorsa Settimana
                </Button>
                <Button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Generando...' : 'AI Auto-Fill'}
                </Button>
            </div>
        </div>
    );
}

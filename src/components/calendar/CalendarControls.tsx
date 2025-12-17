import { Button } from '@/components/ui/button';
import { Copy, Loader2, RefreshCw, Trash2, Printer } from 'lucide-react';
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
        <div className="flex flex-col md:flex-row justify-between items-center bg-card p-6 rounded-xl shadow-sm border border-border gap-4">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Planner Settimanale</h1>
                <p className="text-muted-foreground">Pianifica i tuoi blocchi Zona per la settimana.</p>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    onClick={onClearWeek}
                    disabled={isClearing || !hasItems}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
                    variant="outline"
                    onClick={() => window.print()}
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Stampa
                </Button>
                <Button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Generando...' : 'AI Auto-Fill'}
                </Button>
            </div>
        </div>
    );
}

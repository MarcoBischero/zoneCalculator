'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2, X } from 'lucide-react';
import { classifyFood } from '@/lib/zone-classifier';
import { estimateMacros } from '@/lib/food-knowledge';

interface AddFoodDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    foodToEdit?: any;
}

export function AddFoodDialog(props: AddFoodDialogProps) {
    const { isOpen, onClose, onSuccess, foodToEdit } = props;
    const [formData, setFormData] = useState({
        nome: '',
        proteine: '',
        carboidrati: '',
        grassi: '',
        codTipo: '',
        codFonte: '',
        type: '1'
    });
    const [loading, setLoading] = useState(false);
    const [isEstimating, setIsEstimating] = useState(false);
    const [lastEditId, setLastEditId] = useState<number | null>(null);

    // ... inside component

    // Auto-classify Type and Source based on predict logic
    useEffect(() => {
        const p = parseFloat(formData.proteine) || 0;
        const c = parseFloat(formData.carboidrati) || 0;
        const f = parseFloat(formData.grassi) || 0;
        const name = formData.nome || '';

        // Run classifier
        const prediction = classifyFood(name, p, c, f);

        setFormData(prev => {
            const updates: any = {};
            // Only update if current value is empty or we want to be aggressive?
            // "Recovered by AI" implies aggressive prediction, but better to not overwrite if user manually set it?
            // User said "add deve funzionare così" -> implied fresh entry.
            // Let's update IF the field is currently empty OR if we are just exploring (typing name).
            // Safer: update if empty.

            if (prediction.codFonte && !prev.codFonte) {
                updates.codFonte = prediction.codFonte;
            }

            // Using prediction for Type as well (from classifier keywords)
            if (prediction.codTipo && !prev.codTipo) {
                updates.codTipo = prediction.codTipo;
            }

            return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.proteine, formData.carboidrati, formData.grassi, formData.nome]);

    // If Type changes based on macros, update it.
    // If Type was auto-set before (we don't track "auto-set" state), we might overwrite manual user choice.
    // Let's trust the macros for Type if Type is empty.

    // Actually, if I type "Pollo", classifier says Type=1.
    // If I then type Protein=20, classifier says Type=1.
    // If I type "Pollo" but Protein=0, classifier might guess Type=1 from Name?? 
    // My classifier only guessed Type from Macros. Let's allow Name to guess Type too?
    // I didn't verify that in the file I just wrote. 


    // Load data for edit
    if (foodToEdit && foodToEdit.codiceAlimento !== lastEditId) {
        setFormData({
            nome: foodToEdit.nome,
            proteine: foodToEdit.proteine.toString(),
            carboidrati: foodToEdit.carboidrati.toString(),
            grassi: foodToEdit.grassi.toString(),
            codTipo: foodToEdit.codTipo?.toString() || '',
            codFonte: foodToEdit.codFonte?.toString() || '',
            type: '1'
        });
        setLastEditId(foodToEdit.codiceAlimento);
    }

    // Reset on close/new
    if (!foodToEdit && lastEditId !== null) {
        setFormData({ nome: '', proteine: '', carboidrati: '', grassi: '', codTipo: '', codFonte: '', type: '1' });
        setLastEditId(null);
    }

    if (!isOpen) return null;

    const handleAiEstimate = async () => {
        setIsEstimating(true);
        // Simulate "AI" delay or use local heuristics immediately
        setTimeout(() => {
            const p = parseFloat(formData.proteine) || 0;
            const c = parseFloat(formData.carboidrati) || 0;
            const f = parseFloat(formData.grassi) || 0;
            const name = formData.nome || '';

            // 1. Estimate Macros from Name
            const smartData = estimateMacros(name);
            const updates: any = {};

            if (smartData) {
                // ALWAYS update macros when AI Check is explicitly clicked
                updates.proteine = smartData.p.toString();
                updates.carboidrati = smartData.c.toString();
                updates.grassi = smartData.f.toString();
                if (smartData.type) updates.codTipo = smartData.type;
            }

            // 2. Classify based on (potentially new) macros and name
            const prediction = classifyFood(name,
                parseFloat(updates.proteine || formData.proteine || '0'),
                parseFloat(updates.carboidrati || formData.carboidrati || '0'),
                parseFloat(updates.grassi || formData.grassi || '0')
            );

            if (prediction.codFonte) updates.codFonte = prediction.codFonte;
            if (prediction.codTipo && !updates.codTipo) updates.codTipo = prediction.codTipo;

            if (Object.keys(updates).length > 0) {
                setFormData(prev => ({ ...prev, ...updates }));
            } else {
                // If we found nothing and we were explicitly asked to estimate
                if (!smartData && name.length > 2) {
                    // Use new Toast instead of alert? For now keep alert or silence.
                    // alert("Alimento non trovato nel database locale. Inserisci i macro manualmente.");
                }
            }
            setIsEstimating(false);
        }, 600);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = '/api/foods';
            const method = foodToEdit ? 'PUT' : 'POST';
            const body: any = {
                ...formData,
                codTipo: parseInt(formData.codTipo || '0'),
                codFonte: parseInt(formData.codFonte || '0'),
                type: undefined // Cleanup
            };

            if (foodToEdit) {
                body.id = foodToEdit.codiceAlimento;
            }

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to save food', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 rounded-2xl border-white/10 shadow-2xl">
                <div className="flex justify-between items-center p-5 border-b border-border/40 bg-white/5">
                    <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                        {foodToEdit ? 'Modifica Alimento' : 'Aggiungi Nuovo Alimento'}
                    </h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-white/10 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Old Name Input Removed - Replaced by New UI below */}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo (Auto-Rilevato)</label>
                            <select
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={formData.codTipo || ''}
                                onChange={(e) => setFormData({ ...formData, codTipo: e.target.value })}
                            >
                                <option value="">Seleziona Tipo</option>
                                <option value="1">Proteine</option>
                                <option value="2">Carboidrati</option>
                                <option value="3">Grassi</option>
                                <option value="4">Misto/Bilanciato</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Qualità Fonte</label>
                            <select
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={formData.codFonte || ''}
                                onChange={(e) => setFormData({ ...formData, codFonte: e.target.value })}
                            >
                                <option value="">Seleziona Qualità</option>
                                <option value="1">Ottima</option>
                                <option value="2">Accettabile</option>
                                <option value="3">Da Evitare</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 items-end">
                        <div className="grid gap-2 flex-1">
                            <Label htmlFor="name" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="name"
                                value={formData.nome}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nome: e.target.value })}
                                className="col-span-3"
                                placeholder="Es. Petto di pollo"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="default"
                            onClick={handleAiEstimate}
                            disabled={isEstimating || formData.nome.length < 3}
                            className="mb-0.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isEstimating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            <span className="sr-only">Auto-Fill</span>
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Proteine</label>
                            <div className="relative group">
                                <input
                                    required
                                    type="number"
                                    step="0.1"
                                    className="w-full p-2 border border-border/50 bg-background/50 rounded-lg focus:ring-2 focus:ring-protein outline-none transition-all"
                                    value={formData.proteine}
                                    onChange={(e) => setFormData({ ...formData, proteine: e.target.value })}
                                />
                                <span className="absolute right-3 top-2 text-xs text-muted-foreground font-mono">g</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Carboidrati</label>
                            <div className="relative group">
                                <input
                                    required
                                    type="number"
                                    step="0.1"
                                    className="w-full p-2 border border-border/50 bg-background/50 rounded-lg focus:ring-2 focus:ring-carb outline-none transition-all"
                                    value={formData.carboidrati}
                                    onChange={(e) => setFormData({ ...formData, carboidrati: e.target.value })}
                                />
                                <span className="absolute right-3 top-2 text-xs text-muted-foreground font-mono">g</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Grassi</label>
                            <div className="relative group">
                                <input
                                    required
                                    type="number"
                                    step="0.1"
                                    className="w-full p-2 border border-border/50 bg-background/50 rounded-lg focus:ring-2 focus:ring-fat outline-none transition-all"
                                    value={formData.grassi}
                                    onChange={(e) => setFormData({ ...formData, grassi: e.target.value })}
                                />
                                <span className="absolute right-3 top-2 text-xs text-muted-foreground font-mono">g</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Annulla</Button>
                        <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20" disabled={loading}>
                            {loading ? 'Salvataggio...' : (foodToEdit ? 'Salva Modifiche' : 'Salva Alimento')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

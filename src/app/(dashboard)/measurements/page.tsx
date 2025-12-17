'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ruler, Scale, Activity, Save, Loader2, History } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function MeasurementsPage() {
    const { data: session } = useSession();
    const [weight, setWeight] = useState('');
    const [waist, setWaist] = useState('');
    const [hips, setHips] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/reports'); // Reusing report data for history
            const data = await res.json();
            if (data.weightHistory) {
                setHistory(data.weightHistory.reverse());
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async () => {
        if (!weight) return alert('Inserisci almeno il peso');

        setLoading(true);
        try {
            const res = await fetch('/api/measurements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weight: parseFloat(weight),
                    waist: waist ? parseFloat(waist) : undefined,
                    hips: hips ? parseFloat(hips) : undefined,
                    date: new Date().toISOString()
                })
            });

            if (res.ok) {
                alert('Misure salvate!');
                setWeight('');
                fetchHistory();
            } else {
                throw new Error('Errore nel salvataggio');
            }
        } catch (e) {
            alert('Errore durante il salvataggio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-8 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Ruler className="w-8 h-8 text-primary" />
                    Misure & Progressi
                </h1>
                <p className="text-muted-foreground mt-2">
                    Registra le tue misure corporee per tracciare i progressi nel tempo.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nuova Misurazione</CardTitle>
                            <CardDescription>Inserisci i dati di oggi. Solo il peso è obbligatorio.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Scale className="w-4 h-4" /> Peso (kg)
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="es. 75.5"
                                        value={weight}
                                        onChange={e => setWeight(e.target.value)}
                                        className="text-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Circonferenza Vita (cm)
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        placeholder="Opzionale"
                                        value={waist}
                                        onChange={e => setWaist(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Circonferenza Fianchi (cm)
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        placeholder="Opzionale"
                                        value={hips}
                                        onChange={e => setHips(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto min-w-[200px]">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Registra Misure
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* History Column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="w-5 h-5" /> Storico Recente
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {history.length > 0 ? (
                                    history.map((entry: any, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border/50">
                                            <span className="text-sm font-medium">{entry.date}</span>
                                            <span className="font-bold text-primary">{entry.weight} kg</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">Nessuna misurazione recente.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

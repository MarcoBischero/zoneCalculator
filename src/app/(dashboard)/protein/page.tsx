'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Ruler, Activity, Save, User } from 'lucide-react';

export default function ProteinPage() {
    const [gender, setGender] = useState<'uomo' | 'donna'>('uomo');
    const [stats, setStats] = useState({
        weight: '',
        height: '',
        // Male measurements
        neck: '',
        abdomen: '',
        // Female measurements
        waist: '',
        hips: '',
        wrist: '',
        forearm: '',
        activity: '1.3' // Lightly Active default
    });

    const [results, setResults] = useState<{
        bodyFat: number;
        leanMass: number;
        dailyProtein: number;
        blocks: number;
    } | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    // Load user gender from session/profile
    useEffect(() => {
        fetch('/api/auth/session')
            .then(res => res.json())
            .then(data => {
                if (data?.user?.sesso) {
                    setGender(data.user.sesso);
                }
            })
            .catch(() => { });
    }, []);

    const calculate = () => {
        const parseInput = (val: string) => parseFloat(val.replace(',', '.')) || 0;

        const w = parseInput(stats.weight);
        const h = parseInput(stats.height);
        const act = parseFloat(stats.activity);

        if (!w || !h || w <= 0 || h <= 0) return;

        let bodyFat = 15; // Default fallback

        if (gender === 'uomo') {
            // Male: U.S. Navy Method
            const neck = parseInput(stats.neck);
            const abdomen = parseInput(stats.abdomen);

            if (!neck || !abdomen || neck <= 0 || abdomen <= 0) return;

            const logAbdomenNeck = Math.log10(Math.max(1, abdomen - neck));
            const logHeight = Math.log10(h);

            bodyFat = 495 / (1.0324 - 0.19077 * logAbdomenNeck + 0.15456 * logHeight) - 450;
        } else {
            // Female: U.S. Navy Method for Women
            const waist = parseInput(stats.waist);
            const hips = parseInput(stats.hips);
            const neck = parseInput(stats.neck);

            if (!waist || !hips || !neck || waist <= 0 || hips <= 0 || neck <= 0) return;

            const logWaistHipsNeck = Math.log10(Math.max(1, waist + hips - neck));
            const logHeight = Math.log10(h);

            bodyFat = 495 / (1.29579 - 0.35004 * logWaistHipsNeck + 0.22100 * logHeight) - 450;
        }

        // Clamp body fat percentage
        bodyFat = Math.max(2, Math.min(60, bodyFat));
        if (isNaN(bodyFat)) bodyFat = 15;

        const leanMass = w * (1 - bodyFat / 100);

        // Zone Diet Formula: Blocks = Lean Mass (kg) × Activity Level / 10
        let blocks = (leanMass * act) / 10;

        // Enforce minimum 11 blocks
        if (blocks < 11) blocks = 11;

        const proteinGrams = blocks * 7;

        setResults({
            bodyFat: parseFloat(bodyFat.toFixed(1)),
            leanMass: parseFloat(leanMass.toFixed(1)),
            dailyProtein: parseFloat(proteinGrams.toFixed(0)),
            blocks: parseFloat(blocks.toFixed(1))
        });
    };

    const handleSaveProfile = async () => {
        if (!results) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/user/protein', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weight: parseFloat(stats.weight),
                    height: parseFloat(stats.height),
                    neck: gender === 'uomo' ? parseFloat(stats.neck) : parseFloat(stats.neck),
                    abdomen: gender === 'uomo' ? parseFloat(stats.abdomen) : null,
                    waist: gender === 'donna' ? parseFloat(stats.waist) : null,
                    hips: gender === 'donna' ? parseFloat(stats.hips) : null,
                    wrist: gender === 'donna' ? parseFloat(stats.wrist) : null,
                    forearm: gender === 'donna' ? parseFloat(stats.forearm) : null,
                    activity: stats.activity,
                    ...results
                })
            });
            if (res.ok) {
                setSaveMessage("Profilo aggiornato con successo!");
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                setSaveMessage("Errore nel salvare il profilo.");
            }
        } catch (e) {
            setSaveMessage("Errore di rete.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 space-y-6 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Calcolatore Proteine</h1>
                    <p className="text-slate-500">Determina il tuo fabbisogno giornaliero di blocchi Zone.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center">
                        <Ruler className="w-5 h-5 mr-2 text-blue-600" /> Misurazioni
                    </h3>

                    <div className="space-y-4">
                        {/* Gender Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <User className="w-4 h-4 inline mr-1" /> Sesso
                            </label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setGender('uomo')}
                                    className={`flex-1 p-3 rounded-lg border-2 font-medium transition-all ${gender === 'uomo'
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                                        }`}
                                >
                                    👨 Uomo
                                </button>
                                <button
                                    onClick={() => setGender('donna')}
                                    className={`flex-1 p-3 rounded-lg border-2 font-medium transition-all ${gender === 'donna'
                                            ? 'border-pink-600 bg-pink-50 text-pink-700'
                                            : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                                        }`}
                                >
                                    👩 Donna
                                </button>
                            </div>
                        </div>

                        {/* Weight and Height */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Peso (Kg)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={stats.weight}
                                    onChange={e => setStats({ ...stats, weight: e.target.value })}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Altezza (Cm)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={stats.height}
                                    onChange={e => setStats({ ...stats, height: e.target.value })}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Male Measurements */}
                        {gender === 'uomo' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Collo (Cm) <span className="text-blue-600">ℹ️</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={stats.neck}
                                        onChange={e => setStats({ ...stats, neck: e.target.value })}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Addome (Cm) <span className="text-blue-600">ℹ️</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={stats.abdomen}
                                        onChange={e => setStats({ ...stats, abdomen: e.target.value })}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Female Measurements */}
                        {gender === 'donna' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Collo (Cm) <span className="text-pink-600">ℹ️</span>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={stats.neck}
                                            onChange={e => setStats({ ...stats, neck: e.target.value })}
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Vita (Cm) <span className="text-pink-600">ℹ️</span>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={stats.waist}
                                            onChange={e => setStats({ ...stats, waist: e.target.value })}
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Anche (Cm) <span className="text-pink-600">ℹ️</span>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={stats.hips}
                                            onChange={e => setStats({ ...stats, hips: e.target.value })}
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Polso (Cm) <span className="text-pink-600">ℹ️</span>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={stats.wrist}
                                            onChange={e => setStats({ ...stats, wrist: e.target.value })}
                                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Avambraccio (Cm) <span className="text-pink-600">ℹ️</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={stats.forearm}
                                        onChange={e => setStats({ ...stats, forearm: e.target.value })}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                                    />
                                </div>
                            </>
                        )}

                        {/* Activity Level */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Attività</label>
                            <select
                                value={stats.activity}
                                onChange={e => setStats({ ...stats, activity: e.target.value })}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="1.1">Sedentario (1.1)</option>
                                <option value="1.3">Leggermente Attivo (1.3)</option>
                                <option value="1.5">Moderatamente Attivo (1.5)</option>
                                <option value="1.7">Molto Attivo (1.7)</option>
                                <option value="1.9">Estremamente Attivo (1.9)</option>
                            </select>
                        </div>

                        <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={calculate}>
                            Calcola
                        </Button>
                    </div>
                </div>

                {/* Results Card */}
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-blue-500 rounded-full blur-3xl opacity-10 translate-x-10 -translate-y-10"></div>

                    <h3 className="font-bold text-xl mb-6 flex items-center relative z-10">
                        <Activity className="w-5 h-5 mr-2 text-green-400" /> I Tuoi Risultati
                    </h3>

                    {results ? (
                        <div className="space-y-6 relative z-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 p-4 rounded-lg">
                                    <div className="text-slate-400 text-xs uppercase tracking-wider">% Massa Grassa</div>
                                    <div className="text-2xl font-bold text-white">{results.bodyFat}%</div>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-lg">
                                    <div className="text-slate-400 text-xs uppercase tracking-wider">Massa Magra (Kg)</div>
                                    <div className="text-2xl font-bold text-white">{results.leanMass}</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-700">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="text-slate-400 font-medium">Fabbisogno proteico giornaliero (gr)</div>
                                    <div className="text-3xl font-bold text-blue-400">{results.dailyProtein}g</div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="text-slate-400 font-medium">Totale blocchi zona</div>
                                    <div className="text-4xl font-extrabold text-orange-500">{results.blocks}</div>
                                </div>
                            </div>

                            <Button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                            >
                                {isSaving ? 'Salvataggio...' : <><Save className="w-4 h-4 mr-2" /> Salva nel Profilo</>}
                            </Button>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-500 relative z-10">
                            <Activity className="w-12 h-12 mb-3 opacity-20" />
                            <p>Inserisci le tue misure per vedere i risultati</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Feedback Toast */}
            {saveMessage && (
                <div className="fixed bottom-4 right-4 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-lg shadow-xl shadow-black/20 flex items-center animate-in slide-in-from-bottom-2 fade-in">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-3" />
                    {saveMessage}
                </div>
            )}
        </div>
    );
}

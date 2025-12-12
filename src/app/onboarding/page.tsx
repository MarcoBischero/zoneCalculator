'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Localization Mock (Ideally from Context or Hook)
    // We default to Italian per request if no preference found, checking session
    const lang = (session?.user as any)?.language || 'it';

    const t = {
        it: {
            title1: 'Le Tue Misure',
            title2: 'Livello Attività',
            desc1: 'Passo 1 di 2 • Calcoliamo i tuoi blocchi ideali.',
            gender: 'Sesso',
            weight: 'Peso (kg)',
            height: 'Altezza (cm)',
            waist: 'Vita (cm)',
            hips: 'Fianchi (cm)',
            neck: 'Collo (cm)',
            activity: 'Attività Quotidiana',
            next: 'Prossimo',
            back: 'Indietro',
            calc: 'Calcola Blocchi & Finisci',
            male: 'Uomo',
            female: 'Donna',
            act1: 'Sedentario (Lavoro ufficio)',
            act2: 'Moderato (Palestra 3x/sett)',
            act3: 'Attivo (Allenamento quotidiano)',
            act4: 'Atleta (Doppio allenamento)'
        },
        en: {
            title1: 'Your Measurements',
            title2: 'Activity Level',
            desc1: 'Step 1 of 2 • Let\'s calculate your ideal Zone Blocks.',
            gender: 'Gender',
            weight: 'Weight (kg)',
            height: 'Height (cm)',
            waist: 'Waist (cm)',
            hips: 'Hips (cm)',
            neck: 'Neck (cm)',
            activity: 'Daily Activity',
            next: 'Next Step',
            back: 'Back',
            calc: 'Calculate Blocks & Finish',
            male: 'Male',
            female: 'Female',
            act1: 'Sedentary (Desk Job)',
            act2: 'Moderate (Gym 3x/week)',
            act3: 'Active (Daily Training)',
            act4: 'Athlete (Double Split)'
        }
    };

    const text = (t as any)[lang] || t.it;

    // Form Data
    const [data, setData] = useState({
        weight: 70,
        height: 175,
        waist: 85,
        hips: 95,
        neck: 38,
        gender: 'uomo',
        activity: '1.5' // Moderate
    });

    const ACTIVITY_MULTIPLIERS = [
        { val: '1.3', label: text.act1 },
        { val: '1.5', label: text.act2 },
        { val: '1.7', label: text.act3 },
        { val: '2.0', label: text.act4 },
    ];

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/user/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                router.push('/');
                router.refresh();
            } else {
                alert("Error saving profile");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-xl border-t-4 border-t-zone-blue-600">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-black text-slate-900">
                        {step === 1 ? text.title1 : text.title2}
                    </CardTitle>
                    <CardDescription>
                        {text.desc1}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">{text.gender}</label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={data.gender}
                                        onChange={e => setData({ ...data, gender: e.target.value })}
                                    >
                                        <option value="uomo">{text.male}</option>
                                        <option value="donna">{text.female}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">{text.weight}</label>
                                    <input
                                        type="number" className="w-full p-2 border rounded"
                                        value={data.weight}
                                        onChange={e => setData({ ...data, weight: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">{text.height}</label>
                                    <input
                                        type="number" className="w-full p-2 border rounded"
                                        value={data.height}
                                        onChange={e => setData({ ...data, height: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">{text.waist}</label>
                                    <input
                                        type="number" className="w-full p-2 border rounded"
                                        value={data.waist}
                                        onChange={e => setData({ ...data, waist: Number(e.target.value) })}
                                    />
                                </div>
                                {data.gender === 'donna' && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">{text.hips}</label>
                                        <input
                                            type="number" className="w-full p-2 border rounded"
                                            value={data.hips}
                                            onChange={e => setData({ ...data, hips: Number(e.target.value) })}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">{text.neck}</label>
                                    <input
                                        type="number" className="w-full p-2 border rounded"
                                        value={data.neck}
                                        onChange={e => setData({ ...data, neck: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <Button onClick={() => setStep(2)} className="w-full mt-4">
                                {text.next} <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">{text.activity}</label>
                                {ACTIVITY_MULTIPLIERS.map(opt => (
                                    <div
                                        key={opt.val}
                                        className={`p-3 rounded border cursor-pointer transition-all ${data.activity === opt.val ? 'bg-zone-blue-50 border-zone-blue-500 ring-1 ring-zone-blue-500' : 'hover:bg-slate-50'}`}
                                        onClick={() => setData({ ...data, activity: opt.val })}
                                    >
                                        <div className="font-bold text-slate-800">{opt.label}</div>
                                        <div className="text-xs text-slate-500">Multiplier: {opt.val}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setStep(1)} className="w-1/3">{text.back}</Button>
                                <Button onClick={handleSubmit} disabled={loading} className="w-2/3 bg-green-600 hover:bg-green-700 text-white">
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : text.calc}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

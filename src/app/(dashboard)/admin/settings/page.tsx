'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Settings, Save, Loader2, Bot, CheckCircle, AlertCircle } from 'lucide-react';

import { useLanguage } from '@/lib/language-context';

export default function AdminSettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [aiModel, setAiModel] = useState('gemini-1.5-flash');
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const AVAILABLE_MODELS = [
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast & Cost Effective)' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (High Intelligence)' },
        { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Experimental / Latest)' },
    ];

    // ... (keep useEffect and fetchSettings mostly same, just ensure imports)

    useEffect(() => {
        if (status === 'authenticated') {
            const roleId = Number((session?.user as any)?.role);
            // Only Super Admin (ID 1)
            if (roleId !== 1) {
                router.push('/');
                return;
            }
            fetchSettings();
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, session, router]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.ai_model) setAiModel(data.ai_model);
            }
        } catch (e) {
            console.error(e);
            setMessage({ text: language === 'it' ? "Impossibile caricare le impostazioni" : "Failed to load settings", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ai_model: aiModel })
            });

            if (res.ok) {
                setMessage({ text: t('system.save_success'), type: 'success' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ text: t('system.save_error'), type: 'error' });
            }
        } catch (e) {
            console.error(e);
            setMessage({ text: t('system.save_error'), type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (status === 'loading' || loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8 space-y-6 max-w-4xl mx-auto bg-background min-h-screen">
            <div className="flex justify-between items-center bg-card p-6 rounded-xl shadow-sm border border-border">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center">
                        <Settings className="mr-3 h-8 w-8 text-primary" /> {t('system.title')}
                    </h1>
                    <p className="text-muted-foreground">{t('system.subtitle')}</p>
                </div>
            </div>

            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden p-6 space-y-8">

                {/* AI Configuration Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                        <Bot className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">{t('system.ai_section')}</h2>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-foreground">{t('system.active_model')}</label>
                        <p className="text-xs text-muted-foreground mb-2">{t('system.active_model_desc')}</p>
                        <select
                            className="w-full max-w-md p-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            value={aiModel}
                            onChange={(e) => setAiModel(e.target.value)}
                        >
                            {AVAILABLE_MODELS.map(model => (
                                <option key={model.value} value={model.value} className="bg-background text-foreground">
                                    {model.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex-1">
                        {message && (
                            <div className={`text-sm flex items-center gap-2 ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {message.text}
                            </div>
                        )}
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                        {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        {t('settings.save_changes')}
                    </Button>
                </div>

            </div>
        </div>
    );
}

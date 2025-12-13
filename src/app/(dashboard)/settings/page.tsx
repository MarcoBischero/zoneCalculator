'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, Settings as SettingsIcon, ShieldAlert, Loader2, Save } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export default function SettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fetch user data on mount
    useState(() => {
        fetch('/api/user')
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    });

    const { t, language, setLanguage } = useLanguage();

    const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        // ... (keep existing logic)
        e.preventDefault();
        setMessage('');
        setIsSaving(true);

        const formData = new FormData(e.currentTarget);
        const nome = formData.get('nome');
        const lang = formData.get('language') as string;

        try {
            const res = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, language: lang })
            });

            if (res.ok) {
                setMessage(language === 'it' ? 'Successo: Impostazioni salvate' : 'Success: Settings saved');
                // Update Global Context
                if (lang === 'it' || lang === 'en') {
                    setLanguage(lang as any);
                }
                router.refresh();
            } else {
                setMessage(language === 'it' ? 'Errore: Impossibile salvare' : 'Error: Could not save');
            }
        } catch (error) {
            setMessage(language === 'it' ? 'Errore di Connessione' : 'Connection Error');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        const confirm = formData.get('confirm') as string;

        if (password !== confirm) {
            setMessage(language === 'it' ? 'Le password non corrispondono' : 'Passwords do not match');
            setIsSaving(false);
            return;
        }

        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            if (res.ok) {
                setMessage(language === 'it' ? 'Successo: Password aggiornata' : 'Success: Password updated');
                (e.target as HTMLFormElement).reset();
            } else {
                setMessage(language === 'it' ? 'Errore: Impossibile aggiornare la password' : 'Error: Could not update password');
            }
        } catch (error) {
            setMessage(language === 'it' ? 'Errore di Rete' : 'Network Error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    const getRoleLabel = (role: number) => {
        if (role === 1) return t('settings.role_admin');
        if (role === 2) return t('settings.role_dietician');
        return t('settings.role_patient');
    };

    return (
        <div className="p-4 md:p-8 space-y-8 min-h-screen bg-slate-50/50">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('settings.title')}</h1>
                <p className="text-slate-500 mt-2">{t('settings.subtitle')}</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-white border p-1 rounded-xl shadow-sm w-full md:w-auto grid grid-cols-2 md:inline-flex">
                    <TabsTrigger value="profile" className="data-[state=active]:bg-zone-blue-50 data-[state=active]:text-zone-blue-700 gap-2">
                        <User className="w-4 h-4" /> {t('settings.profile')}
                    </TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 gap-2">
                        <Lock className="w-4 h-4" /> {t('settings.security')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('settings.profile')}</CardTitle>
                                <CardDescription>{t('settings.subtitle')}</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleProfileUpdate}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nome">Nome Visualizzato (Display Name)</Label>
                                        <Input id="nome" name="nome" defaultValue={user?.nome || ''} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" value={user?.email || ''} disabled className="bg-slate-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="language">{t('settings.language')}</Label>
                                        <select
                                            id="language"
                                            name="language"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            defaultValue={user?.language || 'it'}
                                        >
                                            <option value="it">Italiano 🇮🇹</option>
                                            <option value="en">English 🇬🇧</option>
                                        </select>
                                    </div>
                                    {message && <p className={`text-sm font-medium ${message.includes('Success') || message.includes('Successo') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={isSaving} className="bg-zone-blue-600 hover:bg-zone-blue-700">
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        {t('settings.save_changes')}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('settings.title')}</CardTitle>
                                <CardDescription>{t('settings.subtitle')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-sm font-medium text-slate-600">{t('settings.daily_blocks')}</span>
                                    <span className="text-2xl font-bold text-zone-blue-600">11.0</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-sm font-medium text-slate-600">{t('settings.mode_label')}</span>
                                    <span className="text-sm font-bold text-slate-900 bg-white px-3 py-1 rounded border shadow-sm">
                                        {getRoleLabel(user?.role)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="security">
                    <Card className="max-w-md">
                        <CardHeader>
                            <CardTitle>{t('settings.update_password')}</CardTitle>
                            <CardDescription>{t('settings.subtitle')}</CardDescription>
                        </CardHeader>
                        <form onSubmit={handlePasswordChange}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">{t('settings.update_password')}</Label>
                                    <Input id="password" name="password" type="password" required minLength={8} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm">Confirm Password</Label>
                                    <Input id="confirm" name="confirm" type="password" required minLength={8} />
                                </div>
                                {message && <p className={`text-sm font-medium ${message.includes('Success') || message.includes('Successo') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isSaving} variant="outline" className="w-full">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                                    {t('settings.update_password')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}


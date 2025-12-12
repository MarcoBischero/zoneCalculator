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

    const { setLanguage } = useLanguage();

    const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');
        setIsSaving(true);

        const formData = new FormData(e.currentTarget);
        const nome = formData.get('nome');
        const language = formData.get('language') as string;

        try {
            const res = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, language })
            });

            if (res.ok) {
                setMessage('Successo: Impostazioni salvate');
                // Update Global Context
                if (language === 'it' || language === 'en') {
                    setLanguage(language as any);
                }
                router.refresh();
            } else {
                setMessage('Errore: Impossibile salvare');
            }
        } catch (error) {
            setMessage('Errore di Connessione');
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
            setMessage('Le password non corrispondono');
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
                setMessage('Successo: Password aggiornata');
                (e.target as HTMLFormElement).reset();
            } else {
                setMessage('Errore: Impossibile aggiornare la password');
            }
        } catch (error) {
            setMessage('Errore di Reata');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="p-4 md:p-8 space-y-8 min-h-screen bg-slate-50/50">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Impostazioni</h1>
                <p className="text-slate-500 mt-2">Gestisci il tuo profilo, preferenze e sicurezza.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-white border p-1 rounded-xl shadow-sm w-full md:w-auto grid grid-cols-2 md:inline-flex">
                    <TabsTrigger value="profile" className="data-[state=active]:bg-zone-blue-50 data-[state=active]:text-zone-blue-700 gap-2">
                        <User className="w-4 h-4" /> Profilo
                    </TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 gap-2">
                        <Lock className="w-4 h-4" /> Sicurezza
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informazioni Personali</CardTitle>
                                <CardDescription>Aggiorna i tuoi dati di base.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleProfileUpdate}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nome">Nome Visualizzato</Label>
                                        <Input id="nome" name="nome" defaultValue={user?.nome || ''} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" value={user?.email || ''} disabled className="bg-slate-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="language">Lingua</Label>
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
                                    {message && <p className={`text-sm font-medium ${message.includes('Successo') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={isSaving} className="bg-zone-blue-600 hover:bg-zone-blue-700">
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        Salva Modifiche
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Configurazione Zona</CardTitle>
                                <CardDescription>I tuoi parametri nutrizionali attuali.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-sm font-medium text-slate-600">Blocchi Giornalieri</span>
                                    <span className="text-2xl font-bold text-zone-blue-600">11.0</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-sm font-medium text-slate-600">Modalità</span>
                                    <span className="text-sm font-bold text-slate-900 bg-white px-3 py-1 rounded border shadow-sm">
                                        {user?.role === 1 ? 'Super Admin' : user?.role === 2 ? 'Dietista' : 'Utente Standard'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="security">
                    <Card className="max-w-md">
                        <CardHeader>
                            <CardTitle>Cambia Password</CardTitle>
                            <CardDescription>Aggiorna la password del tuo account.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handlePasswordChange}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Nuova Password</Label>
                                    <Input id="password" name="password" type="password" required minLength={8} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm">Conferma Password</Label>
                                    <Input id="confirm" name="confirm" type="password" required minLength={8} />
                                </div>
                                {message && <p className={`text-sm font-medium ${message.includes('Successo') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isSaving} variant="outline" className="w-full">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                                    Aggiorna Password
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}


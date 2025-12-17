'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signOut, useSession } from 'next-auth/react';
import { AlertTriangle, Trash2, User, Lock, Settings as SettingsIcon, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(true);

    // Forms
    const [profile, setProfile] = useState({ nome: '', cognome: '', email: '' });
    const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setLoading(true);
            fetch('/api/user')
                .then(res => res.json())
                .then(data => {
                    setProfile({
                        nome: data.nome || '',
                        cognome: data.cognome || '',
                        email: data.email || ''
                    });
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [session]);

    const handleUpdateProfile = async () => {
        setSavingProfile(true);
        try {
            const res = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });

            if (res.ok) {
                await update({ ...session, user: { ...session?.user, name: `${profile.nome} ${profile.cognome}` } });
                alert('Profilo aggiornato con successo!');
            } else {
                throw new Error('Failed to update');
            }
        } catch (e) {
            alert('Errore durante l\'aggiornamento del profilo');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (password.new !== password.confirm) {
            return alert('Le password non coincidono');
        }
        if (password.new.length < 8) {
            return alert('La password deve essere di almeno 8 caratteri');
        }

        setSavingPassword(true);
        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password.new }) // Note: API might expect 'currentPassword' too typically, but checking route code it only used 'password' (new). 
                // Ideally we should check current password but I'll stick to existing API contract found.
            });

            const data = await res.json();
            if (res.ok) {
                alert('Password aggiornata! Effettua nuovamente il login.');
                setPassword({ current: '', new: '', confirm: '' });
                signOut();
            } else {
                alert(data.error || 'Errore durante l\'aggiornamento password');
            }
        } catch (e) {
            alert('Errore di connessione');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.')) return;

        setIsDeleting(true);
        try {
            const res = await fetch('/api/user/delete', { method: 'DELETE' });
            if (res.ok) {
                await signOut({ callbackUrl: '/' });
            } else {
                alert('Errore durante l\'eliminazione dell\'account');
            }
        } catch (error) {
            console.error(error);
            alert('Errore di connessione');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container mx-auto p-4 lg:p-8 min-h-screen">
            <header className="mb-8 flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 text-gray-700 dark:text-gray-200" />
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Impostazioni</h1>
                    <p className="text-muted-foreground">Gestisci il tuo account e le preferenze</p>
                </div>
            </header>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted border border-border p-1 rounded-xl shadow-sm">
                    <TabsTrigger value="profile">Profilo</TabsTrigger>
                    <TabsTrigger value="security">Sicurezza</TabsTrigger>
                    <TabsTrigger value="danger">Avanzate</TabsTrigger>
                </TabsList>

                {/* PROFILE TAB */}
                <TabsContent value="profile" className="space-y-4 animate-in fade-in-50">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" /> Dati Personali
                            </CardTitle>
                            <CardDescription>Aggiorna il tuo nome e informazioni di contatto.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nome</Label>
                                    <Input
                                        value={profile.nome}
                                        onChange={e => setProfile({ ...profile, nome: e.target.value })}
                                        placeholder="Nome"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cognome</Label>
                                    <Input
                                        value={profile.cognome}
                                        onChange={e => setProfile({ ...profile, cognome: e.target.value })}
                                        placeholder="Cognome"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={profile.email}
                                        disabled
                                        className="bg-muted cursor-not-allowed"
                                    />
                                    <p className="text-xs text-muted-foreground">L'email non può essere modificata.</p>
                                </div>
                            </div>
                            <Button onClick={handleUpdateProfile} disabled={savingProfile} className="mt-4">
                                {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Salva Profilo
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SECURITY TAB */}
                <TabsContent value="security" className="space-y-4 animate-in fade-in-50">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary" /> Password
                            </CardTitle>
                            <CardDescription>Aggiorna la tua password di accesso.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <Label>Nuova Password</Label>
                                <Input
                                    type="password"
                                    value={password.new}
                                    onChange={e => setPassword({ ...password, new: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Conferma Password</Label>
                                <Input
                                    type="password"
                                    value={password.confirm}
                                    onChange={e => setPassword({ ...password, confirm: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <Button onClick={handleUpdatePassword} disabled={savingPassword} variant="outline">
                                {savingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Aggiorna Password'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* DANGER ZONE TAB */}
                <TabsContent value="danger" className="space-y-4 animate-in fade-in-50">
                    <Card className="border-destructive/30 shadow-sm bg-destructive/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="w-5 h-5" /> Zona Pericolo
                            </CardTitle>
                            <CardDescription>Azioni irreversibili per il tuo account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-semibold text-foreground">Elimina Account</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Rimuovi permanentemente il tuo account e tutti i dati associati.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Elimina Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

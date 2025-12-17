'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const username = formData.get('username') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        const role = formData.get('role') as string;

        if (password !== confirmPassword) {
            setError('Le password non corrispondono');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('La password deve essere di almeno 6 caratteri');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, role })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Errore durante la registrazione');
            } else {
                // Success: Redirect to login
                router.push('/login?registered=true');
            }
        } catch (err) {
            setError('Si è verificato un errore di connessione');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">
                    Crea Account
                </h1>
                <p className="text-sm text-muted-foreground">
                    Inizia il tuo viaggio nella Zona
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Il tuo nome utente"
                        required
                        disabled={isLoading}
                        className="bg-white/50 dark:bg-black/20"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="tuo@email.com"
                        required
                        disabled={isLoading}
                        className="bg-white/50 dark:bg-black/20"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Min. 6 caratteri"
                        required
                        disabled={isLoading}
                        className="bg-white/50 dark:bg-black/20"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Conferma Password</Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Ripeti password"
                        required
                        disabled={isLoading}
                        className="bg-white/50 dark:bg-black/20"
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-900/50">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <div className="space-y-3 pt-2">
                    <Label>Chi sei?</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <input
                                type="radio"
                                name="role"
                                id="role-patient"
                                value="patient"
                                className="peer sr-only"
                                defaultChecked
                            />
                            <Label
                                htmlFor="role-patient"
                                className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-white dark:bg-black/20 p-4 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary peer-checked:text-primary cursor-pointer transition-all"
                            >
                                <span className="text-2xl mb-2">👤</span>
                                <span className="font-semibold">Utente</span>
                            </Label>
                        </div>
                        <div className="relative">
                            <input
                                type="radio"
                                name="role"
                                id="role-dietician"
                                value="dietician"
                                className="peer sr-only"
                            />
                            <Label
                                htmlFor="role-dietician"
                                className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-white dark:bg-black/20 p-4 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary peer-checked:text-primary cursor-pointer transition-all"
                            >
                                <span className="text-2xl mb-2">👨‍⚕️</span>
                                <span className="font-semibold">Dietista</span>
                            </Label>
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20 mt-4"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registrazione...
                        </>
                    ) : (
                        'Registrati Gratis'
                    )}
                </Button>
            </form>

            <div className="text-center text-sm">
                <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Torna al Login
                </Link>
            </div>
        </div>
    );
}

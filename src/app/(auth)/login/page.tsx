'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        try {
            const res = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError('Credenziali non valide');
                setIsLoading(false);
            } else {
                // Track login: update IP and access timestamps
                try {
                    await fetch('/api/auth/track-login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                } catch (trackError) {
                    // Non-blocking error - login still succeeded
                    console.warn('Failed to track login:', trackError);
                }

                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('Si è verificato un errore');
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    ZoneCalculator
                </h1>
                <p className="text-sm text-muted-foreground">
                    Accedi per gestire la tua zona
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Inserisci il tuo username"
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
                        placeholder="••••••••"
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

                <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Accesso in corso...
                        </>
                    ) : (
                        'Accedi'
                    )}
                </Button>
            </form>
        </div>
    );
}

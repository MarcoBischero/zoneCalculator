'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Lock } from 'lucide-react';

export function TrialGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isExpired, setIsExpired] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkTrial = async () => {
            if (status === 'loading') return;
            if (status === 'unauthenticated') {
                setIsLoading(false);
                return;
            }

            try {
                // Fetch user createdAt
                const res = await fetch('/api/user/status'); // We need this endpoint
                if (res.ok) {
                    const data = await res.json();

                    if (data.createdAt) {
                        const created = new Date(data.createdAt);
                        const now = new Date();
                        const diffTime = Math.abs(now.getTime() - created.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        // 21 Days Trial
                        if (diffDays > 21) {
                            setIsExpired(true);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to check trial status", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkTrial();
    }, [status]);

    if (isLoading) {
        return null; // Don't block UI while checking, or show loading
    }

    if (isExpired) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                <Card className="w-full max-w-md shadow-2xl border-destructive/20 ring-1 ring-destructive/10">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-destructive" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-destructive">Periodo di Prova Terminato</CardTitle>
                        <CardDescription className="text-lg pt-2">
                            I tuoi 21 giorni di prova gratuita sono scaduti.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-muted-foreground">
                            Speriamo che ZoneCalculator PRO ti sia stato utile! Per continuare ad utilizzare tutte le funzionalità, contatta l'amministrazione per un piano completo.
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button className="w-full text-lg h-12" onClick={() => window.location.href = 'mailto:marco.biscardi@gmail.com?subject=Richiesta%20Piano%20Completo%20ZoneCalculator'}>
                            Richiedi Accesso Completo
                        </Button>
                        <Button variant="ghost" onClick={() => {
                            // Optional: Logout user
                            // signOut({ callbackUrl: '/' });
                        }}>
                            Esci
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, Star } from 'lucide-react';

export function UpgradeModal({ trigger }: { trigger?: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleUpgradeClick = () => {
        // Direct mailto link for reliability without backend email service
        window.location.href = "mailto:marco.biscardi@gmail.com?subject=Richiesta%20Piano%20Completo%20ZoneCalculator&body=Ciao,%20vorrei%20avere%20maggiori%20informazioni%20sul%20piano%20completo.";
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20"><Star className="w-4 h-4 mr-2 fill-current" /> Upgrade PRO</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-600" />
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Star className="w-6 h-6 text-orange-500 fill-orange-500" />
                        Sblocca Tutto
                    </DialogTitle>
                    <DialogDescription>
                        Ottieni accesso illimitato a tutti i pasti, funzioni AI e supporto prioritario.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
                            <span className="text-sm font-medium">Accesso a tutti i 100+ Pasti</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
                            <span className="text-sm font-medium">Coach AI illimitato</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
                            <span className="text-sm font-medium">Supporto Nutrizionista</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleUpgradeClick} className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg h-12">
                        Contatta per Upgrade
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';

interface AddUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userToEdit?: any;
}

export function AddUserDialog({ isOpen, onClose, onSuccess, userToEdit }: AddUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: '3'
    });

    // Load data on open
    useState(() => {
        if (userToEdit) {
            setFormData({
                username: userToEdit.username,
                email: userToEdit.email,
                password: '', // Don't show hash
                role: userToEdit.roleId?.toString() || '0'
            });
        }
    });

    // Reset when dialog opens/closes or userToEdit changes
    // Better use useEffect
    const [prevId, setPrevId] = useState<number | null>(null);
    if (isOpen && userToEdit && userToEdit.id !== prevId) {
        setFormData({
            username: userToEdit.username,
            email: userToEdit.email || '',
            password: '',
            role: userToEdit.roleId?.toString() || '3'
        });
        setPrevId(userToEdit.id);
    } else if (isOpen && !userToEdit && prevId !== null) {
        setFormData({ username: '', email: '', password: '', role: '3' });
        setPrevId(null);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = '/api/admin/users';
            const method = userToEdit ? 'PUT' : 'POST';

            // Clean payload
            const payload = { ...formData };
            if (!payload.password) delete (payload as any).password;

            const body = userToEdit ? { ...payload, id: userToEdit.id } : payload;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setFormData({ username: '', email: '', password: '', role: '3' });
                onSuccess();
                onClose();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save user');
            }
        } catch (e) {
            console.error(e);
            alert('Error saving user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{userToEdit ? 'Modifica Utente' : 'Aggiungi Utente'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Username
                        </Label>
                        <Input
                            id="username"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>

                    {/* Password Field: Auto-Gen for New, Optional Reset for Edit */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right text-slate-400">
                            Password
                        </Label>
                        {userToEdit ? (
                            <Input
                                id="password"
                                type="password"
                                placeholder="Lascia vuoto per mantenere attuale"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="col-span-3"
                            />
                        ) : (
                            <div className="col-span-3 text-sm text-slate-500 italic">
                                Sarà generata automaticamente e inviata via email.
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Ruolo
                        </Label>
                        <div className="col-span-3">
                            <select
                                id="role"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="3">Paziente</option>
                                <option value="1">Amministratore</option>
                                <option value="2">Dietista</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annulla</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {userToEdit ? 'Salva Modifiche' : 'Crea Utente'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

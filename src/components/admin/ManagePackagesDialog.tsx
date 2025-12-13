import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Package {
    id: number;
    name: string;
    type: 'FOOD' | 'MEAL';
    isSystem: boolean;
}

interface ManagePackagesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    user: any; // User object
}

export function ManagePackagesDialog({ isOpen, onClose, user }: ManagePackagesDialogProps) {
    const [packages, setPackages] = useState<Package[]>([]);
    const [assignedIds, setAssignedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            loadData();
        }
    }, [isOpen, user]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load all available packages (filtered by visibility logic in API)
            const pkgRes = await fetch('/api/packages');
            const pkgData = await pkgRes.json();
            setPackages(pkgData);

            // Load assigned packages for this user
            const assignedRes = await fetch(`/api/users/${user.id}/packages`);
            const assignedData = await assignedRes.json();
            setAssignedIds(assignedData.map((p: any) => p.id));
        } catch (error) {
            toast.error('Failed to load package data');
        } finally {
            setLoading(false);
        }
    };

    const togglePackage = async (pkgId: number, isAssigned: boolean) => {
        // Optimistic update
        const originalIds = [...assignedIds];
        if (isAssigned) {
            setAssignedIds(prev => [...prev, pkgId]);
        } else {
            setAssignedIds(prev => prev.filter(id => id !== pkgId));
        }

        try {
            const action = isAssigned ? 'assign' : 'remove';
            const res = await fetch(`/api/users/${user.id}/packages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId: pkgId, action })
            });

            if (!res.ok) throw new Error('Failed');
        } catch (error) {
            toast.error('Failed to update package assignment');
            setAssignedIds(originalIds); // Revert
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="glass-panel max-w-lg">
                <DialogHeader>
                    <DialogTitle>Manage Packages for {user.username}</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="space-y-4">
                            {/* Food Packages */}
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Food Packages</h3>
                                <div className="space-y-2">
                                    {packages.filter(p => p.type === 'FOOD').map(pkg => (
                                        <div key={pkg.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors">
                                            <Checkbox
                                                id={`pkg-${pkg.id}`}
                                                checked={assignedIds.includes(pkg.id)}
                                                onCheckedChange={(checked) => togglePackage(pkg.id, !!checked)}
                                            />
                                            <div className="flex-1">
                                                <label htmlFor={`pkg-${pkg.id}`} className="text-sm font-medium cursor-pointer select-none block">
                                                    {pkg.name}
                                                    {pkg.isSystem && <Badge variant="secondary" className="ml-2 text-[10px]">SYSTEM</Badge>}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                    {packages.filter(p => p.type === 'FOOD').length === 0 && <p className="text-sm text-muted-foreground italic">No packages found.</p>}
                                </div>
                            </div>

                            {/* Meal Packages */}
                            <div className="pt-2">
                                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Meal Packages</h3>
                                <div className="space-y-2">
                                    {packages.filter(p => p.type === 'MEAL').map(pkg => (
                                        <div key={pkg.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors">
                                            <Checkbox
                                                id={`pkg-${pkg.id}`}
                                                checked={assignedIds.includes(pkg.id)}
                                                onCheckedChange={(checked) => togglePackage(pkg.id, !!checked)}
                                            />
                                            <div className="flex-1">
                                                <label htmlFor={`pkg-${pkg.id}`} className="text-sm font-medium cursor-pointer select-none block">
                                                    {pkg.name}
                                                    {pkg.isSystem && <Badge variant="secondary" className="ml-2 text-[10px]">SYSTEM</Badge>}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                    {packages.filter(p => p.type === 'MEAL').length === 0 && <p className="text-sm text-muted-foreground italic">No packages found.</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

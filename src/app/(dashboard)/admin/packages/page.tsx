'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Package as PackageIcon, Trash2, Edit, Save, X, Search, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ManagePackageItemsDialog } from '@/components/admin/ManagePackageItemsDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface Package {
    id: number;
    name: string;
    description: string;
    type: 'FOOD' | 'MEAL';
    isSystem: boolean;
    ownerId: number;
    _count?: {
        items: number;
        assignedTo: number;
    };
}

export default function PackagesPage() {
    const { data: session } = useSession();
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Create Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newPackage, setNewPackage] = useState({ name: '', description: '', type: 'MEAL' as 'FOOD' | 'MEAL', isSystem: false });

    // Manage Items Modal State
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [isManageItemsOpen, setIsManageItemsOpen] = useState(false);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/packages');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setPackages(data);
        } catch (error) {
            toast.error('Failed to load packages');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newPackage.name) return toast.error('Name is required');

        try {
            const res = await fetch('/api/packages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPackage)
            });

            if (!res.ok) throw new Error('Failed to create');

            toast.success('Package created');
            setIsCreateOpen(false);
            setNewPackage({ name: '', description: '', type: 'MEAL', isSystem: false });
            fetchPackages();
        } catch (error) {
            toast.error('Failed to create package');
        }
    };

    const isAdmin = (session?.user as any)?.role === 1;

    // Filter
    const filteredPackages = packages.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
                        <PackageIcon className="w-8 h-8 text-primary" />
                        Package Manager
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage food/meal bundles for your patients.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                                <Plus className="w-4 h-4" /> Create Package
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-panel border-white/10">
                            <DialogHeader>
                                <DialogTitle>New Package</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <Input
                                        placeholder="e.g. Weight Loss Phase 1"
                                        value={newPackage.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPackage({ ...newPackage, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Type</label>
                                    <select
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newPackage.type}
                                        onChange={(e) => setNewPackage({ ...newPackage, type: e.target.value as 'FOOD' | 'MEAL' })}
                                    >
                                        <option value="MEAL">Meal Package</option>
                                        <option value="FOOD">Food Package</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea
                                        placeholder="Description..."
                                        value={newPackage.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewPackage({ ...newPackage, description: e.target.value })}
                                    />
                                </div>

                                {isAdmin && (
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="isSystem"
                                            checked={newPackage.isSystem}
                                            onCheckedChange={(checked) => setNewPackage({ ...newPackage, isSystem: !!checked })}
                                        />
                                        <label htmlFor="isSystem" className="text-sm cursor-pointer select-none">System Base Package</label>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate}>Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex gap-4 items-center bg-card/50 p-4 rounded-xl border border-border/50">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Search packages..."
                    value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    className="border-none bg-transparent focus-visible:ring-0"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-xl bg-muted/20 animate-pulse" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPackages.map(pkg => (
                        <Card key={pkg.id} className="glass-card hover:shadow-xl transition-all duration-300 border-border/50 group">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                            {pkg.isSystem && <Badge variant="secondary" className="text-[10px]">SYSTEM</Badge>}
                                        </div>
                                        <CardDescription className="line-clamp-2 mt-1 min-h-[40px]">
                                            {pkg.description || "No description"}
                                        </CardDescription>
                                    </div>
                                    <Badge className={cn(
                                        "capitalize",
                                        pkg.type === 'FOOD' ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                                    )}>
                                        {pkg.type}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                                    <div className="bg-muted/30 p-2 rounded-lg text-center">
                                        <div className="font-bold text-foreground text-lg">{pkg._count?.items || 0}</div>
                                        <div className="text-xs uppercase tracking-wider">Items</div>
                                    </div>
                                    <div className="bg-muted/30 p-2 rounded-lg text-center">
                                        <div className="font-bold text-foreground text-lg">{pkg._count?.assignedTo || 0}</div>
                                        <div className="text-xs uppercase tracking-wider">Assigned</div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2 border-t border-border/10">
                                    {/* Action buttons (Edit Items) - To be implemented fully */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                                        onClick={() => {
                                            setSelectedPackage(pkg);
                                            setIsManageItemsOpen(true);
                                        }}
                                    >
                                        Manage Content
                                    </Button>
                                    {/* Delete - only if 0 assigned? Or generic delete */}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Manage Content Dialog */}
            {selectedPackage && (
                <ManagePackageItemsDialog
                    pkg={selectedPackage}
                    open={isManageItemsOpen}
                    onOpenChange={(open) => {
                        setIsManageItemsOpen(open);
                        if (!open) fetchPackages(); // Refresh counts when closing
                    }}
                />
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Trash2, Loader2, Utensils, Apple } from 'lucide-react';
import { toast } from 'sonner';
import he from 'he';
import { ScrollArea } from "@/components/ui/scroll-area"

interface Package {
    id: number;
    name: string;
    type: 'FOOD' | 'MEAL';
}

interface Item {
    id: number;
    foodId: number | null;
    mealId: number | null;
    alimento?: { nome: string; };
    pasto?: { nome: string; };
}

interface AvailableItem {
    id: number; // codicePasto or codiceAlimento
    name: string;
    type: string; // for UI
}

interface ManagePackageItemsDialogProps {
    pkg: Package;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ManagePackageItemsDialog({ pkg, open, onOpenChange }: ManagePackageItemsDialogProps) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);

    // Search for adding new items
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<AvailableItem[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (open && pkg) {
            fetchPackageItems();
        }
    }, [open, pkg]);

    useEffect(() => {
        if (open && searchQuery.length > 2) {
            const delayDebounceFn = setTimeout(() => {
                searchAvailableItems();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, open]);

    const fetchPackageItems = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/packages/${pkg.id}/items`);
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            toast.error('Failed to load items');
        } finally {
            setLoading(false);
        }
    };

    const searchAvailableItems = async () => {
        setSearching(true);
        try {
            // Depending on package type, search foods or meals
            const endpoint = pkg.type === 'FOOD' ? '/api/foods' : '/api/meals';
            // We need a search param on these endpoints usually?
            // Existing endpoints:
            // GET /api/foods?q=... (returns array of Alimento)
            // GET /api/meals is for "My Meals". We might need a generic search or ensuring "My Meals" returns what we want.
            // For Food: It's public usually + private.
            // For Meal: Dietician wants to add THEIR meals or SYSTEM meals to package?
            // Usually Dietician creates a meal, then adds it to a package.

            // NOTE: The current /api/meals endpoint returns user's meals.
            // When Dietician searches, they should see THEIR meals (to add to package).

            // Construct query
            let url = `${endpoint}?query=${encodeURIComponent(searchQuery)}`;
            // Verify if endpoint supports 'query'. /api/foods does supports 'search'? Or returns all?
            // /api/foods/route.ts -> const search = searchParams.get('search');
            // /api/meals/route.ts -> filters by name in JS if not in DB? 
            // Actually /api/meals returns ALL meals for user, client filters? No, let's check code.
            // MealsListPage client does filtering. API returns all. That's inefficient but ok for now. 
            // Foods API does search.

            if (pkg.type === 'FOOD') {
                url = `/api/foods?search=${encodeURIComponent(searchQuery)}`;
            } else {
                url = `/api/meals`; // This returns all meals, we filter client side for now just like MealsPage
            }

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                let params: AvailableItem[] = [];

                if (pkg.type === 'FOOD') {
                    // data is array of Alimento
                    params = data.map((f: any) => ({
                        id: f.codiceAlimento, // check key
                        name: f.nome,
                        type: 'Food'
                    }));
                } else {
                    // data.meals or data
                    const list = data.meals || data;
                    if (Array.isArray(list)) {
                        params = list
                            .filter((m: any) => m.nome.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((m: any) => ({
                                id: m.codicePasto,
                                name: m.nome,
                                type: m.mealType || 'Meal'
                            }));
                    }
                }
                setSearchResults(params.slice(0, 10)); // Limit to 10
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSearching(false);
        }
    };

    const handleAddItem = async (item: AvailableItem) => {
        // Optimistic
        const tempId = Date.now();

        try {
            const payload = pkg.type === 'FOOD' ? { foodId: item.id } : { mealId: item.id };
            const res = await fetch(`/api/packages/${pkg.id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to add');

            const newItem = await res.json();

            // Refresh list to be safe or append
            // newItem has relation expanded? No.
            // Manually construct for UI
            const uiItem: any = {
                ...newItem,
                alimento: pkg.type === 'FOOD' ? { nome: item.name } : null,
                pasto: pkg.type === 'MEAL' ? { nome: item.name } : null,
            };

            setItems([uiItem, ...items]);
            toast.success('Item added');
            setSearchQuery(''); // Clear search
        } catch (error) {
            toast.error('Failed to add item');
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        try {
            const res = await fetch(`/api/packages/${pkg.id}/items?itemId=${itemId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed');

            setItems(items.filter(i => i.id !== itemId));
            toast.success('Item removed');
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col glass-panel border-white/10">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Manage Content: <span className="text-primary">{pkg.name}</span>
                        <Badge variant="outline" className="ml-2">{pkg.type}</Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 flex-1 overflow-hidden py-4">
                    {/* Search Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">Add New {pkg.type === 'FOOD' ? 'Food' : 'Meal'}</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={`Search ${pkg.type.toLowerCase()}s to add...`}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 bg-white/5 border-white/10"
                            />
                            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
                        </div>

                        {/* Search Results */}
                        {searchQuery.length > 2 && (
                            <div className="bg-popover/50 backdrop-blur-xl border border-white/10 rounded-md overflow-hidden max-h-40 overflow-y-auto">
                                {searchResults.length === 0 && !searching ? (
                                    <div className="p-3 text-sm text-center text-muted-foreground">No matches found</div>
                                ) : (
                                    searchResults.map(res => (
                                        <div key={res.id} className="flex items-center justify-between p-2 hover:bg-white/10 cursor-pointer transition-colors" onClick={() => handleAddItem(res)}>
                                            <div className="flex items-center gap-2">
                                                {pkg.type === 'FOOD' ? <Apple className="w-4 h-4 opacity-50" /> : <Utensils className="w-4 h-4 opacity-50" />}
                                                <span className="text-sm font-medium">{he.decode(res.name)}</span>
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-green-500">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pending Items List */}
                    <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
                        <label className="text-sm font-medium text-muted-foreground">Items in Package ({items.length})</label>
                        <ScrollArea className="flex-1 bg-black/20 rounded-xl border border-white/5 p-2">
                            {loading ? (
                                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
                            ) : items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground opacity-50 gap-2">
                                    <PackageIcon className="w-10 h-10" />
                                    <p>This package is empty.</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {items.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                {pkg.type === 'FOOD' ? (
                                                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                                        <Apple className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                                        <Utensils className="w-4 h-4" />
                                                    </div>
                                                )}
                                                <span className="font-medium text-sm">
                                                    {he.decode(item.alimento?.nome || item.pasto?.nome || 'Unknown Item')}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                onClick={() => handleRemoveItem(item.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Helper icon
function PackageIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16.5 9.4 7.55 4.24" />
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.29 7 12 12 20.71 7" />
            <line x1="12" x2="12" y1="22" y2="12" />
        </svg>
    )
}

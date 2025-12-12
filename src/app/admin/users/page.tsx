'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserPlus, Shield, Trash2, Search, Stethoscope, Loader2 } from 'lucide-react';
import { AddUserDialog } from '@/components/admin/AddUserDialog';

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (status === 'authenticated') {
            const roleId = Number((session?.user as any)?.role);
            const isSuperAdmin = roleId === 1;
            const isDietician = roleId === 2;

            // Redirect non-admin users
            if (!isSuperAdmin && !isDietician) {
                router.push('/');
                return;
            }

            fetchUsers();
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, session, router]);

    const fetchUsers = async () => {
        // Don't set global loading to true on refresh to avoid flickering, or handle gracefully
        // setLoading(true); 
        try {
            const res = await fetch(`/api/admin/users?_=${new Date().getTime()}`, {
                cache: 'no-store',
                headers: { 'Pragma': 'no-cache' }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                setError('Failed to fetch users');
            }
        } catch (e) {
            console.error(e);
            setError('Error loading users');
        } finally {
            setLoading(false);
        }
    };

    const [editingUser, setEditingUser] = useState<any>(null);

    // Ensure dialog opens cleanly
    const openNewUser = () => {
        setEditingUser(null);
        setIsAdding(true);
    };

    const openEditUser = (u: any) => {
        setEditingUser(u);
        setIsAdding(true);
    };

    const filteredUsers = users.filter(u =>
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (roleId: number) => {
        switch (roleId) {
            case 1: return <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 flex items-center w-fit"><Shield className="w-3 h-3 mr-1" /> ADMIN</span>;
            case 2: return <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 flex items-center w-fit"><Stethoscope className="w-3 h-3 mr-1" /> DIETISTA</span>;
            default: return <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600">USER</span>;
        }
    };

    if (status === 'loading' || loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                        <Shield className="mr-3 h-8 w-8 text-indigo-600" /> Admin Dashboard
                    </h1>
                    <p className="text-slate-500">Gestione Utenti e Ruoli</p>
                </div>
                <Button onClick={openNewUser}>
                    <UserPlus className="mr-2 h-4 w-4" /> Aggiungi Utente
                </Button>
            </div>

            <AddUserDialog
                isOpen={isAdding}
                onClose={() => setIsAdding(false)}
                userToEdit={editingUser}
                onSuccess={() => {
                    fetchUsers();
                    setIsAdding(false);
                }}
            />

            {/* User List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                    <Search className="text-slate-400 w-5 h-5" />
                    <input
                        className="flex-1 outline-none text-sm"
                        placeholder="Cerca utenti..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="p-4 font-medium">ID</th>
                            <th className="p-4 font-medium">Username</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Ruolo</th>
                            <th className="p-4 font-medium">Ultimo Accesso</th>
                            <th className="p-4 font-medium text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-500">#{user.id}</td>
                                <td className="p-4 font-medium text-slate-900">{user.username}</td>
                                <td className="p-4 text-slate-500">{user.email || '-'}</td>
                                <td className="p-4">
                                    {getRoleBadge(user.idRuolo)}
                                </td>
                                <td className="p-4 text-slate-400 font-mono text-xs">
                                    {user.lastaccess ? new Date(user.lastaccess * 1000).toLocaleDateString() : '-'}
                                </td>
                                <td className="p-4 text-right">
                                    <Button variant="ghost" size="sm" onClick={() => openEditUser(user)}>
                                        Modifica
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

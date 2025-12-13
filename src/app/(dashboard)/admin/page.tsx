'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, Users, Crown, Shield } from 'lucide-react';

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newUserOpen, setNewUserOpen] = useState(false);

    // New User State
    const [formData, setFormData] = useState({ username: '', password: '', email: '', targetRole: '3' });

    useEffect(() => {
        if (status === 'authenticated') {
            const roleId = Number((session?.user as any)?.role);
            const isSuperAdmin = roleId === 1;
            const isDietician = roleId === 2;

            // Redirect non-admin users immediately
            if (!isSuperAdmin && !isDietician) {
                router.push('/');
                return;
            }

            // Redirect to the main users management page
            router.push('/admin/users');
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, session, router]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (Array.isArray(data)) setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        if (!formData.username || !formData.password) return alert("Username and Password required");

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                alert("User Created!");
                setNewUserOpen(false);
                setFormData({ username: '', password: '', email: '', targetRole: '3' });
                fetchUsers();
            } else {
                alert("Error: " + data.error);
            }
        } catch (e) {
            alert("Network Error");
        }
    };

    if (status === 'loading') return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    const roleId = Number((session?.user as any)?.role);
    const isSuperAdmin = roleId === 1;
    const isDietician = roleId === 2;

    // Show nothing while redirecting
    if (!isSuperAdmin && !isDietician) {
        return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        {isSuperAdmin ? <Crown className="text-yellow-500" /> : <Shield className="text-indigo-500" />}
                        {isSuperAdmin ? 'Super Admin Console' : 'Dietician Portal'}
                    </h1>
                    <p className="text-slate-500">Manage your {isSuperAdmin ? 'platform' : 'clinic'} users.</p>
                </div>
                <Button onClick={() => setNewUserOpen(!newUserOpen)} className="bg-slate-900 text-white hover:bg-slate-800">
                    <UserPlus className="mr-2 h-4 w-4" /> Add {isSuperAdmin ? 'User' : 'Patient'}
                </Button>
            </div>

            {newUserOpen && (
                <Card className="max-w-md animate-in slide-in-from-top-4">
                    <CardHeader>
                        <CardTitle>Create New Account</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <input
                            placeholder="Username"
                            className="w-full p-2 border rounded"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                        />
                        <input
                            placeholder="Email"
                            className="w-full p-2 border rounded"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                        <input
                            placeholder="Password"
                            type="password"
                            className="w-full p-2 border rounded"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                        {isSuperAdmin && (
                            <select
                                className="w-full p-2 border rounded"
                                value={formData.targetRole}
                                onChange={e => setFormData({ ...formData, targetRole: e.target.value })}
                            >
                                <option value="1">Super Admin</option>
                                <option value="2">Dietician</option>
                                <option value="3">Patient</option>
                            </select>
                        )}
                        <Button onClick={handleCreateUser} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            Create Account
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {isSuperAdmin ? 'All Users Registry' : 'My Patients'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-400" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Username</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Role</th>
                                        {isSuperAdmin && <th className="px-4 py-3">Managed By</th>}
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-mono text-slate-400">#{user.id}</td>
                                            <td className="px-4 py-3 font-bold text-slate-800">{user.username}</td>
                                            <td className="px-4 py-3 text-slate-600">{user.email || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold 
                                                    ${user.roleId === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                        user.roleId === 2 ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            {isSuperAdmin && <td className="px-4 py-3 text-slate-500">{user.dietician || '-'}</td>}
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600">Edit</Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-slate-400">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

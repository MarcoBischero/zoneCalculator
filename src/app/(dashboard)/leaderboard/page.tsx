'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Crown } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function LeaderboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<{ global: any[], local: any[] }>({ global: [], local: [] });
    const [loading, setLoading] = useState(true);

    // Localization
    const lang = (session?.user as any)?.language || 'it';
    const t = {
        it: {
            title: 'Classifica',
            global: 'Mondiale',
            local: 'La Mia Clinica',
            rank: '#',
            user: 'Utente',
            points: 'Punti',
            level: 'Livello',
            empty: 'Nessun dato ancora.'
        },
        en: {
            title: 'Leaderboard',
            global: 'Worldwide',
            local: 'My Clinic',
            rank: '#',
            user: 'User',
            points: 'Points',
            level: 'Level',
            empty: 'No data yet.'
        }
    };
    const text = (t as any)[lang] || t.it;

    useEffect(() => {
        fetch('/api/leaderboard')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const Row = ({ rank, username, points, level, streak }: any) => (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-100 mb-2 shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${rank === 1 ? 'bg-yellow-100 text-yellow-600' : rank === 2 ? 'bg-slate-100 text-slate-600' : rank === 3 ? 'bg-orange-100 text-orange-600' : 'text-slate-400'}`}>
                    {rank <= 3 ? <Trophy className="w-4 h-4" /> : rank}
                </div>
                <div>
                    <div className="font-bold text-slate-800">{username}</div>
                    <div className="text-xs text-slate-400">Streak: {streak} days</div>
                </div>
            </div>
            <div className="text-right">
                <div className="font-bold text-zone-blue-600">{points} pts</div>
                <div className="text-xs text-slate-400">Lvl {level}</div>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 min-h-screen bg-slate-50">
            <div className="flex items-center gap-2 mb-8">
                <Crown className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-black text-slate-900">{text.title}</h1>
            </div>

            <Tabs defaultValue="local" className="space-y-6">
                <TabsList className="bg-white border p-1 rounded-xl shadow-sm">
                    <TabsTrigger value="local" className="data-[state=active]:bg-zone-blue-50 data-[state=active]:text-zone-blue-700">{text.local}</TabsTrigger>
                    <TabsTrigger value="global" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">{text.global}</TabsTrigger>
                </TabsList>

                <TabsContent value="local">
                    {stats.local.length > 0 ? (
                        stats.local.map((p, i) => <Row key={i} {...p} />)
                    ) : (
                        <div className="text-center py-10 text-slate-400">{text.empty}</div>
                    )}
                </TabsContent>

                <TabsContent value="global">
                    {stats.global.length > 0 ? (
                        stats.global.map((p, i) => <Row key={i} {...p} />)
                    ) : (
                        <div className="text-center py-10 text-slate-400">{text.empty}</div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

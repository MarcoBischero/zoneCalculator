'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, PieChart as PieChartIcon, Calendar, Loader2 } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
                <p className="font-bold text-slate-700">{label}</p>
                <div className="text-zone-blue-600 font-semibold">
                    {payload[0].name}: {payload[0].value}
                </div>
                {payload[1] && (
                    <div className="text-slate-400 text-xs mt-1">
                        {payload[1].name}: {payload[1].value}
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export default function ReportsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/reports')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center">Nessun dato disponibile.</div>;

    const { weightData, adherenceData, macroData, currentWeight, weightTrend, currentBlocks } = data;

    return (
        <div className="p-4 md:p-8 space-y-8 min-h-screen bg-background">
            <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">I Tuoi Progressi</h1>
                <p className="text-muted-foreground mt-2">Monitora il tuo percorso in Zona, metriche corporee e aderenza.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Peso Attuale</CardTitle>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentWeight} kg</div>
                        <p className={`text-xs flex items-center mt-1 ${weightTrend <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            <TrendingUp className="w-3 h-3 mr-1" /> {weightTrend > 0 ? '+' : ''}{weightTrend.toFixed(1)}kg vs ultimo check
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Target Blocchi</CardTitle>
                        <PieChartIcon className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentBlocks.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Giornalieri</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Piano Settimanale</CardTitle>
                        <Calendar className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Attivo</div>
                        <p className="text-xs text-green-500 mt-1">Calendario Aggiornato</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Panoramica</TabsTrigger>
                    <TabsTrigger value="weight">Storico Peso</TabsTrigger>
                    <TabsTrigger value="blocks">Analisi Blocchi</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Weight Chart */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Andamento Peso</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={weightData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line type="monotone" dataKey="weight" name="Peso" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Adherence Chart */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Aderenza Blocchi (Piano)</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={adherenceData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: '#f1f5f9' }} content={<CustomTooltip />} />
                                        <Bar dataKey="consumed" name="Pianificato" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                                        <Bar dataKey="target" name="Obiettivo" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Macro Split */}
                        <Card className="col-span-1 lg:col-span-2">
                            <div className="flex flex-col md:flex-row items-center">
                                <div className="p-6 flex-1">
                                    <h3 className="text-lg font-bold mb-2">Distribuzione Macro</h3>
                                    <p className="text-slate-500 text-sm mb-4">La Dieta a Zona mira a una suddivisione calorica 40/30/30, garantita automaticamente se rispetti il rapporto 1:1:1 dei blocchi.</p>
                                    <div className="space-y-2">
                                        {macroData.map((entry: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center">
                                                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                                                    <span>{entry.name}</span>
                                                </div>
                                                <span className="font-bold">{entry.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-[250px] w-full md:w-1/2 p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={macroData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {macroData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="weight" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dettaglio Storico Peso</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weightData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" />
                                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="weight" stroke="#f97316" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="blocks" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analisi Dettagliata Blocchi</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={adherenceData}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="consumed" name="Pianificato" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="target" name="Obiettivo" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}


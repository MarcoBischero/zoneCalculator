'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Calendar, Activity, TrendingUp, Utensils, Droplets, Flame, Calculator, UtensilsCrossed, Trophy } from "lucide-react";
import { DailyNews } from "@/components/dashboard/DailyNews";
import { RecentMeals } from "@/components/dashboard/RecentMeals"; // New Import
import { cn } from "@/lib/utils";

export default function Home() {
    const { data: session } = useSession();
    const [chartData, setChartData] = useState<{ labels: string[], weightData: number[], blockData: number[] } | null>(null);

    // Mock Gamification (To be made dynamic later)
    const streak = 5;
    const badges = [
        { name: "Zone Master", icon: "🏆", desc: "7 Giorni Perfetti" },
        { name: "Mattiniero", icon: "🌅", desc: "5 Colazioni Loggate" },
        { name: "Chef", icon: "👨‍🍳", desc: "3 Pasti Custom" }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/trends');
                const data = await res.json();
                if (data.labels) {
                    setChartData(data);
                }
            } catch (e) {
                console.error("Failed to load trends", e);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="p-8 space-y-8 bg-background min-h-full animate-in fade-in duration-500 text-foreground">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black gradient-text tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Bentornato, {session?.user?.username || 'Marco'}. Ecco il riepilogo della tua nutrizione.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full border border-secondary/20 font-bold text-sm shadow-sm">
                        <Flame className="w-4 h-4 text-secondary fill-secondary" />
                        <span>Streak: {streak} Giorni!</span>
                    </div>
                    <Link href="/calculator">
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-md hover:shadow-glow-lg transition-all rounded-full neon-glow">
                            <Utensils className="mr-2 h-4 w-4" /> Nuovo Pasto
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Gamification Badges (Mobile/Tablet Friendly) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {badges.map((badge, i) => (
                    <div key={i} className="glass-premium p-4 rounded-xl flex items-center gap-4 hover:shadow-glow-sm transition-all cursor-default group">
                        <div className="text-2xl bg-secondary/10 p-3 rounded-lg group-hover:scale-110 transition-transform">{badge.icon}</div>
                        <div>
                            <div className="font-bold text-foreground text-sm">{badge.name}</div>
                            <div className="text-xs text-muted-foreground">{badge.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Daily News Section */}
            <div className="mb-6">
                <DailyNews />
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/calculator" className="group">
                    <div className="glass-premium p-6 rounded-2xl border border-border/50 hover:border-primary/50 hover:shadow-glow-md transition-all h-full">
                        <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform neon-glow">
                            <Calculator className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-1">Crea Pasto</h3>
                        <p className="text-sm text-muted-foreground">Calcola i blocchi e crea piatti bilanciati.</p>
                    </div>
                </Link>

                <Link href="/meals" className="group">
                    <div className="glass-premium p-6 rounded-2xl border border-border/50 hover:border-primary/50 hover:shadow-glow-md transition-all h-full">
                        <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <UtensilsCrossed className="w-6 h-6 text-indigo-500" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-1">I Miei Pasti</h3>
                        <p className="text-sm text-muted-foreground">Gestisci la tua raccolta di ricette salvate.</p>
                    </div>
                </Link>

                <Link href="/reports" className="group">
                    <div className="glass-premium p-6 rounded-2xl border border-border/50 hover:border-primary/50 hover:shadow-glow-md transition-all h-full">
                        <div className="bg-green-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Activity className="w-6 h-6 text-green-500" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground mb-1">Report & Progressi</h3>
                        <p className="text-sm text-muted-foreground">Monitora peso e aderenza ai blocchi.</p>
                    </div>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Blocchi Oggi"
                    value={chartData && chartData.blockData.length > 0 ? chartData.blockData[chartData.blockData.length - 1].toFixed(1) : "N/A"}
                    label="/ 17.0 Target"
                    icon={Activity}
                    trend="Ultimo Check"
                    trendPositive={true}
                    color="text-primary"
                    bg="bg-primary/10"
                />
                <StatsCard
                    title="Peso Attuale"
                    value={chartData && chartData.weightData.length > 0 ? `${chartData.weightData[chartData.weightData.length - 1]}kg` : "N/A"}
                    label="Target: 70kg"
                    icon={Utensils}
                    trend={chartData ? "Aggiornato" : "No Data"}
                    trendPositive={true}
                    color="text-orange-500"
                    bg="bg-orange-500/10"
                />
                <StatsCard
                    title="Idratazione"
                    value="1.2L"
                    label="2.5L Obiettivo"
                    icon={Droplets}
                    trend="-0.5L vs media"
                    trendPositive={false}
                    color="text-cyan-500"
                    bg="bg-cyan-500/10"
                />
                <StatsCard
                    title="Calorie Stim."
                    value="1,450"
                    label="Totale Oggi"
                    icon={Flame}
                    trend="In Linea"
                    trendPositive={true}
                    color="text-red-500"
                    bg="bg-red-500/10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 glass-premium rounded-2xl p-6 shadow-glass border border-border/50">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-bold text-foreground text-lg">Analisi ZoneTrend</h3>
                            <p className="text-xs text-muted-foreground">Peso & Consistenza Blocchi</p>
                        </div>
                    </div>

                    <div className="h-72 w-full flex items-end justify-between gap-3 px-2 pb-6 border-b border-border overflow-x-auto">
                        {chartData ? chartData.weightData.slice(-12).map((h, i) => (
                            <div key={i} className="relative w-full h-full flex items-end group">
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-border">
                                    {chartData.labels[i]}: {h}kg
                                </div>
                                <div
                                    className="w-full bg-gradient-to-t from-primary/20 to-primary/50 rounded-t-lg transition-all duration-500 group-hover:from-primary/40 group-hover:to-primary/70 neon-glow"
                                    style={{ height: `${Math.max(10, (h - 50) * 2)}%` }}
                                ></div>
                            </div>
                        )) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">Caricamento Dati...</div>
                        )}
                    </div>
                </div>

                {/* Quick Meals / Recents */}
                <div className="glass-premium rounded-2xl p-6 shadow-glass border border-border/50 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-foreground text-lg">Pasti Recenti</h3>
                        <Link href="/meals">
                            <Button variant="ghost" className="text-xs text-primary h-auto p-0 hover:bg-transparent">Vedi Tutti</Button>
                        </Link>
                    </div>

                    {/* Dynamic Recent Meals Component */}
                    <RecentMeals />

                    <Link href="/calculator" className="w-full mt-6">
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            + Aggiungi Pasto
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, label, icon: Icon, trend, trendPositive, color, bg }: any) {
    return (
        <div className="glass-premium rounded-2xl p-5 shadow-glass border border-border/50 relative overflow-hidden group hover:border-primary/30 hover:shadow-glow-sm transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300 neon-glow`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trendPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trendPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1 opacity-80">{title}</div>
                <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">{value}</div>
                    <div className="text-xs text-muted-foreground font-medium">{label}</div>
                </div>
            </div>
        </div>
    )
}

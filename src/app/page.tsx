'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Activity, Trophy, Search, Utensils } from "lucide-react";
import { DailyNews } from "@/components/dashboard/DailyNews";
import { RecentMeals } from "@/components/dashboard/RecentMeals";
import { StatCard } from "@/components/ui/stat-card";

import { useLanguage } from '@/lib/language-context';

export default function Home() {
    const { data: session } = useSession();
    const { t } = useLanguage();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [chartData, setChartData] = useState<{ labels: string[], weightData: number[], blockData: number[] } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/trends');
                const data = await res.json();
                if (data.labels) setChartData(data);
            } catch (e) {
                console.error("Failed to load trends", e);
            }
        }
        fetchData();
    }, []);

    const userFirstName = session?.user?.username?.split(' ')[0] || 'ZoneAthlete';

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto animate-in-up">

            {/* 1. Header & Quick Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        {t('dashboard.greeting')}, <span className="text-primary">{userFirstName}</span>.
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        {t('dashboard.subtitle')}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/calculator">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button size="lg" className="rounded-full px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                                <Plus className="w-5 h-5 mr-2" /> {t('dashboard.new_meal')}
                            </Button>
                        </motion.div>
                    </Link>
                </div>
            </div>

            {/* 2. Stats Grid (Command Center) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label={t('dashboard.daily_blocks')}
                    value="12.5"
                    trend="+1.5 vs avg"
                    trendUp={true}
                    icon={<Activity className="w-5 h-5" />}
                />
                <StatCard
                    label={t('dashboard.streak')}
                    value={`5 ${t('dashboard.days')}`}
                    trend={t('dashboard.keep_it_up')}
                    trendUp={true}
                    icon={<Trophy className="w-5 h-5 text-yellow-500" />}
                />
                <StatCard
                    label={t('dashboard.weight_trend')}
                    value="74.2 kg"
                    trend="-0.4 kg"
                    trendUp={true}
                    icon={<Activity className="w-5 h-5" />}
                />
                <StatCard
                    label={t('dashboard.next_goal')}
                    value="73.5 kg"
                    trend={t('dashboard.within_days')}
                    trendUp={true}
                    icon={<Trophy className="w-5 h-5" />}
                />
            </div>

            {/* 3. Main Actions & Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Main Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/calculator" className="group">
                            <div className="glass-card hover:bg-primary/5 border-primary/20 p-6 rounded-2xl h-full transition-all duration-300 hover:shadow-lg hover:border-primary/40 flex flex-col justify-between min-h-[160px]">
                                <div className="p-3 bg-background rounded-xl w-fit shadow-sm border border-border group-hover:scale-110 transition-transform">
                                    <Utensils className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{t('dashboard.meal_builder_title')}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{t('dashboard.meal_builder_desc')}</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/foods" className="group">
                            <div className="glass-card hover:bg-secondary/20 p-6 rounded-2xl h-full transition-all duration-300 hover:shadow-lg hover:border-border/80 flex flex-col justify-between min-h-[160px]">
                                <div className="p-3 bg-background rounded-xl w-fit shadow-sm border border-border group-hover:scale-110 transition-transform">
                                    <Search className="w-6 h-6 text-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{t('dashboard.food_db_title')}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{t('dashboard.food_db_desc')}</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Recent Activity */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">{t('dashboard.recent_meals')}</h3>
                            <Link href="/meals" className="text-sm text-primary font-medium hover:underline">{t('dashboard.view_all')}</Link>
                        </div>
                        <RecentMeals />
                    </div>
                </div>

                {/* Right Col: News & Insights */}
                <div className="space-y-6">
                    <DailyNews />

                    {/* Placeholder for future specific insights */}
                    <div className="glass-panel p-6 rounded-2xl border-dashed border-2 border-border/50 flex flex-col items-center justify-center text-center space-y-2 py-10 opacity-60">
                        <div className="p-3 bg-muted rounded-full">
                            <Activity className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">{t('dashboard.insights')}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}

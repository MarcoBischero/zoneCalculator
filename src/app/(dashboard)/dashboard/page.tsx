'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, Variants } from "framer-motion";
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

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto pb-32 lg:pb-10"
        >

            {/* 1. Header & Quick Action */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                        {t('dashboard.greeting')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{userFirstName}</span>.
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg lg:text-xl max-w-2xl">
                        {t('dashboard.subtitle')}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/calculator">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary rounded-full px-8 py-6 text-lg shadow-xl shadow-primary/25 flex items-center gap-2"
                        >
                            <Plus className="w-6 h-6" /> {t('dashboard.new_meal')}
                        </motion.button>
                    </Link>
                </div>
            </motion.div>

            {/* 2. Stats Grid (Command Center) */}
            <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                    icon={<Trophy className="w-5 h-5 text-amber-500" />}
                />
                <StatCard
                    label={t('dashboard.weight_trend')}
                    value={`${chartData?.weightData?.[chartData.weightData.length - 1] || session?.user?.weight || 0} kg`}
                    trend={`${chartData?.weightData?.length > 1 ? (chartData.weightData[chartData.weightData.length - 1] - chartData.weightData[chartData.weightData.length - 2]).toFixed(1) : 0} kg`}
                    trendUp={false}
                    icon={<Activity className="w-5 h-5 text-indigo-500" />}
                />
                <StatCard
                    label={t('dashboard.next_goal')}
                    value="73.5 kg"
                    trend={t('dashboard.within_days')}
                    trendUp={true}
                    icon={<Trophy className="w-5 h-5" />}
                />
            </motion.div>

            {/* 3. Main Actions & Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Main Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/calculator" className="group">
                            <motion.div variants={itemVariants} className="glass-card hover:bg-primary/5 border-primary/20 p-6 rounded-3xl h-full transition-all duration-300 hover:shadow-lg hover:border-primary/40 flex flex-col justify-between min-h-[180px]">
                                <div className="p-4 bg-background rounded-2xl w-fit shadow-sm border border-border group-hover:scale-110 transition-transform">
                                    <Utensils className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">{t('dashboard.meal_builder_title')}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t('dashboard.meal_builder_desc')}</p>
                                </div>
                            </motion.div>
                        </Link>

                        <Link href="/foods" className="group">
                            <motion.div variants={itemVariants} className="glass-card hover:bg-secondary/20 p-6 rounded-3xl h-full transition-all duration-300 hover:shadow-lg hover:border-border/80 flex flex-col justify-between min-h-[180px]">
                                <div className="p-4 bg-background rounded-2xl w-fit shadow-sm border border-border group-hover:scale-110 transition-transform">
                                    <Search className="w-8 h-8 text-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">{t('dashboard.food_db_title')}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t('dashboard.food_db_desc')}</p>
                                </div>
                            </motion.div>
                        </Link>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                {t('dashboard.recent_meals')}
                            </h3>
                            <Link href="/meals" className="text-sm text-primary font-medium hover:underline">{t('dashboard.view_all')}</Link>
                        </div>
                        <RecentMeals />
                    </motion.div>
                </div>

                {/* Right Col: News & Insights */}
                <motion.div variants={containerVariants} className="space-y-6">
                    <motion.div variants={itemVariants}>
                        <DailyNews />
                    </motion.div>

                    {/* Placeholder for future specific insights */}
                    <motion.div variants={itemVariants} className="glass-panel p-8 rounded-3xl border-dashed border-2 border-border/50 flex flex-col items-center justify-center text-center space-y-4 py-12 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="p-4 bg-muted rounded-full animate-pulse-subtle">
                            <Activity className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-base font-medium">{t('dashboard.insights')}</p>
                            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                        </div>
                    </motion.div>
                </motion.div>

            </div>
        </motion.div>
    );
}

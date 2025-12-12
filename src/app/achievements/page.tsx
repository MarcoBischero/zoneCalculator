'use client';

import { Trophy, Medal, Star, Target, Zap, Crown } from 'lucide-react';

export default function AchievementsPage() {
    const achievements = [
        {
            id: 1,
            title: "Zone Starter",
            description: "Completed your first balanced meal",
            icon: Trophy,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            unlocked: true,
            date: "2024-05-15"
        },
        {
            id: 2,
            title: "Protein Pro",
            description: "Hit protein targets for 7 days straight",
            icon: Medal,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            unlocked: true,
            date: "2024-05-20"
        },
        {
            id: 3,
            title: "Master Chef",
            description: "Created 50 custom meals",
            icon: Crown,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            unlocked: false,
            progress: 34
        },
        {
            id: 4,
            title: "Consistent Zoner",
            description: "Logged meals for 30 consecutive days",
            icon: Target,
            color: "text-green-500",
            bg: "bg-green-500/10",
            unlocked: false,
            progress: 12
        },
        {
            id: 5,
            title: "Precision",
            description: "Achieved perfect block balance in a meal",
            icon: Star,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            unlocked: true,
            date: "2024-05-18"
        },
        {
            id: 6,
            title: "Speed Demon",
            description: "Created a meal in under 30 seconds",
            icon: Zap,
            color: "text-red-500",
            bg: "bg-red-500/10",
            unlocked: false
        }
    ];

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
                <p className="text-muted-foreground">Track your progress and unlock rewards as you master the Zone Diet.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {achievements.map((achievement) => (
                    <div
                        key={achievement.id}
                        className={`glass-card p-6 rounded-2xl border transition-all hover:scale-[1.02] relative overflow-hidden ${achievement.unlocked
                            ? 'border-primary/20 bg-white/60 dark:bg-white/5 shadow-lg shadow-primary/5'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 opacity-80'
                            }`}
                    >
                        {/* Lock Overlay for Locked Items */}
                        {!achievement.unlocked && (
                            <div className="absolute top-2 right-2 flex items-center justify-center">
                                {/* Optional: Lock icon visual if desired, or keep clean */}
                            </div>
                        )}

                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${achievement.unlocked ? achievement.bg : 'bg-slate-200 dark:bg-slate-800'}`}>
                                <achievement.icon className={`w-6 h-6 ${achievement.unlocked ? achievement.color : 'text-slate-400'}`} />
                            </div>
                            {achievement.unlocked ? (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900">
                                    UNLOCKED
                                </span>
                            ) : (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700">
                                    LOCKED
                                </span>
                            )}
                        </div>

                        <h3 className="font-semibold text-lg mb-1">{achievement.title}</h3>
                        <p className={`text-sm leading-relaxed mb-4 ${achievement.unlocked ? 'text-muted-foreground' : 'text-slate-500 dark:text-slate-400'}`}>
                            {achievement.description}
                        </p>

                        {!achievement.unlocked && achievement.progress !== undefined && (
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Progress</span>
                                    <span>{achievement.progress}/50</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{ width: `${(achievement.progress / 50) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {achievement.unlocked && achievement.date && (
                            <div className="text-xs text-muted-foreground font-mono">
                                Unlocked on {achievement.date}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

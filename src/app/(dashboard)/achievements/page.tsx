'use client';

import { Trophy, Medal, Star, Target, Zap, Crown } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export default function AchievementsPage() {
    const { t } = useLanguage();

    const achievements = [
        {
            id: 1,
            title: t('achievements.cards.starter_title'),
            description: t('achievements.cards.starter_desc'),
            icon: Trophy,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            unlocked: true,
            date: "2024-05-15"
        },
        {
            id: 2,
            title: t('achievements.cards.protein_title'),
            description: t('achievements.cards.protein_desc'),
            icon: Medal,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            unlocked: true,
            date: "2024-05-20"
        },
        {
            id: 3,
            title: t('achievements.cards.master_title'),
            description: t('achievements.cards.master_desc'),
            icon: Crown,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            unlocked: false,
            progress: 34
        },
        {
            id: 4,
            title: t('achievements.cards.consistent_title'),
            description: t('achievements.cards.consistent_desc'),
            icon: Target,
            color: "text-green-500",
            bg: "bg-green-500/10",
            unlocked: false,
            progress: 12
        },
        {
            id: 5,
            title: t('achievements.cards.precision_title'),
            description: t('achievements.cards.precision_desc'),
            icon: Star,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            unlocked: true,
            date: "2024-05-18"
        },
        {
            id: 6,
            title: t('achievements.cards.speed_title'),
            description: t('achievements.cards.speed_desc'),
            icon: Zap,
            color: "text-red-500",
            bg: "bg-red-500/10",
            unlocked: false
        }
    ];

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('achievements.title')}</h1>
                <p className="text-muted-foreground">{t('achievements.subtitle')}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {achievements.map((achievement) => (
                    <div
                        key={achievement.id}
                        className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] relative overflow-hidden ${achievement.unlocked
                            ? 'glass-card border-border/50 bg-card/50 shadow-lg shadow-primary/5'
                            : 'bg-muted/20 border-border/50 grayscale opacity-80'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${achievement.unlocked ? achievement.bg : 'bg-muted'}`}>
                                <achievement.icon className={`w-6 h-6 ${achievement.unlocked ? achievement.color : 'text-muted-foreground'}`} />
                            </div>
                            {achievement.unlocked ? (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                    {t('achievements.unlocked')}
                                </span>
                            ) : (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                                    {t('achievements.locked')}
                                </span>
                            )}
                        </div>

                        <h3 className={`font-semibold text-lg mb-1 ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{achievement.title}</h3>
                        <p className="text-sm leading-relaxed mb-4 text-muted-foreground">
                            {achievement.description}
                        </p>

                        {!achievement.unlocked && achievement.progress !== undefined && (
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{t('achievements.progress')}</span>
                                    <span>{achievement.progress}/50</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary/50 transition-all duration-500"
                                        style={{ width: `${(achievement.progress / 50) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {achievement.unlocked && achievement.date && (
                            <div className="text-xs text-muted-foreground font-mono">
                                {t('achievements.unlocked_on')} {achievement.date}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
